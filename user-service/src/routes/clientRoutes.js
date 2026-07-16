const express = require('express');
const router = express.Router();

const clientController = require('../controllers/clientController');

router.post('/login', clientController.loginClient);

// Clientes
router.post('/', clientController.createClient);
router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

// Direcciones
router.post('/:id/addresses', clientController.addAddress);
router.get('/:id/addresses', clientController.getAddresses);

module.exports = router;