const supabase = require('../config/supabase');
const { apiError } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return apiError(res, 401, 'Unauthorized: No token provided');
        }

        const token = authHeader.split(' ')[1];

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return apiError(res, 401, 'Unauthorized: Invalid token');
        }

        // Attach user to request
        // Also fetch profile to get role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            // If profile doesn't exist, they might be a valid auth user but not initialized in our system
            // Proceed with caution, or error out. For now, strict:
            return apiError(res, 403, 'Forbidden: Profile not found');
        }

        req.user = { ...user, role: profile.role, name: profile.name };
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        return apiError(res, 500, 'Internal Server Error during authentication');
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return apiError(res, 401, 'Unauthorized');
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return apiError(res, 403, 'Forbidden: Insufficient permissions');
        }

        next();
    };
};

module.exports = { authenticate, authorize };
