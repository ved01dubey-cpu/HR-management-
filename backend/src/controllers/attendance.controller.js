const attendanceService = require('../services/attendance.service');
const { apiResponse, apiError } = require('../utils/apiResponse');

const mark = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, date } = req.body;

        // Default to today if no date provided
        const attendanceDate = date || new Date().toISOString().split('T')[0];

        if (!['Present', 'WFH', 'Leave'].includes(status)) {
            return apiError(res, 400, 'Invalid status');
        }

        const data = await attendanceService.markAttendance(userId, status, attendanceDate);
        return apiResponse(res, 201, 'Attendance marked successfully', data);
    } catch (error) {
        return apiError(res, 400, error.message);
    }
};

const getMy = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await attendanceService.getMyAttendance(userId);
        return apiResponse(res, 200, 'Attendance records fetched', data);
    } catch (error) {
        return apiError(res, 500, error.message);
    }
};

const getAll = async (req, res) => {
    try {
        const data = await attendanceService.getAllAttendance();
        return apiResponse(res, 200, 'All attendance records fetched', data);
    } catch (error) {
        return apiError(res, 500, error.message);
    }
};

module.exports = { mark, getMy, getAll };
