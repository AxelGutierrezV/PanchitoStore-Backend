const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.createClient = async (req, res) => {
    try {
        const { nombre, email, telefono, password } = req.body;

        const existing = await pool.query(
            `SELECT * FROM clientes WHERE email = $1`,
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                error: 'Cliente ya existe'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO clientes (nombre, email, telefono, password)
             VALUES ($1, $2, $3, $4)
             RETURNING id, nombre, email`,
            [nombre, email, telefono, hashedPassword]
        );

        res.json({
            message: 'Cliente registrado correctamente',
            client: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al crear cliente'
        });
    }
};

exports.loginClient = async (req, res) => {
    console.log("intento de login", req.body.email);

    try {
        const { email, password } = req.body;

        const result = await pool.query(
            `SELECT * FROM clientes WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Cliente no encontrado'
            });
        }

        const client = result.rows[0];

        const valid = await bcrypt.compare(password, client.password);

        if (!valid) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        const token = jwt.sign(
            {
                clientId: client.id,
                type: 'CLIENT'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            client: {
                id: client.id,
                nombre: client.nombre
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error en login'
        });
    }
};

exports.getClientById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM clientes WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener cliente'
        });
    }
};

exports.getAllClients = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM clientes WHERE activo = TRUE`
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener clientes'
        });
    }
};

exports.updateClient = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      nombre,
      email,
      telefono,
      activo
    } = req.body;

    const result = await pool.query(
      `
      UPDATE clientes
      SET
        nombre = $1,
        email = $2,
        telefono = $3,
        activo = $4
      WHERE id = $5
      RETURNING *
      `,
      [
        nombre,
        email,
        telefono,
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
      error: "Error actualizando cliente"
    });
  }
};

exports.changePassword = async (req, res) => {

  try {

    const {
      client_id,
      currentPassword,
      newPassword
    } = req.body;

    const result = await pool.query(
      `
      SELECT *
      FROM clientes
      WHERE id = $1
      `,
      [client_id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: "Cliente no encontrado"
      });

    }

    const client = result.rows[0];

    const validPassword =
      await bcrypt.compare(
        currentPassword,
        client.password
      );

    if (!validPassword) {

      return res.status(400).json({
        error: "Contraseña actual incorrecta"
      });

    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    await pool.query(
      `
      UPDATE clientes
      SET password = $1
      WHERE id = $2
      `,
      [
        hashedPassword,
        client_id
      ]
    );

    res.json({
      message:
        "Contraseña actualizada"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error:
        "Error cambiando contraseña"
    });

  }

};

exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE clientes
             SET activo = FALSE
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
            });
        }

        res.json({
            message: 'Cliente desactivado'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar cliente'
        });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const { id } = req.params; // cliente_id
        const { direccion, ciudad, referencia, principal } = req.body;

        const result = await pool.query(
            `INSERT INTO direcciones (cliente_id, direccion, ciudad, referencia, principal)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [id, direccion, ciudad, referencia, principal]
        );

        res.json({
            message: 'Dirección agregada',
            address: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al agregar dirección'
        });
    }
};

exports.getAddresses = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM direcciones
             WHERE cliente_id = $1`,
            [id]
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener direcciones'
        });
    }
};

