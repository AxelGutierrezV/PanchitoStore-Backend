const express = require("express");
const router = express.Router();

const AuditLog = require("../models/auditLog");


router.post("/logs", async (req, res) => {
  try {
    const log = await AuditLog.create(req.body);
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/logs", async (req, res) => {
  try {
    const { usuario_id, servicio } = req.query;

    let filter = {};

    if (usuario_id) {
      filter.usuario_id = usuario_id;
    }

    if (servicio) {
      filter.servicio = servicio;
    }

    const logs = await AuditLog.find(filter).sort({ fecha: -1 });

    res.json(logs);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;