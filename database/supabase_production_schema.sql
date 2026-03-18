-- SUPABASE PRODUCTION SCHEMA for Student Wellness Dashboard
-- Based on Frontend Requirements (SQL_SCHEMA.md)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 18. Universities
create table if not exists public.universities (
    id varchar(50) primary key,
    name varchar(255) not null,
    short_name varchar(50),
    logo_url varchar(255),
    location varchar(255),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 19. Programs
create table if not exists public.programs (
    id varchar(50) primary key,
    name varchar(255) not null,
    faculty varchar(255),
    duration_years int default 3,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 15. Coordinators
create table if not exists public.coordinators (
    id varchar(50) primary key,
    name varchar(255) not null,
    email varchar(255) unique not null,
    department varchar(100),
    phone varchar(20),
    role varchar(50),
    avatar_url varchar(255),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 2. Students
create table if not exists public.students (
    id varchar(50) primary key,
    name varchar(255) not null,
    first_name varchar(100),
    last_name varchar(100),
    email varchar(255) not null,
    phone varchar(20),
    student_id varchar(50) unique, -- Student Number
    id_number varchar(20),
    university_id varchar(50) references public.universities(id),
    program_id varchar(50) references public.programs(id),
    major varchar(100),
    minor varchar(100),
    year varchar(20),
    gender varchar(20),
    date_of_birth date,
    address text,
    gpa decimal(5, 2),
    risk varchar(20) default 'Safe', -- 'Safe', 'At Risk', 'Critical'
    status varchar(20) default 'Active', -- 'Active', 'Inactive'
    last_activity varchar(50),
    enrollment_date date,
    avatar_url varchar(255),
    assigned_coordinator_id varchar(50) references public.coordinators(id),
    native_language varchar(100),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 3. Partners
create table if not exists public.partners (
    id varchar(50) primary key,
    name varchar(255) not null,
    type varchar(50), -- 'Individual', 'Organization'
    role varchar(100), -- 'Academic Tutor', 'Wellness Provider', etc.
    specialization varchar(255),
    status varchar(20),
    rating decimal(3, 2) default 0.0,
    rating_count int default 0,
    active_clients int default 0,
    default_rate decimal(10, 2),
    email varchar(255),
    phone varchar(20),
    website varchar(255),
    image_url varchar(255),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 4. Academic Marks
create table if not exists public.academic_marks (
    id varchar(50) primary key,
    student_id varchar(50) references public.students(id),
    course_name varchar(100),
    type varchar(50), -- 'Test', 'Assignment', etc.
    percentage decimal(5, 2),
    weight decimal(5, 2),
    date date,
    semester varchar(50),
    notes text,
    timestamp timestamp with time zone default now()
);

-- 5. Interventions
create table if not exists public.interventions (
    id varchar(50) primary key,
    student_id varchar(50) references public.students(id),
    student_name varchar(255),
    university varchar(100),
    risk_level varchar(20),
    type varchar(100),
    date_logged varchar(50),
    status varchar(20) default 'Open', -- 'Open', 'Follow-Up Due', 'Closed', 'Done'
    follow_up_date date,
    notes text,
    origin varchar(20), -- 'Student', 'Coordinator'
    is_student_request boolean default false,
    help_requested boolean default false,
    help_response text,
    last_response_by varchar(20), -- 'student', 'coordinator'
    has_unread_coordinator_response boolean default false,
    has_unread_student_response boolean default false,
    auto_delete_at bigint,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 6. Intervention Communications
create table if not exists public.intervention_communications (
    id varchar(50) primary key,
    intervention_id varchar(50) references public.interventions(id) on delete cascade,
    sender_role varchar(20), -- 'student', 'coordinator'
    sender_name varchar(255),
    message text,
    timestamp varchar(50),
    is_read_by_other_role boolean default false,
    created_at timestamp with time zone default now()
);

-- 7. Support Requests
create table if not exists public.support_requests (
    id varchar(50) primary key,
    request_id_display varchar(50),
    student_id varchar(50) references public.students(id),
    category varchar(100),
    status varchar(20) default 'Open',
    description text,
    submitted_date varchar(50),
    secondary_date varchar(50),
    secondary_label varchar(50),
    tag varchar(100),
    assigned_partner_id varchar(50) references public.partners(id),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 8. Support Logs (Invoicing)
create table if not exists public.support_logs (
    id varchar(50) primary key,
    request_id varchar(50) references public.support_requests(id),
    student_id varchar(50) references public.students(id),
    student_name varchar(255),
    partner_id varchar(50) references public.partners(id),
    partner_name varchar(255),
    date date,
    status varchar(20) default 'Pending', -- 'Pending', 'Submitted', 'Paid', 'Rejected'
    summary text,
    outcome varchar(50), -- 'Improved', 'Same', 'Declined'
    category varchar(100),
    cost decimal(10, 2),
    rate_type varchar(20), -- 'Per Hour', 'Per Session', 'Per Student'
    duration varchar(50),
    notes text,
    invoice_id varchar(50),
    payment_date date,
    created_at timestamp with time zone default now()
);

-- 9. Coordinator Reminders
create table if not exists public.coordinator_reminders (
    id varchar(50) primary key,
    coordinator_id varchar(50) references public.coordinators(id),
    due_date date,
    message text,
    created_at timestamp with time zone default now()
);

-- 10. Student Finance
create table if not exists public.student_finance (
    student_id varchar(50) primary key references public.students(id) on delete cascade,
    balance decimal(15, 2) default 0.0,
    total_fees decimal(15, 2) default 0.0,
    total_paid decimal(15, 2) default 0.0,
    last_payment_date date,
    payment_status varchar(20), -- 'Paid', 'Overdue', 'Pending'
    updated_at timestamp with time zone default now()
);

-- 11. Student Attendance
create table if not exists public.student_attendance (
    student_id varchar(50) primary key references public.students(id) on delete cascade,
    total_sessions int default 0,
    missed_sessions int default 0,
    last_session_date date,
    percentage decimal(5, 2) default 0.0,
    updated_at timestamp with time zone default now()
);

-- 12. Messages (Direct Chats)
create table if not exists public.messages (
    id bigserial primary key,
    sender varchar(20), -- 'student', 'partner', 'coordinator'
    text text,
    time varchar(20),
    student_id varchar(50) references public.students(id),
    partner_id varchar(50) references public.partners(id),
    coordinator_id varchar(50) references public.coordinators(id),
    is_read boolean default false,
    attachment_url varchar(500),
    fileName varchar(255),
    fileType varchar(100),
    fileSize int,
    created_at timestamp with time zone default now()
);

-- 13. Notifications
create table if not exists public.notifications (
    id varchar(50) primary key,
    title varchar(255),
    message text,
    timestamp varchar(50),
    is_read boolean default false,
    type varchar(50), -- 'request', 'message', 'system', etc.
    link varchar(255),
    target_role varchar(20), -- 'coordinator', 'partner', 'student'
    user_id varchar(50),
    target_user_id varchar(50),
    created_at timestamp with time zone default now()
);

-- 14. Notes (Student Notes Tab)
create table if not exists public.notes (
    id varchar(50) primary key,
    student_id varchar(50) references public.students(id) on delete cascade,
    author varchar(255),
    timestamp varchar(50),
    content text,
    is_system boolean default false,
    created_at timestamp with time zone default now()
);

-- 16. Courses
create table if not exists public.courses (
    id varchar(50) primary key,
    student_id varchar(50) references public.students(id) on delete cascade,
    title varchar(255),
    instructor varchar(255),
    credits int,
    semester varchar(50),
    color_hex varchar(20),
    progress decimal(5, 2) default 0.0,
    created_at timestamp with time zone default now()
);

-- 17. Partner Rate Settings
create table if not exists public.partner_rate_settings (
    partner_id varchar(50) primary key references public.partners(id) on delete cascade,
    rate_type varchar(50), -- 'Per Hour', 'Per Session', 'Per Student'
    rate decimal(10, 2),
    updated_at timestamp with time zone default now()
);

-- 1. Users (Auth & Identity)
-- Note: Supabase has its own internal 'auth.users' table. 
-- We can create a public.profiles or public.users if we want to sync, 
-- but for now let's just create a table to hold credentials for our manual auth if needed.
create table if not exists public.app_users (
    id varchar(50) primary key,
    role varchar(20), -- 'student', 'partner', 'coordinator', 'admin'
    email varchar(255) unique not null,
    password_hash varchar(255),
    first_name varchar(100),
    last_name varchar(100),
    student_id varchar(50) references public.students(id),
    coordinator_id varchar(50) references public.coordinators(id),
    partner_id varchar(50) references public.partners(id),
    is_active boolean default true,
    is_email_verified boolean default false,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable Realtime for key tables
begin;
  -- Drop existing publication if exists to reset
  drop publication if exists supabase_realtime;
  
  create publication supabase_realtime for table 
    public.messages, 
    public.notifications, 
    public.interventions, 
    public.support_requests,
    public.intervention_communications;
commit;

-- Insert initial data (Universities)
insert into public.universities (id, name, short_name, location) values
('UCT', 'University of Cape Town', 'UCT', 'Cape Town, Western Cape'),
('WITS', 'University of the Witwatersrand', 'Wits', 'Johannesburg, Gauteng'),
('UJ', 'University of Johannesburg', 'UJ', 'Johannesburg, Gauteng'),
('UKZN', 'University of KwaZulu-Natal', 'UKZN', 'Durban, KwaZulu-Natal')
on conflict (id) do nothing;

-- Insert initial data (Programs)
insert into public.programs (id, name, faculty, duration_years) values
('BScCS', 'Bachelor of Science in Computer Science', 'Science', 3),
('BComAcc', 'Bachelor of Commerce in Accounting', 'Commerce', 3),
('BEngMech', 'Bachelor of Engineering in Mechanical', 'Engineering', 4),
('MBChB', 'Bachelor of Medicine and Bachelor of Surgery', 'Health Sciences', 6)
on conflict (id) do nothing;

-- Insert initial data (Coordinator)
insert into public.coordinators (id, name, email, department, role) values
('admin-1', 'Admin Coordinator', 'admin@geniusup.com', 'Student Wellness', 'Head Coordinator')
on conflict (id) do nothing;
