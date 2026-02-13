const supabase = require('../config/supabase');

const registerUser = async (email, password, name, role = 'employee') => {
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) throw authError;

    if (!authData.user) {
        throw new Error('User creation failed');
    }

    // 2. Create Profile
    // Note: triggers are better for this, but asked for backend logic.
    // We use the same ID as auth user
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
            {
                id: authData.user.id,
                name,
                role,
            },
        ])
        .select()
        .single();

    if (profileError) {
        // Cleanup if profile fails (optional but good practice)
        // await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
    }

    return { user: authData.user, profile: profileData };
};

const loginUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    // Fetch profile to return with login
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

    return { session: data.session, user: data.user, profile };
};

module.exports = { registerUser, loginUser };
