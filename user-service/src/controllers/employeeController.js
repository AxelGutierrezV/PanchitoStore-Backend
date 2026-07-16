const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { configDotenv } = require('dotenv');
const jwt = require('jsonwebtoken');
const logAction = require("../utils/audit");
const JWT_SECRET = process.env.JWT_SECRET;

exports.registerEmployee = async (req, res) => {
    try {
        const { name, email, password, rol_id } = req.body;

        const existing = await pool.query(
            `SELECT * FROM empleados WHERE email = $1`,
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                error: 'Empleado ya existe'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO empleados (nombre, email, password)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [name, email, hashedPassword]
        );

        const empleadoId = result.rows[0].id;

        const roleCheck = await pool.query(
            `SELECT id FROM roles WHERE id = $1`,
            [rol_id]
        );

        if (roleCheck.rows.length === 0) {
            return res.status(400).json({
                error: 'Rol no válido'
            });
        }

        await pool.query(
            `INSERT INTO empleado_rol (empleado_id, rol_id)
             VALUES ($1, $2)`,
            [empleadoId, rol_id]
        );
        console.log({
            suario_id: empleadoId,
            rol: "EMPLEADO",
            accion: "REGISTER_EMPLOYEE",
            detalle: `Empleado ${email} registrado`

        })
        await logAction({
            usuario_id: empleadoId,
            rol: "EMPLEADO",
            accion: "REGISTER_EMPLOYEE",
            detalle: `Empleado ${email} registrado`
        });

        res.json({
            message: 'Empleado registrado correctamente'
        });

    } catch (error) {
        console.error("ERROR REAL:", error);
        res.status(500).json({
            error: 'Error en registro'
        });
    }
};
exports.loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            `SELECT * FROM empleados WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = result.rows[0];

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const rolesResult = await pool.query(
            `SELECT r.nombre 
             FROM roles r
             JOIN empleado_rol ur ON r.id = ur.rol_id
             WHERE ur.empleado_id = $1`,
            [user.id]
        );


        if (rolesResult.rows.length === 0) {
            return res.status(500).json({
                error: "Empleado sin rol asignado"
            });
        }

        const role = rolesResult.rows[0].nombre;


        const token = jwt.sign(
            {
                userId: user.id,
                nombre: user.nombre,
                role
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );


        await logAction({
            usuario_id: user.id,
            rol: role,
            accion: "LOGIN_EMPLOYEE",
            detalle: `Empleado ${user.email} inició sesión`
        });


        res.json({
            token,
            role,
            nombre: user.nombre,
            userId: user.id
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en login' });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const employeeResult = await pool.query(
            `SELECT id, email, activo, fecha_creacion
             FROM empleados
             WHERE id = $1`,
            [id]
        );

        if (employeeResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Empleado no encontrado'
            });
            console.log('Empleado no encontrado');
        }

        const employee = employeeResult.rows[0];

        const rolesResult = await pool.query(
            `SELECT r.nombre
             FROM roles r
             JOIN empleado_rol er ON r.id = er.rol_id
             WHERE er.empleado_id = $1`,
            [id]
        );

        const roles = rolesResult.rows.map(r => r.nombre);

        res.json({
            ...employee,
            roles: roles
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al obtener empleado'
        });
        console.log('Error al obtener empleado')
    }
};

exports.changeSelfPassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        const { currentPassword, newPassword } = req.body;

        const result = await pool.query(
            `SELECT * FROM empleados WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Empleado no encontrado"
            });
        }

        const user = result.rows[0];

        const valid = await bcrypt.compare(currentPassword, user.password);

        if (!valid) {
            return res.status(400).json({
                error: "Contraseña actual incorrecta"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE empleados SET password = $1 WHERE id = $2`,
            [hashedPassword, userId]
        );

        await logAction({
            usuario_id: userId,
            rol: role,
            accion: "CHANGE_PASSWORD",
            detalle: `Empleado ${userId} cambió su contraseña`
        });

        res.json({
            message: "Contraseña actualizada correctamente"
        });

    } catch (error) {
        console.error("ERROR CHANGE PASSWORD:", error);
        res.status(500).json({
            error: "Error al cambiar contraseña"
        });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol_id } = req.body;

        const result = await pool.query(
            `UPDATE empleados
             SET nombre = $1, email = $2
             WHERE id = $3
             RETURNING id, nombre, email`,
            [nombre, email, id]
        );

        await pool.query(
            `UPDATE empleado_rol
             SET rol_id= $1
             WHERE empleado_id = $2`,
            [rol_id, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        await logAction({
            usuario_id: req.employee.userId,
            rol: req.employee.role,
            accion: "UPDATE_USER",
            detalle: `Usuario ${nombre} modificado`
        });

        res.json({
            message: 'Empleado actualizado correctamente',
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar empleado' });
    }
};


exports.getAllEmployees = async (req, res) => {
    try {
        const result = await pool.query(
            `select e.id,e.nombre, e.email, e.activo, r.nombre as role from empleados e
            inner join empleado_rol er on e.id = er.empleado_id
            inner join roles r on er.rol_id = r.id
            ORDER BY e.id ASC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener empleados' });
    }
};


exports.updateEmployeeStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE empleados
       SET activo = NOT activo
       WHERE id = $1
       RETURNING id, nombre, email, activo`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        res.json({
            message: 'Estado actualizado',
            user: result.rows[0]
        });

        await logAction({
            usuario_id: req.employee.userId,
            rol: req.employee.role,
            accion: "ADMIN_STATUS_CHANGE",
            detalle: `Admin cambió el estado del usuario ${id}`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

exports.adminChangePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                error: "La contraseña debe tener al menos 6 caracteres"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await pool.query(
            `UPDATE empleados
       SET password = $1
       WHERE id = $2
       RETURNING id, nombre, email`,
            [hashedPassword, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Empleado no encontrado"
            });
        }

        await logAction({
            usuario_id: req.employee.userId,
            rol: req.employee.role,
            accion: "ADMIN_CHANGE_PASSWORD",
            detalle: `Admin cambió password del usuario ${id}`
        });


        res.json({
            message: "Contraseña actualizada por administrador"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al cambiar contraseña"
        });
    }
};