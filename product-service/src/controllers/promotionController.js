const pool = require('../config/db');
const axios = require("axios");

exports.getPromotions = async (req, res) => {

    try {

        const result =
            await pool.query(`
SELECT
    p.*,
    COUNT(pp.product_id)
      AS product_count
FROM promotions p
LEFT JOIN promotion_products pp
    ON p.id = pp.promotion_id
GROUP BY p.id
ORDER BY p.id DESC;
        `);

        res.json(
            result.rows
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error obteniendo promociones"
        });

    }

};

exports.getPromotionById = async (req, res) => {

    try {

        const { id } =
            req.params;

        const result =
            await pool.query(
                `
          SELECT *
          FROM promotions
          WHERE id = $1
          `,
                [id]
            );

        if (
            result.rows.length === 0
        ) {

            return res.status(404)
                .json({
                    error:
                        "Promoción no encontrada"
                });

        }

        res.json(
            result.rows[0]
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error obteniendo promoción"
        });

    }

};

exports.changeStatus = async (req, res) => {

    try {

        const { id } =
            req.params;

        const { activo } =
            req.body;

        const result =
            await pool.query(
                `
        UPDATE promotions
        SET activo = $1
        WHERE id = $2
        RETURNING *
        `,
                [
                    activo,
                    id
                ]
            );

        res.json(
            result.rows[0]
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error actualizando estado"
        });

    }

};

exports.createPromotion = async (req, res) => {

    try {

        const {
            nombre,
            tipo,
            valor,
            requiere_codigo,
            codigo,
            fecha_inicio,
            fecha_fin
        } = req.body;

        const result =
            await pool.query(
                `
          INSERT INTO promotions
          (
            nombre,
            tipo,
            valor,
            requiere_codigo,
            codigo,
            fecha_inicio,
            fecha_fin
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )
          RETURNING *
          `,
                [
                    nombre,
                    tipo,
                    valor,
                    requiere_codigo,
                    codigo,
                    fecha_inicio,
                    fecha_fin
                ]
            );

        res.status(201).json(
            result.rows[0]
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error creando promoción"
        });

    }

};

exports.updatePromotion = async (req, res) => {
    try {
        const { id } =
            req.params;

        const {
            nombre,
            tipo,
            valor,
            requiere_codigo,
            codigo,
            fecha_inicio,
            fecha_fin
        } = req.body;

        const result =
            await pool.query(
                `
          UPDATE promotions
          SET
            nombre = $1,
            tipo = $2,
            valor = $3,
            requiere_codigo = $4,
            codigo = $5,
            fecha_inicio = $6,
            fecha_fin = $7
          WHERE id = $8
          RETURNING *
          `,
                [
                    nombre,
                    tipo,
                    valor,
                    requiere_codigo,
                    codigo,
                    fecha_inicio,
                    fecha_fin,
                    id
                ]
            );

        res.json(
            result.rows[0]
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error actualizando promoción"
        });

    }

};

exports.assignProducts = async (req, res) => {

    try {

        const { id } =
            req.params;

        const { products } =
            req.body;

        for (const productId of products) {

            const existing =
                await pool.query(
                    `
    SELECT 1
    FROM promotion_products
    WHERE product_id = $1
    `,
                    [productId]
                );

            if (existing.rows.length > 0) {

                return res.status(400).json({
                    error:
                        `El producto ${productId} ya tiene una promoción asignada`
                });

            }

            await pool.query(
                `
          INSERT INTO
          promotion_products
          (
            promotion_id,
            product_id
          )
          VALUES
          (
            $1,
            $2
          )
          `,
                [
                    id,
                    productId
                ]
            );

        }

        res.json({
            success: true
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error asociando productos"
        });

    }

};

exports.replaceProducts = async (req, res) => {

    try {

        const { id } =
            req.params;

        const { products } =
            req.body;

        await pool.query(
            `
        DELETE FROM
        promotion_products
        WHERE promotion_id = $1
        `,
            [id]
        );

        for (const productId of products) {

            await pool.query(
                `
          INSERT INTO
          promotion_products
          (
            promotion_id,
            product_id
          )
          VALUES
          (
            $1,
            $2
          )
          `,
                [
                    id,
                    productId
                ]
            );

        }

        res.json({
            success: true
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error actualizando productos"
        });

    }

};

exports.getPromotionProducts = async (req, res) => {

    try {

        const { id } =
            req.params;

        const result =
            await pool.query(
                `
          SELECT
            pp.product_id,
            p.nombre
          FROM promotion_products pp
          JOIN productos p
            ON pp.product_id = p.id
          WHERE pp.promotion_id = $1
          ORDER BY p.nombre
          `,
                [id]
            );

        res.json(
            result.rows
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error obteniendo productos"
        });

    }

};

exports.deletePromotion = async (req, res) => {

    try {

        const { id } =
            req.params;

        await pool.query(
            `
        DELETE FROM promotions
        WHERE id = $1
        `,
            [id]
        );

        res.json({
            success: true
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error eliminando promoción"
        });

    }

};

exports.validateCoupon = async (req, res) => {

    try {

        const { code } = req.body;

        const result = await pool.query(
            `
            SELECT *
            FROM promotions
            WHERE codigo = $1
              AND activo = true
              AND requiere_codigo = true
              AND CURRENT_TIMESTAMP
                  BETWEEN fecha_inicio
                  AND fecha_fin
            `,
            [code]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Cupón inválido"
            });

        }

        const promotion =
            result.rows[0];

        const productsResult =
            await pool.query(
                `
                SELECT product_id
                FROM promotion_products
                WHERE promotion_id = $1
                `,
                [promotion.id]
            );

        res.json({

            ...promotion,

            products:
                productsResult.rows.map(
                    row => row.product_id
                )

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error validando cupón"
        });

    }

};