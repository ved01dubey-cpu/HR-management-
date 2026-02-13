-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
-- Links to Supabase Auth.users
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  name text not null,
  role text not null check (role in ('employee', 'admin')) default 'employee',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- ATTENDANCE TABLE
create table if not exists public.attendance (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  date date not null,
  status text not null check (status in ('Present', 'WFH', 'Leave')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Prevent multiple entries for same user on same date
  unique(user_id, date)
);

-- Enable RLS
alter table public.attendance enable row level security;

-- LEAVES TABLE
create table if not exists public.leaves (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  from_date date not null,
  to_date date not null,
  leave_type text not null,
  reason text,
  status text not null check (status in ('Pending', 'Approved', 'Rejected')) default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.leaves enable row level security;

-- POLICIES (Optional if Access via Backend Service Role, but good practice)
-- Allow users to view their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

-- Allow admins to view all profiles
-- (Note: policy for admin requires checking role, often done via helper function or claims)

-- For this backend-focused implementation, we will largely rely on the implementation logic
-- since the backend uses the Service Role Key or acts as the gatekeeper.
