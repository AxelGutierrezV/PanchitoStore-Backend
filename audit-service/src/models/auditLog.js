const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    fecha: {
      type: Date,
      default: Date.now
    }
  },
  {
    strict: false
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);