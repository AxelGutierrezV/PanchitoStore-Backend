require("dotenv").config();

const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const routes = require("./routes/cartRoutes");

const app = express();

app.use(cors({
  origin: 
[
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://panchitostore-shop.netlify.app",
      "https://panchitostore-admin.netlify.app"
    ]
,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

connectDB();

app.use("/api/cart", routes);

const PORT = process.env.PORT || 3060;

app.listen(PORT, () => {
  console.log(`Cart Service en puerto ${PORT}`);
});
