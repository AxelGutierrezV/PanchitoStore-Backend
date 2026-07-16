const express = require('express');
const cors = require('cors');
require('dotenv').config();

const employeeRoutes = require('./routes/employeeRoutes');
const clientRoutes = require('./routes/clientRoutes');
const roleRoutes = require('./routes/roleRoutes');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/employees', employeeRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/roles', roleRoutes);

app.get('/', (req, res) => {
    res.send('Auth Service funcionando');
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada'
    });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`User Service corriendo en puerto ${PORT}`);
});
