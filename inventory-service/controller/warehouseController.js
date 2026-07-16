const pool = require('../config/db');

exports.createWarehouse = async (req, res) => {
    try {
        const { nombre, ubicacion } = req.body;

        if (!nombre || !ubicacion) {
            return res.status(400).json({
                error: 'nombre y ubicacion son obligatorios'
            });
        }

        const result = await pool.query(
            `INSERT INTO warehouses (nombre, ubicacion)
             VALUES ($1, $2)
             RETURNING *`,
            [nombre, ubicacion]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error creando warehouse'
        });
    }
};

exports.getWarehouses = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM warehouses`
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            error: 'Error obteniendo warehouses'
        });
    }
};

exports.getWarehouseById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM warehouses WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Warehouse no encontrado'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({
            error: 'Error obteniendo warehouse'
        });
    }
};
