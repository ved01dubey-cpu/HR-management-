const express = require('express');
const router = express.Router();
const controller = require('../controllers/employees.controller');

router.get('/', controller.getAllEmployees);
router.delete('/:id', controller.deleteEmployee);
router.put('/:id', controller.updateEmployee);

module.exports = router;
