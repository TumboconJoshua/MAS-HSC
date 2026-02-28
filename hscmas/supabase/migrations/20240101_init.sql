-- Create tables
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role text default 'server' check (role in ('admin', 'server')),
  avatar_url text,
  created_at timestamptz default now()
);

create table servers (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  contact_number text,
  status text default 'active' check (status in ('active', 'inactive')),
  sex text,
  birthday date,
  date_joined date default current_date,
  group_name text,
  created_at timestamptz default now()
);

create table masses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text default 'regular' check (type in ('regular', 'special', 'event')),
  date date not null,
  start_time time not null,
  location text,
  created_at timestamptz default now()
);

create table attendance (
  id uuid default gen_random_uuid() primary key,
  mass_id uuid references masses(id) on delete cascade not null,
  server_id uuid references servers(id) on delete cascade not null,
  status text default 'present' check (status in ('service', 'present', 'absent', 'excused', 'late')),
  remarks text,
  created_at timestamptz default now()
);

create table equipment (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text default 'other' check (category in ('vestment', 'liturgical_object', 'other')),
  quantity int default 0,
  condition text default 'good' check (condition in ('good', 'fair', 'damaged', 'lost')),
  notes text,
  created_at timestamptz default now()
);

create table equipment_assignments (
  id uuid default gen_random_uuid() primary key,
  equipment_id uuid references equipment(id) on delete cascade not null,
  server_id uuid references servers(id) on delete cascade not null,
  assigned_date date default current_date,
  returned_date date,
  status text default 'assigned' check (status in ('assigned', 'returned', 'lost'))
);

create table server_schedules (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  effective_from date not null,
  effective_to date not null,
  weeks jsonb default '{}',
  is_active boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table servers enable row level security;
alter table masses enable row level security;
alter table attendance enable row level security;
alter table equipment enable row level security;
alter table equipment_assignments enable row level security;
alter table server_schedules enable row level security;

-- Policies (simple start: allow authenticated users to read all, admins full access)
-- Note: You need to implement custom claims or role checks for accurate policies.
-- For now, allowing all authenticated users to read.

create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

create policy "Servers area viewable by authenticated users" on servers for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert servers" on servers for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update servers" on servers for update using (auth.role() = 'authenticated');

create policy "Masses are viewable by authenticated users" on masses for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert masses" on masses for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update masses" on masses for update using (auth.role() = 'authenticated');

create policy "Attendance is viewable by authenticated users" on attendance for select using (auth.role() = 'authenticated');
create policy "Authenticated users can manage attendance" on attendance for all using (auth.role() = 'authenticated');

create policy "Equipment is viewable by authenticated users" on equipment for select using (auth.role() = 'authenticated');
create policy "Authenticated users can manage equipment" on equipment for all using (auth.role() = 'authenticated');

create policy "Assignments viewable by authenticated users" on equipment_assignments for select using (auth.role() = 'authenticated');
create policy "Authenticated users can manage assignments" on equipment_assignments for all using (auth.role() = 'authenticated');

-- Server Schedules: public read (for login page), authenticated manage
create policy "Schedules are publicly viewable" on server_schedules for select using (true);
create policy "Authenticated users can manage schedules" on server_schedules for all using (auth.role() = 'authenticated');
