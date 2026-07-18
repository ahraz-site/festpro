-- FestPro Module 13: Enterprise Volunteer, Staff & Duty Management
-- =================================================================

-- 1. ENUMS
-- =================================================================
CREATE TYPE volunteer_status AS ENUM ('active','inactive','on_leave','deactivated');
CREATE TYPE staff_department AS ENUM (
  'reception','registration','help_desk','stage','media','food',
  'medical','security','transport','accommodation','technical',
  'cleaning','protocol','volunteer_coordination','general'
);
CREATE TYPE shift_type AS ENUM ('morning','afternoon','evening','night','custom');
CREATE TYPE duty_status AS ENUM ('scheduled','checked_in','completed','cancelled','no_show');
CREATE TYPE task_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE task_status AS ENUM ('pending','in_progress','completed','cancelled');
CREATE TYPE attendance_type AS ENUM ('qr_checkin','qr_checkout','manual','late','absent');
CREATE TYPE checkpoint_type AS ENUM ('gate','stage','reception','help_desk','medical','parking','volunteer_desk');

-- 2. TABLES
-- =================================================================

-- Volunteers
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  photo_url TEXT,
  first_name VARCHAR(200) NOT NULL,
  last_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(300),
  date_of_birth DATE,
  blood_group VARCHAR(10),
  emergency_contact_name VARCHAR(300),
  emergency_contact_phone VARCHAR(50),
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  availability TEXT,
  address TEXT,
  city VARCHAR(200),
  status volunteer_status NOT NULL DEFAULT 'active',
  qr_code VARCHAR(200) UNIQUE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_volunteers_org ON volunteers(organization_id);
CREATE INDEX idx_volunteers_festival ON volunteers(festival_id);
CREATE INDEX idx_volunteers_status ON volunteers(status);

-- Volunteer Profiles (extended)
CREATE TABLE volunteer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  total_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_shifts INTEGER NOT NULL DEFAULT 0,
  departments_worked TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2),
  certificate_count INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ,
  UNIQUE(volunteer_id)
);

-- Staff Members
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  department staff_department NOT NULL DEFAULT 'general',
  photo_url TEXT,
  first_name VARCHAR(200) NOT NULL,
  last_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(300),
  position VARCHAR(200),
  is_supervisor BOOLEAN NOT NULL DEFAULT false,
  supervisor_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_staff_members_org ON staff_members(organization_id);
CREATE INDEX idx_staff_members_department ON staff_members(department);

-- Staff Departments (metadata)
CREATE TABLE staff_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  department staff_department NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  icon VARCHAR(100),
  head_count INTEGER NOT NULL DEFAULT 0,
  max_capacity INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, festival_id, department)
);

-- Duties
CREATE TABLE duties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  department staff_department NOT NULL DEFAULT 'general',
  location TEXT,
  is_critical BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_duties_festival ON duties(festival_id);
CREATE INDEX idx_duties_department ON duties(department);

-- Duty Assignments
CREATE TABLE duty_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duty_id UUID NOT NULL REFERENCES duties(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status duty_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_duty_assignments_duty ON duty_assignments(duty_id);
CREATE INDEX idx_duty_assignments_volunteer ON duty_assignments(volunteer_id);
CREATE INDEX idx_duty_assignments_status ON duty_assignments(status);

-- Shift Templates
CREATE TABLE shift_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  shift_type shift_type NOT NULL DEFAULT 'morning',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 30,
  color VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shifts
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  template_id UUID REFERENCES shift_templates(id) ON DELETE SET NULL,
  duty_assignment_id UUID REFERENCES duty_assignments(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_overtime BOOLEAN NOT NULL DEFAULT false,
  status duty_status NOT NULL DEFAULT 'scheduled',
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  hours_worked DECIMAL(5,2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_shifts_festival ON shifts(festival_id);
CREATE INDEX idx_shifts_volunteer ON shifts(volunteer_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_status ON shifts(status);

-- Attendance Logs
CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  attendance_type attendance_type NOT NULL DEFAULT 'manual',
  checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  ip_address VARCHAR(45),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_attendance_logs_volunteer ON attendance_logs(volunteer_id);
CREATE INDEX idx_attendance_logs_date ON attendance_logs(timestamp);

-- Checkpoints
CREATE TABLE checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  checkpoint_type checkpoint_type NOT NULL DEFAULT 'gate',
  location TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  qr_code VARCHAR(200) UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_checkpoints_festival ON checkpoints(festival_id);

-- Check-ins (QR based)
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  checkin_type VARCHAR(20) NOT NULL DEFAULT 'checkin',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  photo_url TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_checkins_checkpoint ON checkins(checkpoint_id);
CREATE INDEX idx_checkins_volunteer ON checkins(volunteer_id);

-- Task Lists
CREATE TABLE task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  department staff_department,
  is_template BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_task_lists_festival ON task_lists(festival_id);

-- Task Status (individual tasks within a list)
CREATE TABLE task_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_list_id UUID NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES volunteers(id) ON DELETE SET NULL,
  assigned_staff UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_task_status_list ON task_status(task_list_id);
CREATE INDEX idx_task_status_assignee ON task_status(assigned_to);
CREATE INDEX idx_task_status_status ON task_status(status);

-- Task Comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES task_status(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Task Files
CREATE TABLE task_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES task_status(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(300),
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Volunteer / Staff Certificates
CREATE TABLE volunteer_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  certificate_code VARCHAR(100) UNIQUE NOT NULL,
  certificate_type VARCHAR(50) NOT NULL DEFAULT 'volunteer',
  title VARCHAR(300) NOT NULL,
  description TEXT,
  total_hours DECIMAL(10,2),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_volunteer_certificates_code ON volunteer_certificates(certificate_code);
CREATE INDEX idx_volunteer_certificates_volunteer ON volunteer_certificates(volunteer_id);

-- 3. TRIGGERS
-- =================================================================
CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_duties_updated_at BEFORE UPDATE ON duties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkpoints_updated_at BEFORE UPDATE ON checkpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_status_updated_at BEFORE UPDATE ON task_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. AUTO-CREATE VOLUNTEER PROFILE
CREATE OR REPLACE FUNCTION create_volunteer_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO volunteer_profiles (volunteer_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_volunteer_insert AFTER INSERT ON volunteers FOR EACH ROW EXECUTE FUNCTION create_volunteer_profile();

-- 5. RLS
-- =================================================================
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_certificates ENABLE ROW LEVEL SECURITY;

-- Organization-level access
CREATE POLICY volunteers_org_access ON volunteers FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY volunteer_profiles_org_access ON volunteer_profiles FOR ALL USING (
  volunteer_id IN (SELECT id FROM volunteers WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY staff_members_org_access ON staff_members FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY staff_departments_org_access ON staff_departments FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY duties_org_access ON duties FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY duty_assignments_org_access ON duty_assignments FOR ALL USING (
  duty_id IN (SELECT id FROM duties WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY shift_templates_org_access ON shift_templates FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY shifts_org_access ON shifts FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY attendance_logs_org_access ON attendance_logs FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY checkpoints_org_access ON checkpoints FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY checkins_org_access ON checkins FOR ALL USING (
  checkpoint_id IN (SELECT id FROM checkpoints WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY task_lists_org_access ON task_lists FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY task_status_org_access ON task_status FOR ALL USING (
  task_list_id IN (SELECT id FROM task_lists WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY task_comments_org_access ON task_comments FOR ALL USING (
  task_id IN (SELECT id FROM task_status WHERE task_list_id IN (SELECT id FROM task_lists WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())))
);
CREATE POLICY volunteer_certificates_org_access ON volunteer_certificates FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

-- 6. SEED DEPARTMENTS
-- =================================================================
