-- FestPro Module 12: Public Portal + Live Portal + API Gateway
-- =================================================================

-- 1. ENUMS
-- =================================================================
CREATE TYPE public_sponsor_tier AS ENUM ('platinum','gold','silver','bronze','partner','media');
CREATE TYPE public_news_category AS ENUM ('news','blog','press_release','update','announcement');
CREATE TYPE public_gallery_type AS ENUM ('photo','video','album');
CREATE TYPE public_registration_status AS ENUM ('draft','submitted','confirmed','waiting','cancelled');
CREATE TYPE public_registration_type AS ENUM ('individual','team');
CREATE TYPE public_cache_status AS ENUM ('fresh','stale','generating');

-- 2. TABLES
-- =================================================================

-- Homepage Settings
CREATE TABLE public_homepage_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  hero_title VARCHAR(300),
  hero_subtitle TEXT,
  hero_image_url TEXT,
  about_title VARCHAR(300),
  about_body TEXT,
  about_image_url TEXT,
  stats JSONB DEFAULT '[]',
  featured_sections JSONB DEFAULT '[]',
  seo_meta JSONB DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(festival_id)
);

-- Festival Details (public view)
CREATE TABLE public_festival_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  vision TEXT,
  mission TEXT,
  history TEXT,
  organizing_committee JSONB DEFAULT '[]',
  venue_name VARCHAR(300),
  venue_address TEXT,
  venue_map_url TEXT,
  venue_contact VARCHAR(100),
  faqs JSONB DEFAULT '[]',
  seo_meta JSONB DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(festival_id)
);

-- News / Blog / Press Releases
CREATE TABLE public_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  category public_news_category NOT NULL DEFAULT 'news',
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  excerpt TEXT,
  body TEXT,
  cover_image_url TEXT,
  author VARCHAR(200),
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  seo_meta JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_public_news_festival ON public_news(festival_id);
CREATE INDEX idx_public_news_published ON public_news(is_published, published_at DESC) WHERE is_published = true;
CREATE INDEX idx_public_news_category ON public_news(category);
CREATE INDEX idx_public_news_slug ON public_news(slug);

-- Gallery
CREATE TABLE public_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  gallery_type public_gallery_type NOT NULL DEFAULT 'photo',
  album_id UUID REFERENCES public_gallery(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER, height INTEGER, file_size INTEGER,
  mime_type VARCHAR(100),
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_public_gallery_festival ON public_gallery(festival_id);
CREATE INDEX idx_public_gallery_type ON public_gallery(gallery_type);
CREATE INDEX idx_public_gallery_album ON public_gallery(album_id);

-- Downloads
CREATE TABLE public_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  category VARCHAR(200) NOT NULL DEFAULT 'general',
  title VARCHAR(300) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_published BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_public_downloads_festival ON public_downloads(festival_id);
CREATE INDEX idx_public_downloads_category ON public_downloads(category);

-- Sponsors
CREATE TABLE public_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  sponsor_name VARCHAR(300) NOT NULL,
  sponsor_logo_url TEXT,
  website_url TEXT,
  tier public_sponsor_tier NOT NULL DEFAULT 'bronze',
  description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_public_sponsors_festival ON public_sponsors(festival_id);
CREATE INDEX idx_public_sponsors_tier ON public_sponsors(tier);

-- FAQ
CREATE TABLE public_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  category VARCHAR(200) DEFAULT 'general',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_public_faqs_festival ON public_faqs(festival_id);

-- Contact Inquiries
CREATE TABLE public_contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(300) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public Registrations
CREATE TABLE public_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  registration_type public_registration_type NOT NULL DEFAULT 'individual',
  status public_registration_status NOT NULL DEFAULT 'draft',
  registration_number VARCHAR(50) UNIQUE,
  tracking_token VARCHAR(100) UNIQUE,
  first_name VARCHAR(200) NOT NULL, last_name VARCHAR(200) NOT NULL,
  email VARCHAR(300) NOT NULL, phone VARCHAR(50),
  date_of_birth DATE, gender VARCHAR(20),
  address TEXT, city VARCHAR(200), state VARCHAR(200), country VARCHAR(200),
  postal_code VARCHAR(20),
  institution_name VARCHAR(300), grade VARCHAR(50),
  team_name VARCHAR(300),
  team_members JSONB DEFAULT '[]',
  competition_ids UUID[] DEFAULT '{}',
  special_requirements TEXT,
  documents JSONB DEFAULT '[]',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_amount DECIMAL(12,2),
  payment_reference VARCHAR(200),
  registered_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_public_registrations_festival ON public_registrations(festival_id);
CREATE INDEX idx_public_registrations_email ON public_registrations(email);
CREATE INDEX idx_public_registrations_tracking ON public_registrations(tracking_token);
CREATE INDEX idx_public_registrations_status ON public_registrations(status);

-- Live Schedule Cache
CREATE TABLE live_schedule_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES stages(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  cache_key VARCHAR(300) NOT NULL,
  cache_data JSONB NOT NULL DEFAULT '{}',
  status public_cache_status NOT NULL DEFAULT 'fresh',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX idx_live_schedule_cache_festival ON live_schedule_cache(festival_id);
CREATE INDEX idx_live_schedule_cache_key ON live_schedule_cache(cache_key);

-- Live Results Cache
CREATE TABLE live_results_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  cache_key VARCHAR(300) NOT NULL,
  cache_data JSONB NOT NULL DEFAULT '{}',
  status public_cache_status NOT NULL DEFAULT 'fresh',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX idx_live_results_cache_festival ON live_results_cache(festival_id);
CREATE INDEX idx_live_results_cache_key ON live_results_cache(cache_key);

-- Live Stage Status
CREATE TABLE live_stage_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  is_live BOOLEAN NOT NULL DEFAULT false,
  current_competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  current_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  current_participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  queue_count INTEGER DEFAULT 0,
  stream_url TEXT,
  stream_platform VARCHAR(100),
  started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_live_stage_status_festival ON live_stage_status(festival_id);
CREATE UNIQUE INDEX idx_live_stage_status_stage ON live_stage_status(stage_id);

-- Public API Tokens (for external apps)
CREATE TABLE public_api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  token_name VARCHAR(200) NOT NULL,
  token_hash VARCHAR(500) NOT NULL,
  token_prefix VARCHAR(20),
  allowed_origins TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_public_api_tokens_festival ON public_api_tokens(festival_id);

-- API Rate Limit Log
CREATE TABLE public_rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_token_id UUID REFERENCES public_api_tokens(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  route VARCHAR(500),
  method VARCHAR(10),
  status_code INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rate_limit_log_ip ON public_rate_limit_log(ip_address);
CREATE INDEX idx_rate_limit_log_created ON public_rate_limit_log(created_at);

-- 3. TRIGGERS
-- =================================================================
CREATE TRIGGER update_public_homepage_updated_at BEFORE UPDATE ON public_homepage_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_festival_details_updated_at BEFORE UPDATE ON public_festival_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_news_updated_at BEFORE UPDATE ON public_news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_gallery_updated_at BEFORE UPDATE ON public_gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_downloads_updated_at BEFORE UPDATE ON public_downloads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_sponsors_updated_at BEFORE UPDATE ON public_sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_faqs_updated_at BEFORE UPDATE ON public_faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_registrations_updated_at BEFORE UPDATE ON public_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS
-- =================================================================
ALTER TABLE public_homepage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_festival_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_schedule_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_results_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stage_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY public_read_homepage ON public_homepage_settings FOR SELECT USING (is_published = true);
CREATE POLICY public_read_festival_details ON public_festival_details FOR SELECT USING (is_published = true);
CREATE POLICY public_read_news ON public_news FOR SELECT USING (is_published = true);
CREATE POLICY public_read_gallery ON public_gallery FOR SELECT USING (is_published = true);
CREATE POLICY public_read_downloads ON public_downloads FOR SELECT USING (is_published = true);
CREATE POLICY public_read_sponsors ON public_sponsors FOR SELECT USING (is_published = true);
CREATE POLICY public_read_faqs ON public_faqs FOR SELECT USING (is_published = true);
CREATE POLICY public_read_live_schedule ON live_schedule_cache FOR SELECT USING (true);
CREATE POLICY public_read_live_results ON live_results_cache FOR SELECT USING (true);
CREATE POLICY public_read_live_stage ON live_stage_status FOR SELECT USING (true);
CREATE POLICY public_read_registrations ON public_registrations FOR SELECT USING (true);
CREATE POLICY public_insert_contact ON public_contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY public_insert_registration ON public_registrations FOR INSERT WITH CHECK (true);

-- Organization access for management
CREATE POLICY org_write_homepage ON public_homepage_settings FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_festival_details ON public_festival_details FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_news ON public_news FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_gallery ON public_gallery FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_downloads ON public_downloads FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_sponsors ON public_sponsors FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_faqs ON public_faqs FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_read_contact ON public_contact_inquiries FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_cache ON live_schedule_cache FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_results_cache ON live_results_cache FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_stage_status ON live_stage_status FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_api_tokens ON public_api_tokens FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
