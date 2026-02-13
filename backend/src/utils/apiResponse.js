/**
 * Standard API Response Structure
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {object|null} data - Data payload
 * @param {boolean} success - Success status
 */
const apiResponse = (res, statusCode, message, data = null, success = true) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
    });
};

const apiError = (res, statusCode, message) => {
    return apiResponse(res, statusCode, message, null, false);
};

module.exports = { apiResponse, apiError };
