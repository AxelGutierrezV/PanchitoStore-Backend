require('dotenv').config();

const express = require('express');
const routes = require('./routes/shippingRoutes');

const app = express();

app.use(express.json());
app.use('/api/shipping', routes);

const PORT = process.env.PORT || 3050;

app.listen(PORT, () => {
  console.log(`Shipping Service en puerto ${PORT}`);
});