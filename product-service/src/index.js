const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const promotionRoutes = require('./routes/promotionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/promotions', promotionRoutes);

app.use((req, res, next) => {

  next();
});

app.get('/', (req, res) => {
    res.send('Product Service funcionando');
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada'
    });
});

const PORT = process.env.PORT || 3020;

app.listen(PORT, () => {
    console.log(`Product Service corriendo en puerto ${PORT}`);
});
