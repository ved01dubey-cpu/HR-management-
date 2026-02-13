const express = require('express');
const leaveController = require('../controllers/leave.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/apply', authenticate, leaveController.apply);
router.get('/my', authenticate, leaveController.getMy);

// Admin Routes
router.get('/all', authenticate, authorize(['admin']), leaveController.getAll);
router.put('/approve/:id', authenticate, authorize(['admin']), leaveController.approve);
router.put('/reject/:id', authenticate, authorize(['admin']), leaveController.reject);

module.exports = router;
