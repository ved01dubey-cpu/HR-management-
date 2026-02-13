const leaveService = require('../services/leave.service');
const { apiResponse, apiError } = require('../utils/apiResponse');

const apply = async (req, res) => {
    try {
        const userId = req.user.id;
        const { from_date, to_date, leave_type, reason } = req.body;

        if (!from_date || !to_date || !leave_type) {
            return apiError(res, 400, 'Missing required fields');
        }

        const data = await leaveService.applyLeave(userId, { from_date, to_date, leave_type, reason });
        return apiResponse(res, 201, 'Leave application submitted', data);
    } catch (error) {
        return apiError(res, 400, error.message);
    }
};

const getMy = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await leaveService.getMyLeaves(userId);
        return apiResponse(res, 200, 'Leave records fetched', data);
    } catch (error) {
        return apiError(res, 500, error.message);
    }
};

const getAll = async (req, res) => {
    try {
        const data = await leaveService.getAllLeaves();
        return apiResponse(res, 200, 'All leave records fetched', data);
    } catch (error) {
        return apiError(res, 500, error.message);
    }
};

const approve = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await leaveService.updateLeaveStatus(id, 'Approved');
        return apiResponse(res, 200, 'Leave approved', data);
    } catch (error) {
        return apiError(res, 400, error.message);
    }
};

const reject = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await leaveService.updateLeaveStatus(id, 'Rejected');
        return apiResponse(res, 200, 'Leave rejected', data);
    } catch (error) {
        return apiError(res, 400, error.message);
    }
};

module.exports = { apply, getMy, getAll, approve, reject };
