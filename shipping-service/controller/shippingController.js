const pool = require('../config/db');
const axios = require("axios");

//crear envío
exports.createShipment = async (req, res) => {
  try {
    const { order_id, cliente_id, warehouse_id, direccion, ciudad } = req.body;

    // ✅ validaciones
    if (!order_id || !cliente_id || !warehouse_id || !direccion || !ciudad) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios"
      });
    }

    const tracking = "TRK_" + Math.floor(Math.random() * 1000000000);


    console.log({
      order_id,
      cliente_id,
      warehouse_id,
      direccion,
      ciudad
    });

    const result = await pool.query(
      `INSERT INTO shipments
       (order_id, cliente_id, warehouse_id, direccion, ciudad, tracking_code, estado_id)
       VALUES ($1, $2, $3, $4, $5, $6, 1)
       RETURNING *`,
      [order_id, cliente_id, warehouse_id, direccion, ciudad, tracking]
    );

    const shipment = result.rows[0];

    await createLog(
      "SHIPMENT_CREATED",
      `Shipment ${shipment.id} creado para orden ${shipment.order_id}`,
      shipment.id
    );

    await pool.query(
      `
  INSERT INTO shipping_status_history
  (shipment_id, estado_id)
  VALUES ($1,$2)
  `,
      [
        shipment.id,
        shipment.estado_id
      ]
    );

    switch (Number(shipment.estado_id)) {

      case 2:

        await createLog(
          "SHIPMENT_CONFIRMED",
          `Shipment ${id} confirmado`,
          id
        );

        break;

      case 3:

        await createLog(
          "SHIPMENT_IN_TRANSIT",
          `Shipment ${id} en tránsito`,
          id
        );

        break;

      case 4:

        await createLog(
          "SHIPMENT_DELIVERED",
          `Shipment ${id} entregado`,
          id
        );

        break;

      case 5:

        await createLog(
          "SHIPMENT_CANCELLED",
          `Shipment ${id} cancelado`,
          id
        );

        break;

    }
    res.json(shipment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando envío" });
  }
};

//obtener un envio
exports.getShipmentById = async (req, res) => {
  try {

    const { id } = req.params;

    // ========================
    // SHIPMENT
    // ========================

    const shipmentResult = await pool.query(
      `
      SELECT
        s.id,
        s.order_id,
        s.cliente_id,
        s.warehouse_id,
        s.direccion,
        s.ciudad,
        s.tracking_code,
        s.fecha_creacion,
        ss.nombre AS estado
      FROM shipments s
      JOIN shipping_status ss
        ON s.estado_id = ss.id
      WHERE s.id = $1
      `,
      [id]
    );

    if (shipmentResult.rows.length === 0) {
      return res.status(404).json({
        error: "Shipment no encontrado"
      });
    }

    const shipment = shipmentResult.rows[0];

    // ========================
    // HISTORIAL
    // ========================

    const historyResult = await pool.query(
      `
      SELECT
        ssh.id,
        ssh.fecha,
        ss.nombre AS estado
      FROM shipping_status_history ssh
      JOIN shipping_status ss
        ON ssh.estado_id = ss.id
      WHERE ssh.shipment_id = $1
      ORDER BY ssh.fecha
      `,
      [id]
    );

    res.json({
      ...shipment,
      history: historyResult.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo shipment"
    });

  }
};

//actualizar estado
exports.updateShipmentStatus = async (req, res) => {

  try {

    const { id } = req.params;
    const { estado_id } = req.body;

    const shipmentResult =
      await pool.query(
        `
        SELECT *
        FROM shipments
        WHERE id = $1
        `,
        [id]
      );

    if (
      shipmentResult.rows.length === 0
    ) {

      return res.status(404).json({
        error: "Envío no encontrado"
      });

    }

    await pool.query(
      `
      UPDATE shipments
      SET estado_id = $1
      WHERE id = $2
      `,
      [estado_id, id]
    );

    await pool.query(
      `
      INSERT INTO shipping_status_history
      (
        shipment_id,
        estado_id
      )
      VALUES
      (
        $1,
        $2
      )
      `,
      [id, estado_id]
    );

    const shipment =
      shipmentResult.rows[0];

    // =========================
    // EMAIL ENVÍO
    // =========================

    try {

      const statusResult =
        await pool.query(
          `
          SELECT nombre
          FROM shipping_status
          WHERE id = $1
          `,
          [estado_id]
        );

      const statusName =
        statusResult.rows[0]?.nombre;

      const orderResponse =
        await axios.get(
          `${process.env.ORDER_SERVICE_URL}/api/orders/${shipment.order_id}`
        );

      const order =
        orderResponse.data;

      const clientResponse =
        await axios.get(
          `${process.env.AUTH_SERVICE_URL}/api/clients/${order.cliente_id}`
        );

      const client =
        clientResponse.data;

      const templates = {

        SHIPPED: {

          subject:
            `Envío ${shipment.tracking_code} despachado`,

          html: `
            <h2>Hola ${client.nombre}</h2>

            <p>
              Tu envío
              <strong>${shipment.tracking_code}</strong>
              ha sido despachado.
            </p>

            <p>
              Pedido:
              <strong>${order.order_code}</strong>
            </p>
          `
        },

        DELIVERED: {

          subject:
            `Envío ${shipment.tracking_code} entregado`,

          html: `
            <h2>Hola ${client.nombre}</h2>

            <p>
              Tu envío
              <strong>${shipment.tracking_code}</strong>
              fue entregado exitosamente.
            </p>

            <p>
              Pedido:
              <strong>${order.order_code}</strong>
            </p>
          `
        }

      };

      const notification =
        templates[statusName];

      if (notification) {

        await axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/email`,
          {
            to: client.email,
            subject:
              notification.subject,
            html:
              notification.html
          }
        );

      }

    } catch (emailError) {

      console.error(
        "Error enviando correo de envío:",
        emailError.response?.data ||
        emailError.message
      );

    }

    // =========================
    // SINCRONIZAR ORDER
    // =========================

    const orderStatusId =
      await recalculateOrderStatus(
        shipment.order_id
      );

    try {

      await axios.patch(
        `${process.env.ORDER_SERVICE_URL}/api/orders/${shipment.order_id}/status`,
        {
          estado_id:
            orderStatusId
        }
      );

      console.log(
        `Orden ${shipment.order_id} sincronizada a estado ${orderStatusId}`
      );

    } catch (error) {

      console.error(
        "Error sincronizando orden:",
        error.response?.data ||
        error.message
      );

    }

    res.json({
      message:
        "Estado actualizado"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error:
        "Error actualizando estado"
    });

  }

};

//obtener historial de un envio
exports.getShipmentHistory = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        ssh.id,
        ssh.fecha,
        ss.nombre AS estado
      FROM shipping_status_history ssh
      JOIN shipping_status ss
        ON ssh.estado_id = ss.id
      WHERE ssh.shipment_id = $1
      ORDER BY ssh.fecha
      `,
      [id]
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo historial"
    });

  }
};

//obtener todos los envios
exports.getShipments = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        s.id,
        s.order_id,
        s.cliente_id,
        s.warehouse_id,
        s.tracking_code,
        s.fecha_creacion,
        ss.nombre AS estado
      FROM shipments s
      JOIN shipping_status ss
        ON s.estado_id = ss.id
      ORDER BY s.id DESC
      `
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo envíos"
    });

  }
};

exports.getShipmentByOrderId = async (req, res) => {
  try {

    const { orderId } = req.params;

    const result = await pool.query(
      `
      SELECT
        s.id,
        s.order_id,
        s.cliente_id,
        s.warehouse_id,
        s.direccion,
        s.ciudad,
        s.tracking_code,
        s.fecha_creacion,
        ss.nombre AS estado
      FROM shipments s
      JOIN shipping_status ss
        ON s.estado_id = ss.id
      WHERE s.order_id = $1
      `,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No se encontraron envios para esta orden"
      });
    }

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo shipment"
    });

  }
};

exports.getShippingStats = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        ss.nombre AS estado,
        COUNT(*) AS cantidad
      FROM shipments s
      JOIN shipping_status ss
        ON s.estado_id = ss.id
      GROUP BY ss.nombre
    `);

    const stats = {
      total: 0,
      pending: 0,
      confirmed: 0,
      in_transit: 0,
      delivered: 0,
      cancelled: 0
    };

    result.rows.forEach(row => {

      const cantidad = Number(row.cantidad);

      stats.total += cantidad;

      switch (row.estado) {

        case "PENDING":
          stats.pending = cantidad;
          break;

        case "CONFIRMED":
          stats.confirmed = cantidad;
          break;

        case "IN_TRANSIT":
          stats.in_transit = cantidad;
          break;

        case "DELIVERED":
          stats.delivered = cantidad;
          break;

        case "CANCELLED":
          stats.cancelled = cantidad;
          break;

      }

    });

    res.json(stats);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo estadísticas"
    });

  }
};

exports.getShipmentByTracking = async (req, res) => {
  try {

    const { trackingCode } = req.params;

    const shipmentResult = await pool.query(
      `
      SELECT
        s.id,
        s.order_id,
        s.cliente_id,
        s.warehouse_id,
        s.direccion,
        s.ciudad,
        s.tracking_code,
        s.fecha_creacion,
        ss.nombre AS estado
      FROM shipments s
      JOIN shipping_status ss
        ON s.estado_id = ss.id
      WHERE s.tracking_code = $1
      `,
      [trackingCode]
    );

    if (shipmentResult.rows.length === 0) {
      return res.status(404).json({
        error: "Tracking no encontrado"
      });
    }

    const shipment = shipmentResult.rows[0];

    const historyResult = await pool.query(
      `
      SELECT
        ssh.id,
        ssh.fecha,
        ss.nombre AS estado
      FROM shipping_status_history ssh
      JOIN shipping_status ss
        ON ssh.estado_id = ss.id
      WHERE ssh.shipment_id = $1
      ORDER BY ssh.fecha
      `,
      [shipment.id]
    );

    res.json({
      ...shipment,
      history: historyResult.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo tracking"
    });

  }
};

exports.addShipmentItem = async (req, res) => {

  console.log(
    "ADD SHIPMENT ITEM",
    req.params,
    req.body
  );

  try {

    const { shipmentId } = req.params;

    const {
      producto_id,
      cantidad
    } = req.body;

    await pool.query(
      `
      INSERT INTO shipment_items
      (
        shipment_id,
        product_id,
        quantity
      )
      VALUES ($1,$2,$3)
      `,
      [
        shipmentId,
        producto_id,
        cantidad
      ]
    );

    res.status(201).json({
      message: "Item agregado al shipment"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error agregando item"
    });

  }
};

exports.getShipmentItems = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        product_id,
        quantity
      FROM shipment_items
      WHERE shipment_id = $1
      ORDER BY product_id
      `,
      [id]
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo items del envío"
    });

  }
};

const recalculateOrderStatus = async (
  orderId
) => {

  const shipmentsResult =
    await pool.query(
      `
      SELECT
        ss.nombre AS estado
      FROM shipments s
      JOIN shipping_status ss
        ON s.estado_id = ss.id
      WHERE s.order_id = $1
      `,
      [orderId]
    );

  const states =
    shipmentsResult.rows.map(
      row =>
        row.estado
          .toUpperCase()
          .trim()
    );


  let orderStatusId = 2; // CONFIRMED

  const allDelivered =
    states.every(
      state =>
        state === "DELIVERED"
    );

  const allCancelled =
    states.every(
      state =>
        state === "CANCELLED"
    );

  const hasDelivered =
    states.includes(
      "DELIVERED"
    );

  const hasCancelled =
    states.includes(
      "CANCELLED"
    );

  const hasPending =
    states.includes(
      "PENDING"
    );

  const hasInTransit =
    states.includes(
      "IN_TRANSIT"
    );

  if (allDelivered) {

    orderStatusId = 4;

  } else if (allCancelled) {

    orderStatusId = 5;

  } else if (
    hasDelivered &&
    hasCancelled
  ) {

    orderStatusId = 6;

  } else if (
    !hasPending &&
    hasInTransit
  ) {

    orderStatusId = 3;

  } else {

    orderStatusId = 2;

  }

  return orderStatusId;

};

const createLog = async (
  accion,
  detalle,
  shipmentId
) => {

  try {

    await axios.post(
      `${process.env.LOGGING_SERVICE_URL}/api/logs`,
      {
        accion,
        detalle,
        servicio: "shipping-service",
        metadata: {
          shipment_id: shipmentId
        }
      }
    );

  } catch (error) {

    console.error(
      "Error enviando log:",
      error.response?.data || error.message
    );

  }

};

