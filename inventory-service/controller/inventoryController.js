const pool = require('../config/db');

exports.createInventory = async (req, res) => {
    const { producto_id, warehouse_id, stock } = req.body;

    const result = await pool.query(
        `INSERT INTO inventory (producto_id, warehouse_id, stock)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [producto_id, warehouse_id, stock]
    );

    res.json(result.rows[0]);
};

exports.get_full_stock = async (req, res) => {
    try {
        const result = await pool.query(
            `select producto_id, sum(stock) as sum from inventory i 
        group by i.producto_id
        order by i.producto_id`
        );
        res.json(result.rows);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error obteniendo stock completo" });
    }
};

exports.getStockbyID = async (req, res) => {
    try {
        const { producto_id } = req.params;

        const result = await pool.query(
            `SELECT * FROM inventory WHERE producto_id = $1`,
            [producto_id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error obteniendo stock especifico" });
    }
};

exports.reduceStock = async (req, res) => {
    const { producto_id, cantidad } = req.body;

    const result = await pool.query(
        `SELECT * FROM inventory
         WHERE producto_id = $1 AND stock >= $2
         ORDER BY stock DESC
         LIMIT 1`,
        [producto_id, cantidad]
    );

    const inventory = result.rows[0];

    if (!inventory) {
        return res.status(400).json({
            error: 'No hay stock suficiente en ningún almacén'
        });
    }

    await pool.query('BEGIN');

    await pool.query(
        `UPDATE inventory
         SET stock = stock - $1
         WHERE id = $2`,
        [cantidad, inventory.id]
    );

    await pool.query(
        `INSERT INTO inventory_movements
         (producto_id, warehouse_id, tipo, cantidad)
         VALUES ($1, $2, 'OUT', $3)`,
        [producto_id, inventory.warehouse_id, cantidad]
    );

    await pool.query('COMMIT');

    res.json({
        message: 'Stock reducido',
        warehouse: inventory.warehouse_id
    });
};

exports.reduceOrderStock = async (req, res) => {
    try {


        const { items, orderId, orderCode } = req.body;


        if (!items || items.length === 0) {
            return res.status(400).json({
                error: "No se recibieron productos"
            });
        }

        await pool.query("BEGIN");

        const allocations = [];

        // ✅ Primero validar TODOS los productos
        for (const item of items) {

            const result = await pool.query(
                `SELECT *
                 FROM inventory
                 WHERE producto_id = $1
                 AND stock >= $2
                 ORDER BY stock DESC
                 LIMIT 1`,
                [
                    item.producto_id,
                    item.cantidad
                ]
            );

            const inventory = result.rows[0];

            if (!inventory) {

                await pool.query("ROLLBACK");

                return res.status(400).json({
                    error: `Stock insuficiente para producto ${item.producto_id}`
                });

            }

            allocations.push({
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                inventory
            });
        }

        // ✅ Si todos tienen stock, recién descontamos
        for (const allocation of allocations) {

            await pool.query(
                `UPDATE inventory
                 SET stock = stock - $1
                 WHERE id = $2`,
                [
                    allocation.cantidad,
                    allocation.inventory.id
                ]
            );

            await pool.query(
                `
    INSERT INTO inventory_movements
    (
        producto_id,
        warehouse_id,
        tipo,
        motivo,
        referencia,
        cantidad
    )
    VALUES
    (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
    )
    `,
                [
                    allocation.producto_id,
                    allocation.inventory.warehouse_id,
                    "OUT",
                    "SALE",
                    orderCode
                        ? orderCode
                        : orderId
                            ? `ORD-${orderId}`
                            : "ORD-UNKNOWN",
                    allocation.cantidad
                ]
            );

        }

        await pool.query("COMMIT");

        res.json({
            success: true,
            allocations: allocations.map(a => ({
                producto_id: a.producto_id,
                warehouse_id: a.inventory.warehouse_id
            }))
        });

    } catch (error) {

        await pool.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            error: "Error reduciendo stock"
        });

    }
};

exports.registerProduct = async (req, res) => {
    try {
        const { producto_id } = req.body;

        const warehouses = await pool.query(
            `SELECT id FROM warehouses`
        );

        for (const warehouse of warehouses.rows) {
            await pool.query(
                `INSERT INTO inventory
                (producto_id, warehouse_id, stock)
                VALUES ($1, $2, $3)`,
                [producto_id, warehouse.id, 0]
            );
        }

        res.json({
            message: "Producto registrado en todos los almacenes"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error registrando producto en inventario"
        });
    }
};

exports.checkStock = async (req, res) => {
    try {

        const { producto_id, cantidad } = req.body;

        const result = await pool.query(
            `SELECT COALESCE(SUM(stock),0) as total_stock
             FROM inventory
             WHERE producto_id = $1`,
            [producto_id]
        );

        const stockDisponible =
            Number(result.rows[0].total_stock);

        res.json({
            available: stockDisponible >= cantidad,
            stock: stockDisponible
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error validando stock"
        });

    }
};

exports.getProductStockDetail = async (req, res) => {

    try {

        const { productId } =
            req.params;

        const result =
            await pool.query(
                `
          SELECT
  i.warehouse_id,
  w.nombre,
  SUM(i.stock) AS stock
FROM inventory i
INNER JOIN warehouses w
    ON w.id = i.warehouse_id
WHERE i.producto_id = $1
GROUP BY
    i.warehouse_id,
    w.nombre
ORDER BY
    i.warehouse_id;
          `,
                [productId]
            );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error obteniendo detalle de stock"
        });

    }

};

exports.getMovements = async (
    req,
    res
) => {

    try {

        const result =
            await pool.query(`
SELECT
    id,
    producto_id,
    warehouse_id,
    tipo,
    motivo,
    referencia,
    cantidad,
    fecha
FROM inventory_movements
ORDER BY fecha DESC
      `);

        res.json(
            result.rows
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error obteniendo movimientos"
        });

    }

};