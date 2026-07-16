const pool = require('../config/db');

exports.createCategory = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const result = await pool.query(
            `INSERT INTO categorias (nombre, descripcion)
             VALUES ($1, $2)
             RETURNING *`,
            [nombre, descripcion]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM categorias WHERE activo = TRUE`
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM categorias WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Categoría no encontrada'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener categoría' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const result = await pool.query(
            `UPDATE categorias
             SET nombre = $1, descripcion = $2
             WHERE id = $3
             RETURNING *`,
            [nombre, descripcion, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Categoría no encontrada'
            });
        }

        res.json({
            message: 'Categoría actualizada',
            category: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE categorias
             SET activo = FALSE
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Categoría no encontrada'
            });
        }

        res.json({
            message: 'Categoría desactivada'
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
};

