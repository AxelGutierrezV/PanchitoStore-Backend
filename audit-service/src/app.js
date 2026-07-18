const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const auditRoutes = require("./routes/auditRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.log(err));

app.use("/api", auditRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Audit Service en puerto ${PORT}`);
});

/*
app.listen(3070, () => {
  console.log("Audit service running on port 3070");
});

*/