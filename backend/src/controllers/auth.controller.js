const authService = require('../services/auth.service');
const { apiResponse, apiError } = require('../utils/apiResponse');

const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name) {
            return apiError(res, 400, 'All fields are required');
        }

        const data = await authService.registerUser(email, password, name, role);
        return apiResponse(res, 201, 'User registered successfully', data);
    } catch (error) {
        return apiError(res, 400, error.message);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return apiError(res, 400, 'Email and password are required');
        }

        const data = await authService.loginUser(email, password);
        return apiResponse(res, 200, 'Login successful', data);
    } catch (error) {
        return apiError(res, 401, error.message);
    }
};

module.exports = { register, login };
