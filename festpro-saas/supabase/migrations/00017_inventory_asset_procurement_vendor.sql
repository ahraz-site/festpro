-- ============================================================
-- Module 17: Enterprise Inventory, Asset, Procurement & Vendor
-- ============================================================

-- ENUMS
DO $$ BEGIN CREATE TYPE stock_movement_type AS ENUM ('in','out','transfer_in','transfer_out','adjustment_up','adjustment_down','damaged','expired','reserved','unreserved','returned'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE stock_transfer_status AS ENUM ('draft','in_transit','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE purchase_request_status AS ENUM ('draft','pending_approval','approved','rejected','ordered','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE purchase_order_status AS ENUM ('draft','sent','confirmed','partially_received','received','cancelled','closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE goods_receipt_status AS ENUM ('draft','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE asset_status AS ENUM ('available','assigned','in_use','under_maintenance','lost','damaged','retired','disposed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE inventory_maintenance_type AS ENUM ('preventive','corrective','emergency','inspection'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE inventory_maintenance_status AS ENUM ('scheduled','in_progress','completed','cancelled','overdue'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE inventory_audit_status AS ENUM ('planned','in_progress','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE inventory_unit AS ENUM ('piece','box','carton','kg','g','liter','ml','meter','set','pair','dozen','roll','pack','bundle','other'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- 1. WAREHOUSES
-- ============================================================
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  warehouse_code TEXT NOT NULL,
  warehouse_name TEXT NOT NULL,
  location TEXT,
  capacity_sqft NUMERIC,
  temperature_controlled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  contact_person TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. WAREHOUSE LOCATIONS (racks/bins)
-- ============================================================
CREATE TABLE warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  location_code TEXT NOT NULL,
  location_type TEXT DEFAULT 'rack',
  zone TEXT,
  max_capacity INTEGER,
  current_usage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. INVENTORY CATEGORIES
-- ============================================================
CREATE TABLE inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. INVENTORY ITEMS (master)
-- ============================================================
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  qr_code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  model TEXT,
  unit inventory_unit NOT NULL DEFAULT 'piece',
  unit_price NUMERIC DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  hsn_code TEXT,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. INVENTORY VARIANTS
-- ============================================================
CREATE TABLE inventory_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  variant_sku TEXT NOT NULL UNIQUE,
  variant_name TEXT NOT NULL,
  attributes JSONB DEFAULT '{}',
  unit_price NUMERIC DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE inventory_variants ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. INVENTORY UNITS (conversion)
-- ============================================================
CREATE TABLE inventory_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  unit_type TEXT DEFAULT 'quantity',
  conversion_factor NUMERIC DEFAULT 1,
  base_unit_id UUID REFERENCES inventory_units(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE inventory_units ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. INVENTORY STOCK
-- ============================================================
CREATE TABLE inventory_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES inventory_variants(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  location_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  batch_number TEXT,
  expiry_date DATE,
  unit_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_id, warehouse_id, location_id, batch_number)
);
ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. STOCK TRANSACTIONS
-- ============================================================
CREATE TABLE stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES inventory_variants(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  location_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL,
  movement_type stock_movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC,
  reference_type TEXT,
  reference_id UUID,
  batch_number TEXT,
  notes TEXT,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. STOCK ADJUSTMENTS
-- ============================================================
CREATE TABLE stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  adjustment_number TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. STOCK TRANSFERS
-- ============================================================
CREATE TABLE stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  transfer_number TEXT NOT NULL UNIQUE,
  from_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  to_warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  status stock_transfer_status NOT NULL DEFAULT 'draft',
  transferred_by UUID REFERENCES auth.users(id),
  received_by UUID REFERENCES auth.users(id),
  transferred_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. STOCK RESERVATIONS
-- ============================================================
CREATE TABLE stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES inventory_variants(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  reserved_until TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. PURCHASE REQUESTS
-- ============================================================
CREATE TABLE purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  pr_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status purchase_request_status NOT NULL DEFAULT 'draft',
  requested_by UUID REFERENCES auth.users(id),
  requested_date DATE DEFAULT CURRENT_DATE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. PURCHASE REQUEST ITEMS
-- ============================================================
CREATE TABLE purchase_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pr_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  unit inventory_unit NOT NULL DEFAULT 'piece',
  estimated_unit_cost NUMERIC DEFAULT 0,
  estimated_total NUMERIC GENERATED ALWAYS AS (quantity * estimated_unit_cost) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE purchase_request_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. PURCHASE ORDERS
-- ============================================================
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  pr_id UUID REFERENCES purchase_requests(id) ON DELETE SET NULL,
  vendor_id UUID,
  po_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status purchase_order_status NOT NULL DEFAULT 'draft',
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  delivery_address TEXT,
  billing_address TEXT,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  terms_conditions TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. PURCHASE ORDER ITEMS
-- ============================================================
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  pr_item_id UUID REFERENCES purchase_request_items(id) ON DELETE SET NULL,
  item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  unit inventory_unit NOT NULL DEFAULT 'piece',
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  tax_rate NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. GOODS RECEIPTS
-- ============================================================
CREATE TABLE goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  gr_number TEXT NOT NULL UNIQUE,
  status goods_receipt_status NOT NULL DEFAULT 'draft',
  received_date DATE DEFAULT CURRENT_DATE,
  received_by UUID REFERENCES auth.users(id),
  delivery_note_number TEXT,
  invoice_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE goods_receipts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 17. GOODS RECEIPT ITEMS
-- ============================================================
CREATE TABLE goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  gr_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
  po_item_id UUID NOT NULL REFERENCES purchase_order_items(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity_received INTEGER NOT NULL,
  quantity_accepted INTEGER NOT NULL,
  quantity_rejected INTEGER DEFAULT 0,
  rejection_reason TEXT,
  unit_cost NUMERIC DEFAULT 0,
  batch_number TEXT,
  expiry_date DATE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  location_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE goods_receipt_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 18. VENDORS
-- ============================================================
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  vendor_code TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  alternate_phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  gst_number TEXT,
  pan_number TEXT,
  tax_id TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  payment_terms TEXT,
  credit_limit NUMERIC,
  lead_time_days INTEGER,
  rating NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 19. VENDOR CONTACTS
-- ============================================================
CREATE TABLE vendor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  designation TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vendor_contacts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20. VENDOR DOCUMENTS
-- ============================================================
CREATE TABLE vendor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT false,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vendor_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 21. VENDOR RATINGS
-- ============================================================
CREATE TABLE vendor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
  overall_rating NUMERIC GENERATED ALWAYS AS ((COALESCE(quality_rating,3) + COALESCE(delivery_rating,3) + COALESCE(price_rating,3)) / 3.0) STORED,
  comment TEXT,
  rated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vendor_ratings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 22. VENDOR PAYMENTS
-- ============================================================
CREATE TABLE vendor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  payment_number TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT,
  transaction_id TEXT,
  reference_number TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 23. ASSET CATEGORIES
-- ============================================================
CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
  useful_life_years INTEGER,
  depreciation_rate NUMERIC,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 24. ASSETS
-- ============================================================
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  asset_code TEXT NOT NULL UNIQUE,
  qr_code TEXT,
  barcode TEXT,
  name TEXT NOT NULL,
  description TEXT,
  serial_number TEXT,
  model_number TEXT,
  brand TEXT,
  purchase_date DATE,
  purchase_cost NUMERIC,
  current_value NUMERIC,
  warranty_expiry DATE,
  warranty_terms TEXT,
  supplier_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  status asset_status NOT NULL DEFAULT 'available',
  location TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 25. ASSET ASSIGNMENTS
-- ============================================================
CREATE TABLE asset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_to_name TEXT NOT NULL,
  assigned_to_department TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_return_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  condition_on_assign TEXT,
  condition_on_return TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 26. ASSET MOVEMENTS
-- ============================================================
CREATE TABLE asset_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  from_location TEXT,
  to_location TEXT NOT NULL,
  from_warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  to_warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  movement_date TIMESTAMPTZ DEFAULT now(),
  moved_by UUID REFERENCES auth.users(id),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE asset_movements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 27. ASSET MAINTENANCE
-- ============================================================
CREATE TABLE asset_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  inventory_maintenance_type inventory_maintenance_type NOT NULL DEFAULT 'preventive',
  status inventory_maintenance_status NOT NULL DEFAULT 'scheduled',
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE,
  completed_date DATE,
  cost NUMERIC DEFAULT 0,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  performed_by TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE asset_maintenance ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 28. MAINTENANCE LOGS
-- ============================================================
CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  maintenance_id UUID NOT NULL REFERENCES asset_maintenance(id) ON DELETE CASCADE,
  log_date TIMESTAMPTZ DEFAULT now(),
  action TEXT NOT NULL,
  description TEXT,
  parts_used JSONB DEFAULT '[]',
  cost NUMERIC DEFAULT 0,
  performed_by TEXT,
  next_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 29. ASSET DISPOSALS
-- ============================================================
CREATE TABLE asset_disposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  disposal_date DATE DEFAULT CURRENT_DATE,
  disposal_type TEXT NOT NULL,
  disposal_reason TEXT NOT NULL,
  sale_amount NUMERIC,
  buyer_name TEXT,
  buyer_contact TEXT,
  authorized_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE asset_disposals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 30. INVENTORY AUDITS
-- ============================================================
CREATE TABLE inventory_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  audit_number TEXT NOT NULL UNIQUE,
  audit_date DATE DEFAULT CURRENT_DATE,
  status inventory_audit_status NOT NULL DEFAULT 'planned',
  conducted_by UUID REFERENCES auth.users(id),
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE inventory_audits ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 31. INVENTORY AUDIT ITEMS
-- ============================================================
CREATE TABLE inventory_audit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES inventory_audits(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  expected_quantity INTEGER NOT NULL,
  actual_quantity INTEGER NOT NULL,
  variance INTEGER GENERATED ALWAYS AS (actual_quantity - expected_quantity) STORED,
  unit_cost NUMERIC DEFAULT 0,
  variance_value NUMERIC GENERATED ALWAYS AS ((actual_quantity - expected_quantity) * unit_cost) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE inventory_audit_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================
CREATE POLICY "org_access_all" ON warehouses FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON warehouse_locations FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON inventory_categories FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON inventory_items FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON inventory_variants FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON inventory_units FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON inventory_stock FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON stock_transactions FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON stock_adjustments FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON stock_transfers FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON stock_reservations FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON purchase_requests FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON purchase_request_items FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON purchase_orders FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON purchase_order_items FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON goods_receipts FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON goods_receipt_items FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON vendors FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON vendor_contacts FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON vendor_documents FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON vendor_ratings FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON vendor_payments FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON asset_categories FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON assets FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON asset_assignments FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON asset_movements FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON asset_maintenance FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON maintenance_logs FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON asset_disposals FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON inventory_audits FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON inventory_audit_items FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_warehouse_locations_updated_at BEFORE UPDATE ON warehouse_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_inventory_variants_updated_at BEFORE UPDATE ON inventory_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_inventory_stock_updated_at BEFORE UPDATE ON inventory_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_stock_adjustments_updated_at BEFORE UPDATE ON stock_adjustments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_stock_transfers_updated_at BEFORE UPDATE ON stock_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_stock_reservations_updated_at BEFORE UPDATE ON stock_reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON purchase_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_goods_receipts_updated_at BEFORE UPDATE ON goods_receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vendor_contacts_updated_at BEFORE UPDATE ON vendor_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vendor_payments_updated_at BEFORE UPDATE ON vendor_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_asset_assignments_updated_at BEFORE UPDATE ON asset_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_asset_maintenance_updated_at BEFORE UPDATE ON asset_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_inventory_audits_updated_at BEFORE UPDATE ON inventory_audits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
