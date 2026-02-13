const supabase = require('../config/supabase');

const applyLeave = async (userId, leaveData) => {
    const { from_date, to_date, leave_type, reason } = leaveData;

    const { data, error } = await supabase
        .from('leaves')
        .insert([
            {
                user_id: userId,
                from_date,
                to_date,
                leave_type,
                reason,
                status: 'Pending',
            },
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
};

const getMyLeaves = async (userId) => {
    const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

const getAllLeaves = async () => {
    // Admin only
    const { data, error } = await supabase
        .from('leaves')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

const updateLeaveStatus = async (leaveId, status) => {
    const { data, error } = await supabase
        .from('leaves')
        .update({ status })
        .eq('id', leaveId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };
