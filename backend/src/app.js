const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { apiResponse } = require('./utils/apiResponse');

// Import Routes (Placeholder for now)
const authRoutes = require('./routes/auth.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const leaveRoutes = require('./routes/leave.routes');
const employeeRoutes = require('./routes/employees.routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/auth', authRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/leave', leaveRoutes);
app.use('/employees', employeeRoutes);

// Health Check
app.get('/', (req, res) => {
    apiResponse(res, 200, 'API is running successfully');
});

// 404 Handler
app.use((req, res) => {
    apiResponse(res, 404, 'Route not found');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    apiResponse(res, 500, 'Internal Server Error', null, false);
});

module.exports = app;
