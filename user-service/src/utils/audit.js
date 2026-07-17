const axios = require("axios");

const logAction = async ({ usuario_id, rol, accion, detalle }) => {
  try {

    await axios.post(`${process.env.LOGGING_SERVICE_URL}/api/logs`, {
      usuario_id: Number(usuario_id),
      rol: String(rol), 
      accion,
      detalle,
      servicio: "user-service"
    });

  }
  catch (error) {
    console.log("error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }

};

module.exports = logAction;