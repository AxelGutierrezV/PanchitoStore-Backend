const express = require('express');
const router = express.Router();

const controller = require('../controllers/clientController');

router.post('/login', controller.loginClient);

// Direcciones
router.post('/:id/addresses', controller.addAddress);
router.get('/:id/addresses', controller.getAddresses);

// Clientes
router.post('/', controller.createClient);
router.get('/', controller.getAllClients);
router.get('/:id', controller.getClientById);
router.put('/:id', controller.updateClient);
router.post("/change-password",controller.changePassword);
router.delete('/:id', controller.deleteClient);



module.exports = router;