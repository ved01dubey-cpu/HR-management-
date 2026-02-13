const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/mark', authenticate, attendanceController.mark);
router.get('/my', authenticate, attendanceController.getMy);
router.get('/all', authenticate, authorize(['admin']), attendanceController.getAll);

module.exports = router;
