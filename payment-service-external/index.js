require('dotenv').config();

const express = require('express');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(express.json());

app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Payment Service en puerto ${PORT}`);
});