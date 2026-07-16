const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authEmployee = require('../middlewares/authEmployee');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.put("/change-self-password",
    authEmployee,
    employeeController.changeSelfPassword);

router.put(
    '/:id/change-password',
    authEmployee,
    roleMiddleware('ADMIN'),
    employeeController.adminChangePassword
);

router.post(
    '/',
    authEmployee,
    roleMiddleware('ADMIN'),
    employeeController.registerEmployee
);


router.post('/login', employeeController.loginEmployee);



router.get('/profile', authEmployee, (req, res) => {
    res.json({
        message: 'Empleado autenticado',
        employee: req.employee
    });
});

router.get('/',
    authEmployee,
   roleMiddleware('ADMIN'),
    employeeController.getAllEmployees
);

router.get(
    '/:id',
    authEmployee,
    roleMiddleware('ADMIN'),
    employeeController.getEmployeeById
);

router.put(
    '/:id',
    authEmployee,
    roleMiddleware('ADMIN'),
    employeeController.updateEmployee
);


router.patch('/:id/updateEmployeeStatus',
    authEmployee,
    roleMiddleware("ADMIN"),
    employeeController.updateEmployeeStatus);

module.exports = router;