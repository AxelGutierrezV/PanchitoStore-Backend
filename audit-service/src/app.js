const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const auditRoutes = require("./routes/auditRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ conexión Mongo
mongoose.connect(`${process.env.MONGO_URL}/audit_db`)
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.log(err));

app.use("/api", auditRoutes);

app.listen(3070, () => {
  console.log("Audit service running on port 3070");
});