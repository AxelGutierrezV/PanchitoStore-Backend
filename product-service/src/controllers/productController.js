const pool = require('../config/db');
const axios = require("axios");

exports.createProduct = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            nombre,
            descripcion,
            precio,
            categoria_id
        } = req.body;

        await client.query("BEGIN");

        const result = await client.query(
            `INSERT INTO productos
            (nombre, descripcion, precio, categoria_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [nombre, descripcion, precio, categoria_id]
        );

        const product = result.rows[0];

        await axios.post(
            `${process.env.INVENTORY_SERVICE_URL}/api/inventory/register-product`,
            {
                producto_id: product.id
            }
        );

        await client.query("COMMIT");

        res.json(product);

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            error: "Error creando producto"
        });

    } finally {
        client.release();
    }
};

exports.getAllProducts = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        p.*,

        pr.id AS promotion_id,
        pr.nombre AS promotion_name,
        pr.tipo AS promotion_type,
        pr.valor AS promotion_value

      FROM productos p

      LEFT JOIN promotion_products pp
        ON pp.product_id = p.id

      LEFT JOIN promotions pr
        ON pr.id = pp.promotion_id
        AND pr.activo = true
        AND pr.requiere_codigo = false
        AND CURRENT_TIMESTAMP
            BETWEEN
            pr.fecha_inicio
            AND
            pr.fecha_fin
    `);

    const products =
      result.rows.map(product => {

        let precioFinal =
          Number(product.precio);

        const valorPromocion =
          Number(product.promotion_value);

        if (product.promotion_id) {

          if (
            product.promotion_type ===
            "PORCENTAJE"
          ) {

            precioFinal =
              precioFinal -
              (
                precioFinal *
                valorPromocion
              ) / 100;

          }

          if (
            product.promotion_type ===
            "MONTO"
          ) {

            precioFinal =
              precioFinal -
              valorPromocion;

          }

          if (precioFinal < 0) {
            precioFinal = 0;
          }

        }

        return {

          ...product,

          precio_final:
            Number(
              precioFinal.toFixed(2)
            ),

          promocion:
            product.promotion_id
              ? {
                  id:
                    product.promotion_id,

                  nombre:
                    product.promotion_name,

                  tipo:
                    product.promotion_type,

                  valor:
                    valorPromocion
                }
              : null

        };

      });

    res.json(products);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error:
        "Error al obtener productos"
    });

  }

};
exports.getAllActiveProducts = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                c.nombre AS categoria,
                p.activo,

                pr.id AS promotion_id,
                pr.nombre AS promotion_name,
                pr.tipo AS promotion_type,
                pr.valor AS promotion_value

            FROM productos p

            JOIN categorias c
                ON p.categoria_id = c.id

            LEFT JOIN promotion_products pp
                ON pp.product_id = p.id

            LEFT JOIN promotions pr
                ON pr.id = pp.promotion_id
                AND pr.activo = true
                AND pr.requiere_codigo = false
                AND CURRENT_TIMESTAMP
                    BETWEEN
                    pr.fecha_inicio
                    AND
                    pr.fecha_fin

            WHERE p.activo = true

            ORDER BY p.id ASC
        `);

        const products =
            result.rows.map(product => {

                let precioFinal =
                    Number(product.precio);

                const valorPromocion =
                    Number(
                        product.promotion_value
                    );

                if (product.promotion_id) {

                    if (
                        product.promotion_type ===
                        "PORCENTAJE"
                    ) {

                        precioFinal =
                            precioFinal -
                            (
                                precioFinal *
                                valorPromocion
                            ) / 100;

                    }

                    if (
                        product.promotion_type ===
                        "MONTO"
                    ) {

                        precioFinal =
                            precioFinal -
                            valorPromocion;

                    }

                }

                return {

                    ...product,

                    precio_final:
                        Number(
                            precioFinal.toFixed(2)
                        ),

                    promocion:
                        product.promotion_id
                            ? {
                                id:
                                    product.promotion_id,

                                nombre:
                                    product.promotion_name,

                                tipo:
                                    product.promotion_type,

                                valor:
                                    valorPromocion
                            }
                            : null

                };

            });

        res.json(products);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error al obtener productos"
        });

    }

};
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `      SELECT
        p.*,

        pr.id AS promotion_id,
        pr.nombre AS promotion_name,
        pr.tipo AS promotion_type,
        pr.valor AS promotion_value

      FROM productos p

      LEFT JOIN promotion_products pp
        ON pp.product_id = p.id

      LEFT JOIN promotions pr
        ON pr.id = pp.promotion_id
        AND pr.activo = true
        AND pr.requiere_codigo = false
        AND CURRENT_TIMESTAMP
            BETWEEN
            pr.fecha_inicio
            AND
            pr.fecha_fin
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria_id } = req.body;

        const result = await pool.query(
            `UPDATE productos
             SET nombre = $1,
                 descripcion = $2,
                 precio = $3,
                 categoria_id = $4
             WHERE id = $5
             RETURNING *`,
            [nombre, descripcion, precio, categoria_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.json({
            message: 'Producto actualizado correctamente',
            product: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al actualizar producto'
        });
    }
};

exports.updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE productos
             SET activo = NOT activo
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.json({
            message: 'Estado del producto actualizado',
            product: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error actualizando estado del producto'
        });
    }
};
