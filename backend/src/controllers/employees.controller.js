const supabase = require('../config/supabase');
const { apiResponse, apiError } = require('../utils/apiResponse');

const getAllEmployees = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'employee'); // Only fetch employees

        if (error) throw error;

        return apiResponse(res, 200, 'Employees fetched successfully', data);
    } catch (error) {
        return apiError(res, 500, error.message);
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Delete from profiles (optional if cascade is set, but explicit is safer)
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (profileError) throw profileError;

        // 2. Delete from auth.users (requires service role key usually, trigger is best)
        // Since we are using client key, we might be limited. 
        // For now, let's assume profile deletion is enough or triggers handle it.
        // If we need to delete auth user, we need admin client.

        return apiResponse(res, 200, 'Employee deleted successfully');
    } catch (error) {
        return apiError(res, 500, error.message);
    }
};

const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return apiResponse(res, 200, 'Employee updated successfully', data);
    } catch (error) {
        return apiError(res, 500, error.message);
    }
};

module.exports = {
    getAllEmployees,
    deleteEmployee,
    updateEmployee
};
