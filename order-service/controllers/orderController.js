const pool = require("../config/db");
const axios = require("axios");

exports.createOrder = async (req, res) => {
  try {
    const { cliente_id, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items requeridos" });
    }

    const total = items.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0
    );

    const orderResult = await pool.query(
      `INSERT INTO orders (cliente_id, total)
       VALUES ($1, $2) RETURNING *`,
      [cliente_id, total]
    );

    const order = orderResult.rows[0];

    for (let item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, producto_id, cantidad, precio)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.producto_id, item.cantidad, item.precio]
      );
    }

    res.json({
      message: "Orden creada",
      order_id: order.id,
      total,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando orden" });
  }
};

exports.createOrderFromCart = async (req, res) => {
  try {

    const { cliente_id, coupon_code } = req.body;

    const clientResponse = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/clients/${cliente_id}`
    );

    const client = clientResponse.data;

    if (!cliente_id) {
      return res.status(400).json({
        error: "cliente_id es obligatorio"
      });
    }

    // CARRITO
    const cartResponse = await axios.get(
      `${process.env.CART_SERVICE_URL}/api/cart/${cliente_id}`
    );

    const cart = cartResponse.data;

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        error: "Carrito vacío"
      });
    }

    // VALIDAR STOCK
    for (const item of cart.items) {

      const stockResponse = await axios.post(
        `${process.env.INVENTORY_SERVICE_URL}/api/inventory/check`,
        {
          producto_id: item.producto_id,
          cantidad: item.cantidad
        }
      );

      if (!stockResponse.data.available) {

        try {
          await axios.post(
            `${process.env.LOGGING_SERVICE_URL}/api/logs`,
            {
              accion: "INSUFFICIENT_STOCK",
              detalle: `Stock insuficiente para producto ${item.producto_id}`,
              servicio: "order-service"
            }
          );
        } catch (error) {
          console.error("Logging error:", error.message);
        }

        return res.status(400).json({
          error: `Stock insuficiente para producto ${item.producto_id}`
        });
      }
    }

    // TOTAL
    let discount = 0;

    let appliedCoupon = null;

    const subtotal = cart.items.reduce(
      (sum, item) =>
        sum +
        Number(item.precio) *
        Number(item.cantidad),
      0
    );

    let total = subtotal;

    if (coupon_code) {

      try {

        const couponResponse =
          await axios.post(
            `${process.env.PRODUCT_SERVICE_URL}/api/promotions/validate`,
            {
              code: coupon_code
            }
          );

        appliedCoupon =
          couponResponse.data;

        const eligibleItems =
          cart.items.filter(item =>
            appliedCoupon.products.includes(
              Number(item.producto_id)
            )
          );

        const eligibleSubtotal =
          eligibleItems.reduce(
            (sum, item) =>
              sum +
              Number(item.precio) *
              Number(item.cantidad),
            0
          );

        if (
          appliedCoupon.tipo ===
          "PORCENTAJE"
        ) {

          discount =
            eligibleSubtotal *
            Number(
              appliedCoupon.valor
            ) / 100;

        }

        else if (
          appliedCoupon.tipo ===
          "MONTO"
        ) {

          discount =
            Math.min(
              Number(
                appliedCoupon.valor
              ),
              eligibleSubtotal
            );

        }

        total =
          subtotal - discount;

      } catch (error) {

        console.error(
          "Coupon validation:",
          error.message
        );

      }

    }

    if (total < 0) {
      total = 0;
    }

    const today = new Date();

    const datePart =
      today.getFullYear() +
      String(today.getMonth() + 1).padStart(2, "0") +
      String(today.getDate()).padStart(2, "0");

    const randomPart = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    const orderCode =
      `PS-${datePart}-${randomPart}`;


    // PAYMENT
    let transactionId = null;


    try {

      const paymentResponse = await axios.post(
        `${process.env.PAYMENT_SERVICE_URL}/api/payments`,
        {
          order_id: Date.now(),
          amount: total
        }
      );

      transactionId =
        paymentResponse.data.transactionId;

    } catch (err) {

      try {
        await axios.post(
          `${process.env.LOGGING_SERVICE_URL}/api/logs`,
          {
            accion: "PAYMENT_REJECTED",
            detalle: `Pago rechazado cliente ${cliente_id}`,
            servicio: "order-service"
          }
        );
      } catch (logError) {
        console.error(logError.message);
      }

      return res.status(400).json({
        message: "Pago rechazado"
      });

    }

    // CREAR ORDEN
    const orderResult = await pool.query(
      `
INSERT INTO orders
(
  cliente_id,
  subtotal,
  discount,
  total,
  estado_id,
  order_code,
  transaction_id
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
        cliente_id,
        subtotal,
        discount,
        total,
        1,
        orderCode,
        transactionId
      ]


    );

    const order = orderResult.rows[0];

    // HISTORIAL PENDING
    await pool.query(
      `
      INSERT INTO order_status_history
      (order_id, estado_id)
      VALUES ($1,$2)
      `,
      [
        order.id,
        1
      ]
    );

    // CREAR LOG DE LA ORDEN
    try {

      await axios.post(
        `${process.env.LOGGING_SERVICE_URL}/api/logs`,
        {
          accion: "ORDER_CREATED",
          detalle: `Orden ${order.order_code} creada`,
          servicio: "order-service"
        }
      );

    } catch (error) {
      console.error(
        "Logging error:",
        error.message
      );
    }

    // REDUCIR STOCK
    const inventoryResponse = await axios.post(
      `${process.env.INVENTORY_SERVICE_URL}/api/inventory/reduce-order`,
      {
        items: cart.items,
        orderCode: order.order_code,
        items: cart.items

      }
    );

    const inventoryResults =
      inventoryResponse.data.allocations || [];

    console.log(
      "Allocations:",
      JSON.stringify(inventoryResults, null, 2)
    );

    // ORDER ITEMS
    for (const item of cart.items) {

      const inventoryData = inventoryResults.find(
        i =>
          Number(i.producto_id) ===
          Number(item.producto_id)
      );

      if (!inventoryData) {

        console.warn(
          `No allocation para producto ${item.producto_id}`
        );

        continue;
      }

      await pool.query(
        `
        INSERT INTO order_items
        (
          order_id,
          producto_id,
          cantidad,
          precio,
          warehouse_id
        )
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          order.id,
          item.producto_id,
          item.cantidad,
          item.precio,
          inventoryData.warehouse_id
        ]
      );
    }

    try {

      await axios.post(
        `${process.env.LOGGING_SERVICE_URL}/api/logs`,
        {
          accion: "ORDER_CONFIRMED",
          detalle: `Orden ${order.order_code} confirmada`,
          servicio: "order-service"
        }
      );

    } catch (error) {
      console.error(error.message);
    }

    // AGRUPAR POR ALMACÉN
    const shipmentsByWarehouse = {};

    inventoryResults.forEach(allocation => {

      const warehouseId = allocation.warehouse_id;

      if (!shipmentsByWarehouse[warehouseId]) {
        shipmentsByWarehouse[warehouseId] = [];
      }

      shipmentsByWarehouse[warehouseId].push(allocation);

    });

    // CREAR SHIPMENTS
    for (const warehouseId of Object.keys(shipmentsByWarehouse)) {

      try {

        const shippingResponse = await axios.post(
          `${process.env.SHIPPING_SERVICE_URL}/api/shipping`,
          {
            order_id: order.id,
            cliente_id,
            warehouse_id: Number(warehouseId),
            direccion: "Av Lima 123",
            ciudad: "Lima"
          }
        );

        const shipment = shippingResponse.data;


        console.log(
          "SHIPPING RESPONSE:",
          JSON.stringify(shipment, null, 2)
        );


        // =========================
        // SHIPMENT ITEMS
        // =========================

        for (const allocation of shipmentsByWarehouse[warehouseId]) {

          const cartItem = cart.items.find(
            item =>
              Number(item.producto_id) ===
              Number(allocation.producto_id)
          );

          if (!cartItem) continue;

          await axios.post(
            `${process.env.SHIPPING_SERVICE_URL}/api/shipping/${shipment.id}/items`,
            {
              producto_id: allocation.producto_id,
              cantidad: cartItem.cantidad
            }
          );

        }

        try {

          await axios.post(
            `${process.env.LOGGING_SERVICE_URL}/api/logs`,
            {
              accion: "SHIPPING_CREATED",
              detalle:
                `Shipment ${shipment.id} creado para almacén ${warehouseId}`,
              servicio: "order-service"
            }
          );

        } catch (error) {
          console.error(error.message);
        }

      } catch (err) {

        console.error(
          "Shipping error:",
          err.response?.data || err.message
        );

        try {

          await axios.post(
            `${process.env.LOGGING_SERVICE_URL}/api/logs`,
            {
              accion: "SHIPPING_ERROR",
              detalle:
                `Error shipment orden ${order.id}`,
              servicio: "order-service"
            }
          );

        } catch (error) {
          console.error(error.message);
        }

      }

    }

    // =========================
    // LIMPIAR CARRITO
    // =========================

    await axios.delete(
      `${process.env.CART_SERVICE_URL}/api/cart/${cliente_id}`
    );

    try {

      await axios.post(
        `${process.env.LOGGING_SERVICE_URL}/api/logs`,
        {
          accion: "PURCHASE_COMPLETED",
          detalle: `Compra completada orden ${order.id}`,
          servicio: "order-service"
        }
      );

    } catch (error) {
      console.error(error.message);
    }
    console.log("PASO 1");

    // =========================
    // EMAIL
    // =========================

    try {

      const itemsWithNames = await Promise.all(

        cart.items.map(async (item) => {

          try {

            const response = await axios.get(
              `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.producto_id}`
            );

            return {
              ...item,
              nombre: response.data.nombre
            };

          } catch (error) {

            console.error(
              `Error obteniendo producto ${item.producto_id}:`,
              error.message
            );

            return {
              ...item,
              nombre: "Producto no disponible"
            };

          }

        })

      );

      console.log("PASO 2");

      const productsHtml = itemsWithNames
        .map(item => `
      <tr>

        <td style="padding:8px;border:1px solid #ddd;">
          ${item.nombre}
        </td>

        <td style="padding:8px;border:1px solid #ddd;text-align:center;">
          ${item.cantidad}
        </td>

        <td style="padding:8px;border:1px solid #ddd;text-align:right;">
          S/ ${Number(item.precio).toFixed(2)}
        </td>

        <td style="padding:8px;border:1px solid #ddd;text-align:right;">
          S/ ${(Number(item.precio) * Number(item.cantidad)).toFixed(2)}
        </td>

      </tr>
    `)
        .join("");
      console.log("PASO 3");
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/email`,
        {
          to: client.email,
          subject: `Compra confirmada - ${order.order_code}`,
          html: `
      ...
      ${productsHtml}
      ...
      `
        }
      );
        console.log("PASO 4");  
    } catch (emailError) {

      console.error(
        "Email error:",
        emailError.message
      );

    }


  
console.log("PASO 5");
    // =========================
    // RESPUESTA
    // =========================

    res.json({
      message: "Compra completada",
      order_id: order.id,
      order_code: order.order_code,
      transaction_id:
        order.transaction_id,
      subtotal,
      discount,
      total,
      coupon_code:
        appliedCoupon?.codigo || null
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error en flujo completo"
    });

  }
};

exports.getOrders = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        o.id,
        o.cliente_id,
        o.total,
        o.fecha_creacion,
        os.nombre AS estado
      FROM orders o
      JOIN order_status os
        ON o.estado_id = os.id
      ORDER BY o.id DESC
      `
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo órdenes"
    });

  }
};

exports.updateOrderStatus = async (req, res) => {

  try {

    const { id } = req.params;
    const { estado_id } = req.body;

    await pool.query(
      `
      UPDATE orders
      SET estado_id = $1
      WHERE id = $2
      `,
      [estado_id, id]
    );

    await pool.query(
      `
      INSERT INTO order_status_history
      (
        order_id,
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

    const orderResult =
      await pool.query(
        `
        SELECT *
        FROM orders
        WHERE id = $1
        `,
        [id]
      );

    const order =
      orderResult.rows[0];

    const statusResult =
      await pool.query(
        `
        SELECT nombre
        FROM order_status
        WHERE id = $1
        `,
        [estado_id]
      );

    const statusName =
      statusResult.rows[0]?.nombre;

    const clientResponse =
      await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/clients/${order.cliente_id}`
      );

    const client =
      clientResponse.data;

    const templates = {

      CONFIRMED: {

        subject:
          "Pedido confirmado",

        html: `
          <h2>Hola ${client.nombre}</h2>

          <p>
            Tu pedido
            <strong>${order.order_code}</strong>
            ha sido confirmado.
          </p>

          <p>
            Estamos preparando tu compra.
          </p>
        `
      },

      CANCELLED: {

        subject:
          "Pedido cancelado",

        html: `
          <h2>Hola ${client.nombre}</h2>

          <p>
            Tu pedido
            <strong>${order.order_code}</strong>
            ha sido cancelado.
          </p>
        `
      }

    };

    const notification =
      templates[statusName];

    if (notification) {

      try {

        await axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/api/email/send`,
          {
            to: client.email,
            subject:
              notification.subject,
            html:
              notification.html
          }
        );

      } catch (emailError) {

        console.error(
          "Error enviando correo:",
          emailError.message
        );

      }

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

exports.getOrderById = async (req, res) => {
  try {

    const { id } = req.params;

    // ====================
    // ORDEN
    // ====================

    const orderResult = await pool.query(
      `
      SELECT
        o.id,
        o.cliente_id,
        o.total,
        o.fecha_creacion,
        os.nombre AS estado
      FROM orders o
      JOIN order_status os
        ON o.estado_id = os.id
      WHERE o.id = $1
      `,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Orden no encontrada"
      });
    }

    const order = orderResult.rows[0];

    // ITEMS
    const itemsResult = await pool.query(
      `
      SELECT
        producto_id,
        cantidad,
        precio,
        warehouse_id
      FROM order_items
      WHERE order_id = $1
      `,
      [id]
    );

    // CLIENTE
    // CLIENTE
    let cliente = {
      id: order.cliente_id
    };

    try {

      const clientResponse = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/clients/${order.cliente_id}`
      );

      cliente = clientResponse.data;

    } catch (error) {

      console.error(
        "Error obteniendo cliente:",
        error.response?.data || error.message
      );

    }

    // RESPUESTA
    res.json({
      ...order,
      cliente,
      items: itemsResult.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo orden"
    });

  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const result =
      await pool.query(`
SELECT  COUNT(*) AS total_orders,
          COALESCE(
            SUM(total) FILTER(
WHERE estado_id NOT IN (5)
			)
            ,
            0
          ) AS sales_amount,

          COUNT(*) FILTER (
            WHERE estado_id = 2
          ) AS confirmed,

          COUNT(*) FILTER (
            WHERE estado_id = 3
          ) AS shipped,

          COUNT(*) FILTER (
            WHERE estado_id = 4
          ) AS delivered,

          COUNT(*) FILTER (
            WHERE estado_id = 5
          ) AS cancelled,

          COUNT(*) FILTER (
            WHERE estado_id = 6
          ) AS partial

        FROM orders
      `);

    const stats =
      result.rows[0];

    res.json({

      total_orders:
        Number(
          stats.total_orders
        ),

      sales_count:
        Number(
          stats.total_orders
        ),

      sales_amount:
        Number(
          stats.sales_amount
        ),

      confirmed:
        Number(
          stats.confirmed
        ),

      shipped:
        Number(
          stats.shipped
        ),

      delivered:
        Number(
          stats.delivered
        ),

      cancelled:
        Number(
          stats.cancelled
        ),

      partial:
        Number(
          stats.partial
        )

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error:
        "Error obteniendo estadísticas"
    });

  }

};

exports.getOrdersByClient = async (req, res) => {

  try {

    const { clienteId } =
      req.params;

    const result =
      await pool.query(
        `
          SELECT
            o.id,
            o.order_code,
            o.total,
            o.fecha_creacion,
            os.nombre AS estado
          FROM orders o
          JOIN order_status os
            ON o.estado_id = os.id
          WHERE o.cliente_id = $1
          ORDER BY o.id DESC
          `,
        [clienteId]
      );

    res.json(
      result.rows
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error:
        "Error obteniendo pedidos"
    });

  }

};

exports.getOrderDetail = async (req, res) => {

  try {

    const { id } = req.params;

    const orderResult = await pool.query(
      `
      SELECT
        o.*,
        os.nombre AS estado
      FROM orders o
      JOIN order_status os
        ON o.estado_id = os.id
      WHERE o.id = $1
      `,
      [id]
    );

    if (orderResult.rows.length === 0) {

      return res.status(404).json({
        error: "Orden no encontrada"
      });

    }

    const itemsResult = await pool.query(
      `
      SELECT *
      FROM order_items
      WHERE order_id = $1
      `,
      [id]
    );

    const items = await Promise.all(

      itemsResult.rows.map(async (item) => {

        try {

          console.log(
            "PRODUCT_SERVICE_URL:",
            process.env.PRODUCT_SERVICE_URL
          );

          console.log(
            "Consultando:",
            `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.producto_id}`
          );

          const productResponse =
            await axios.get(
              `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.producto_id}`
            );

          return {
            ...item,
            nombre: productResponse.data.nombre
          };

        } catch (error) {

          console.error(
            `Error obteniendo producto ${item.producto_id}:`,
            error.message
          );

          return {
            ...item,
            nombre: "Producto no disponible"
          };

        }

      })

    );

    res.json({

      order: orderResult.rows[0],

      items

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo detalle de la orden"
    });

  }

};
