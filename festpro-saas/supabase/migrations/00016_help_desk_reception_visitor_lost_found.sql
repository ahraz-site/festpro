-- ============================================================
-- Module 16: Enterprise Help Desk, Reception, Visitor &
--            Lost & Found Management
-- ============================================================

-- ENUMS
CREATE TYPE ticket_priority AS ENUM ('low','medium','high','urgent','critical');
CREATE TYPE ticket_status AS ENUM ('new','open','assigned','in_progress','resolved','closed','reopened','on_hold','cancelled');
CREATE TYPE escalation_level AS ENUM ('level1','level2','level3','level4');
CREATE TYPE visitor_category AS ENUM ('general','guest','vip','media','sponsor','government','organization','volunteer','staff','participant');
CREATE TYPE lost_item_category AS ENUM ('mobile_phone','wallet','bag','id_card','certificate','documents','jewellery','watch','electronics','keys','clothing','umbrella','water_bottle','laptop','tablet','headphones','books','other');
CREATE TYPE claim_status AS ENUM ('pending','under_review','verified','approved','rejected','collected','closed');
CREATE TYPE feedback_status AS ENUM ('draft','published','closed');

-- ============================================================
-- 1. HELP DESKS (physical desk locations)
-- ============================================================
CREATE TABLE help_desks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  desk_code TEXT NOT NULL,
  desk_name TEXT NOT NULL,
  location TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB DEFAULT '{}',
  contact_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE help_desks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. HELP DESK STAFF
-- ============================================================
CREATE TABLE help_desk_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  desk_id UUID REFERENCES help_desks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_role TEXT NOT NULL DEFAULT 'agent',
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE help_desk_staff ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. SUPPORT CATEGORIES
-- ============================================================
CREATE TABLE support_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE support_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. SUPPORT PRIORITIES
-- ============================================================
CREATE TABLE support_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority_level ticket_priority NOT NULL DEFAULT 'medium',
  sla_response_minutes INTEGER DEFAULT 60,
  sla_resolution_minutes INTEGER DEFAULT 1440,
  color TEXT DEFAULT '#6b7280',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE support_priorities ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. SUPPORT STATUSES
-- ============================================================
CREATE TABLE support_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'new',
  color TEXT DEFAULT '#6b7280',
  sort_order INTEGER DEFAULT 0,
  is_closed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE support_statuses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. SUPPORT TICKETS
-- ============================================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  desk_id UUID REFERENCES help_desks(id) ON DELETE SET NULL,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES support_categories(id) ON DELETE SET NULL,
  priority_id UUID REFERENCES support_priorities(id) ON DELETE SET NULL,
  status ticket_status NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'desk',
  submitted_by UUID REFERENCES auth.users(id),
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_phone TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  reopened_at TIMESTAMPTZ,
  resolution_notes TEXT,
  is_internal BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. TICKET COMMENTS
-- ============================================================
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_name TEXT NOT NULL,
  sender_role TEXT,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. TICKET ATTACHMENTS
-- ============================================================
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES ticket_comments(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. TICKET HISTORY (audit trail)
-- ============================================================
CREATE TABLE ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. TICKET ASSIGNMENTS
-- ============================================================
CREATE TABLE ticket_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  unassigned_at TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. TICKET SLA
-- ============================================================
CREATE TABLE ticket_sla (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES support_categories(id) ON DELETE CASCADE,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  response_time_minutes INTEGER NOT NULL DEFAULT 60,
  resolution_time_minutes INTEGER NOT NULL DEFAULT 1440,
  escalation_minutes INTEGER[] DEFAULT '{120, 240, 480}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_sla ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. TICKET ESCALATIONS
-- ============================================================
CREATE TABLE ticket_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  escalation_level escalation_level NOT NULL DEFAULT 'level1',
  escalated_by UUID REFERENCES auth.users(id),
  escalated_to UUID REFERENCES auth.users(id),
  reason TEXT,
  previous_assignee UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_escalations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. KNOWLEDGE BASE CATEGORIES
-- ============================================================
CREATE TABLE knowledge_base_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES knowledge_base_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE knowledge_base_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. KNOWLEDGE ARTICLES
-- ============================================================
CREATE TABLE knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES knowledge_base_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. FAQ ITEMS
-- ============================================================
CREATE TABLE faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES knowledge_base_categories(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. VISITOR CATEGORIES
-- ============================================================
CREATE TABLE visitor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category visitor_category NOT NULL DEFAULT 'general',
  description TEXT,
  access_areas TEXT[] DEFAULT '{}',
  requires_approval BOOLEAN DEFAULT false,
  pass_color TEXT DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 17. VISITORS
-- ============================================================
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES visitor_categories(id) ON DELETE SET NULL,
  visitor_category visitor_category NOT NULL DEFAULT 'general',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  id_proof_type TEXT,
  id_proof_number TEXT,
  id_proof_url TEXT,
  company_name TEXT,
  designation TEXT,
  purpose_of_visit TEXT,
  host_name TEXT,
  host_department TEXT,
  host_contact TEXT,
  is_vip BOOLEAN DEFAULT false,
  is_blacklisted BOOLEAN DEFAULT false,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  total_visits INTEGER DEFAULT 1,
  last_visit_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 18. VISITOR GROUPS
-- ============================================================
CREATE TABLE visitor_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  group_type TEXT DEFAULT 'general',
  member_count INTEGER DEFAULT 0,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  organization_name TEXT,
  purpose TEXT,
  expected_checkin TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_groups ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 19. VISITOR PASSES
-- ============================================================
CREATE TABLE visitor_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  pass_number TEXT NOT NULL UNIQUE,
  pass_type visitor_category NOT NULL DEFAULT 'general',
  qr_code TEXT,
  qr_code_url TEXT,
  barcode TEXT,
  validity_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  validity_end TIMESTAMPTZ,
  access_areas TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_used BOOLEAN DEFAULT false,
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_passes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20. VISITOR CHECK-INS
-- ============================================================
CREATE TABLE visitor_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  pass_id UUID REFERENCES visitor_passes(id) ON DELETE SET NULL,
  group_id UUID REFERENCES visitor_groups(id) ON DELETE SET NULL,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_in_method TEXT DEFAULT 'manual',
  checked_in_by UUID REFERENCES auth.users(id),
  desk_id UUID REFERENCES help_desks(id) ON DELETE SET NULL,
  badge_issued BOOLEAN DEFAULT false,
  badge_number TEXT,
  vehicle_number TEXT,
  escort_required BOOLEAN DEFAULT false,
  escorted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_checkins ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 21. VISITOR CHECKOUT LOGS
-- ============================================================
CREATE TABLE visitor_checkout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  checkin_id UUID NOT NULL REFERENCES visitor_checkins(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  check_out_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_method TEXT DEFAULT 'manual',
  checked_out_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_checkout_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 22. VISITOR HOSTS
-- ============================================================
CREATE TABLE visitor_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT,
  designation TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_hosts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 23. MEETING LOGS
-- ============================================================
CREATE TABLE meeting_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  host_id UUID REFERENCES visitor_hosts(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  meeting_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  location TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE meeting_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 24. LOST ITEMS
-- ============================================================
CREATE TABLE lost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  category lost_item_category NOT NULL DEFAULT 'other',
  color TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  distinctive_features TEXT,
  lost_location TEXT,
  lost_date TIMESTAMPTZ,
  reported_by UUID REFERENCES auth.users(id),
  reporter_name TEXT,
  reporter_phone TEXT,
  reporter_email TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  status lost_item_status NOT NULL DEFAULT 'reported',
  is_valuable BOOLEAN DEFAULT false,
  estimated_value NUMERIC,
  storage_location TEXT,
  claimed_at TIMESTAMPTZ,
  disposed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 25. FOUND ITEMS
-- ============================================================
CREATE TABLE found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  category lost_item_category NOT NULL DEFAULT 'other',
  color TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  distinctive_features TEXT,
  found_location TEXT NOT NULL,
  found_at TIMESTAMPTZ DEFAULT now(),
  found_by UUID REFERENCES auth.users(id),
  finder_name TEXT,
  finder_phone TEXT,
  finder_email TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  status lost_item_status NOT NULL DEFAULT 'reported',
  is_valuable BOOLEAN DEFAULT false,
  estimated_value NUMERIC,
  storage_location TEXT,
  matched_lost_item_id UUID REFERENCES lost_items(id) ON DELETE SET NULL,
  returned_at TIMESTAMPTZ,
  disposed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 26. CLAIM REQUESTS
-- ============================================================
CREATE TABLE claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  lost_item_id UUID REFERENCES lost_items(id) ON DELETE CASCADE,
  found_item_id UUID REFERENCES found_items(id) ON DELETE CASCADE,
  claimant_name TEXT NOT NULL,
  claimant_email TEXT,
  claimant_phone TEXT,
  claimant_photo_url TEXT,
  relationship TEXT,
  description TEXT NOT NULL,
  id_proof_type TEXT,
  id_proof_number TEXT,
  id_proof_url TEXT,
  proof_of_ownership TEXT[] DEFAULT '{}',
  status claim_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  collected_at TIMESTAMPTZ,
  collected_by_name TEXT,
  collector_id_proof TEXT,
  digital_signature TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 27. CLAIM VERIFICATIONS
-- ============================================================
CREATE TABLE claim_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES claim_requests(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL DEFAULT 'identity',
  verified_by UUID REFERENCES auth.users(id),
  is_verified BOOLEAN DEFAULT false,
  verification_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE claim_verifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 28. ITEM HANDOVER LOGS
-- ============================================================
CREATE TABLE item_handover_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES claim_requests(id) ON DELETE CASCADE,
  handover_by UUID REFERENCES auth.users(id),
  handover_to_name TEXT NOT NULL,
  handover_to_phone TEXT,
  handover_to_id_proof TEXT,
  item_condition TEXT,
  digital_signature TEXT,
  handover_photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE item_handover_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 29. FEEDBACK FORMS
-- ============================================================
CREATE TABLE feedback_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL DEFAULT 'general',
  questions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE feedback_forms ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 30. FEEDBACK RESPONSES
-- ============================================================
CREATE TABLE feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE SET NULL,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  respondent_name TEXT,
  respondent_email TEXT,
  respondent_phone TEXT,
  responses JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 31. SERVICE RATINGS
-- ============================================================
CREATE TABLE service_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE SET NULL,
  desk_id UUID REFERENCES help_desks(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT,
  comment TEXT,
  rated_by UUID REFERENCES auth.users(id),
  visitor_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE service_ratings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================
CREATE POLICY "org_access_all" ON help_desks FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON help_desk_staff FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON support_categories FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON support_priorities FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON support_statuses FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON support_tickets FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON ticket_comments FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON ticket_attachments FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON ticket_history FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON ticket_assignments FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON ticket_sla FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON ticket_escalations FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON knowledge_base_categories FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON knowledge_articles FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON faq_items FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON visitor_categories FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON visitors FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON visitor_groups FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON visitor_passes FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON visitor_checkins FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON visitor_checkout_logs FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON visitor_hosts FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON meeting_logs FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON lost_items FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON found_items FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON claim_requests FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON claim_verifications FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON item_handover_logs FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON feedback_forms FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON feedback_responses FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON service_ratings FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE TRIGGER update_help_desks_updated_at BEFORE UPDATE ON help_desks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ticket_sla_updated_at BEFORE UPDATE ON ticket_sla FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ticket_escalations_updated_at BEFORE UPDATE ON ticket_escalations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON faq_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_visitor_groups_updated_at BEFORE UPDATE ON visitor_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_visitor_passes_updated_at BEFORE UPDATE ON visitor_passes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_visitor_hosts_updated_at BEFORE UPDATE ON visitor_hosts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_meeting_logs_updated_at BEFORE UPDATE ON meeting_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_lost_items_updated_at BEFORE UPDATE ON lost_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_found_items_updated_at BEFORE UPDATE ON found_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_claim_requests_updated_at BEFORE UPDATE ON claim_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_feedback_forms_updated_at BEFORE UPDATE ON feedback_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
