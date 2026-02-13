const supabase = require('../config/supabase');

const markAttendance = async (userId, status, date) => {
    // Check if attendance already exists
    const { data: existing } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

    if (existing) {
        throw new Error('Attendance already marked for this date');
    }

    const { data, error } = await supabase
        .from('attendance')
        .insert([
            {
                user_id: userId,
                status, // Present, WFH, Leave
                date,
            },
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
};

const getMyAttendance = async (userId) => {
    const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
};

const getAllAttendance = async () => {
    // Admin only - join with profiles to get names
    const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles(name, email:id)') // Getting email might depend on structure, id references auth but details in profiles?
        // profiles link is: attendance.user_id -> profiles.id
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
};

module.exports = { markAttendance, getMyAttendance, getAllAttendance };
