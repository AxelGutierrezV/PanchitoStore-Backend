require('dotenv').config();

const express = require('express');
const orderRoutes = require('./routes/orderRoutes');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: ['http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'],
    credentials: true
}));


app.use(express.json());

app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Order Service en puerto ${PORT}`);
});