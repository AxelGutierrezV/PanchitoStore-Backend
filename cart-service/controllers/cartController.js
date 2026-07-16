const Cart = require("../model/cartModel");

// =========================
// OBTENER CARRITO
// =========================
exports.getCart = async (req, res) => {
  try {

    const cliente_id = Number(req.params.cliente_id);

    let cart = await Cart.findOne({ cliente_id });

    if (!cart) {
      cart = await Cart.create({
        cliente_id,
        items: []
      });
    }

    res.json(cart);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo carrito"
    });

  }
};

// =========================
// AGREGAR AL CARRITO
// =========================
exports.addToCart = async (req, res) => {
  try {

    const {
      cliente_id,
      producto_id,
      cantidad,
      precio
    } = req.body;

    const clienteIdNum = Number(cliente_id);
    const productoIdNum = Number(producto_id);
    const cantidadNum = Number(cantidad);
    const precioNum = Number(precio);

    let cart = await Cart.findOne({
      cliente_id: clienteIdNum
    });

    if (!cart) {
      cart = await Cart.create({
        cliente_id: clienteIdNum,
        items: []
      });
    }

    const item = cart.items.find(
      i => Number(i.producto_id) === productoIdNum
    );

    if (item) {

      item.cantidad += cantidadNum;

    } else {

      cart.items.push({
        producto_id: productoIdNum,
        cantidad: cantidadNum,
        precio: precioNum
      });

    }

    await cart.save();

    res.json(cart);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error agregando producto"
    });

  }
};

// =========================
// ACTUALIZAR CANTIDAD
// =========================
exports.updateItemQuantity = async (req, res) => {
  try {

    const cliente_id = Number(req.params.cliente_id);
    const producto_id = Number(req.params.producto_id);
    const cantidad = Number(req.body.cantidad);

    if (cantidad <= 0) {

      await Cart.updateOne(
        { cliente_id },
        {
          $pull: {
            items: {
              producto_id
            }
          }
        }
      );

      return res.json({
        message: "Producto eliminado del carrito"
      });

    }

    const result = await Cart.updateOne(
      {
        cliente_id,
        "items.producto_id": producto_id
      },
      {
        $set: {
          "items.$.cantidad": cantidad
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: "Producto no encontrado"
      });
    }

    res.json({
      message: "Cantidad actualizada"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error actualizando cantidad"
    });

  }
};

// =========================
// ELIMINAR ITEM
// =========================
exports.removeItem = async (req, res) => {
  try {

    const cliente_id = Number(req.params.cliente_id);
    const producto_id = Number(req.params.producto_id);

    const result = await Cart.updateOne(
      { cliente_id },
      {
        $pull: {
          items: {
            producto_id
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: "Carrito no encontrado"
      });
    }

    res.json({
      message: "Producto eliminado"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error eliminando producto"
    });

  }
};

// =========================
// VACIAR CARRITO
// =========================
exports.clearCart = async (req, res) => {
  try {

    const cliente_id = Number(req.params.cliente_id);

    await Cart.findOneAndUpdate(
      { cliente_id },
      {
        $set: {
          items: []
        }
      }
    );

    res.json({
      message: "Carrito vacío"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error limpiando carrito"
    });

  }
};