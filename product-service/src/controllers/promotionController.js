const pool = require('../config/db');
const axios = require("axios");

exports.getPromotions = async (
    req,
    res
) => {

    try {

        const result =
            await pool.query(
                `
        SELECT *
        FROM promotions
        ORDER BY id DESC
        `
            );

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

  } catch(error) {

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