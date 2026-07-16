const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  cliente_id: {
    type: Number,
    required: true,
  },
  items: [
    {
      producto_id: Number,
      cantidad: Number,
      precio: Number,
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);