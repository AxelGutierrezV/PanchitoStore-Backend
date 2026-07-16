require('dotenv').config();
const cors = require("cors");
const express = require('express');
const inventoryroutes = require('./routes/inventoryRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5175",
      "http://localhost:5174",
      "http://localhost:5173"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use('/api/inventory', inventoryroutes);
app.use('/api/warehouses', warehouseRoutes);

const PORT = process.env.PORT || 3040;

app.listen(PORT, () => {
    console.log(`Inventory Service en puerto ${PORT}`);
});