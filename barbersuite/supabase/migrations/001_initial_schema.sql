-- ============================================================
-- BarberSuite — Multi-Tenant Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: barbershops (Master Tenant Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS barbershops (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT UNIQUE NOT NULL,
  name                    TEXT NOT NULL,
  owner_id                UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Branding
  logo_url                TEXT,
  cover_url               TEXT,
  primary_color           TEXT DEFAULT '#d4a017',
  tagline                 TEXT,

  -- Contact
  phone                   TEXT,
  whatsapp                TEXT,
  email                   TEXT,
  address                 TEXT,
  city                    TEXT,
  state                   TEXT,
  zip_code                TEXT,

  -- SaaS Plan
  plan                    TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','basic','pro','enterprise')),
  plan_status             TEXT NOT NULL DEFAULT 'trial' CHECK (plan_status IN ('trial','active','past_due','canceled','paused')),
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  trial_ends_at           TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),

  -- Settings
  is_active               BOOLEAN NOT NULL DEFAULT true,
  working_hours           JSONB DEFAULT '{"mon":["08:00","20:00"],"tue":["08:00","20:00"],"wed":["08:00","20:00"],"thu":["08:00","20:00"],"fri":["08:00","20:00"],"sat":["08:00","18:00"],"sun":null}'::jsonb,
  booking_advance_days    INT DEFAULT 30,
  cancellation_hours      INT DEFAULT 2,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: barbers (Team Members per Tenant)
-- ============================================================
CREATE TABLE IF NOT EXISTS barbers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  role              TEXT NOT NULL DEFAULT 'barber',
  bio               TEXT,
  photo_url         TEXT,
  instagram_url     TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  working_hours     JSONB,
  color             TEXT DEFAULT '#d4a017',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: services
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  price             DECIMAL(10,2) NOT NULL,
  duration_min      INT NOT NULL DEFAULT 60,
  category          TEXT DEFAULT 'haircut',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  sort_order        INT DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: appointments
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id         UUID REFERENCES barbers(id) ON DELETE SET NULL,
  service_id        UUID REFERENCES services(id) ON DELETE SET NULL,

  -- Client info (no login required for clients)
  client_name       TEXT NOT NULL,
  client_phone      TEXT NOT NULL,
  client_email      TEXT,

  -- Scheduling
  scheduled_at      TIMESTAMPTZ NOT NULL,
  duration_min      INT NOT NULL DEFAULT 60,
  ends_at           TIMESTAMPTZ,

  -- Status
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','canceled','no_show')),
  canceled_reason   TEXT,

  -- Financial
  price             DECIMAL(10,2),
  payment_method    TEXT CHECK (payment_method IN ('cash','pix','credit_card','debit_card','transfer','other')),
  payment_status    TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),

  notes             TEXT,
  source            TEXT DEFAULT 'website' CHECK (source IN ('website','whatsapp','phone','walk_in','admin')),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  sku               TEXT,
  description       TEXT,
  price             DECIMAL(10,2),
  cost              DECIMAL(10,2),
  stock_qty         INT NOT NULL DEFAULT 0,
  low_stock_alert   INT DEFAULT 5,
  image_url         TEXT,
  supplier          TEXT,
  category          TEXT,
  expires_at        DATE,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  appointment_id    UUID REFERENCES appointments(id) ON DELETE SET NULL,
  barber_id         UUID REFERENCES barbers(id) ON DELETE SET NULL,
  client_name       TEXT NOT NULL,
  city              TEXT,
  rating            INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title             TEXT,
  comment           TEXT,
  is_approved       BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  category          TEXT NOT NULL,
  description       TEXT NOT NULL,
  amount            DECIMAL(10,2) NOT NULL,
  payment_method    TEXT,
  is_recurring      BOOLEAN DEFAULT false,
  recurrence        TEXT,
  paid_at           DATE NOT NULL,
  receipt_url       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: blocked_slots (Schedule blocks / vacations)
-- ============================================================
CREATE TABLE IF NOT EXISTS blocked_slots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id         UUID REFERENCES barbers(id) ON DELETE CASCADE,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,
  reason            TEXT,
  is_all_day        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: saas_subscriptions (BarberSuite platform billing)
-- ============================================================
CREATE TABLE IF NOT EXISTS saas_subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id            UUID UNIQUE REFERENCES barbershops(id) ON DELETE CASCADE,
  plan                     TEXT NOT NULL CHECK (plan IN ('basic','pro','enterprise')),
  price_brl                DECIMAL(10,2) NOT NULL,
  stripe_subscription_id   TEXT UNIQUE,
  stripe_price_id          TEXT,
  status                   TEXT NOT NULL DEFAULT 'active',
  current_period_start     TIMESTAMPTZ,
  current_period_end       TIMESTAMPTZ,
  cancel_at_period_end     BOOLEAN DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES (Performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_barbers_barbershop ON barbers(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_services_barbershop ON services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop ON appointments(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barber ON appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(barbershop_id, status);
CREATE INDEX IF NOT EXISTS idx_products_barbershop ON products(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_barbershop ON reviews(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_expenses_barbershop ON expenses(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_barbershop ON blocked_slots(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barbershops_slug ON barbershops(slug);
CREATE INDEX IF NOT EXISTS idx_barbershops_owner ON barbershops(owner_id);

-- ============================================================
-- TRIGGERS: updated_at auto-update
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_barbershops_updated_at
  BEFORE UPDATE ON barbershops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION calculate_appointment_ends_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ends_at = NEW.scheduled_at + make_interval(mins => NEW.duration_min);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_ends_at
  BEFORE INSERT OR UPDATE OF scheduled_at, duration_min ON appointments
  FOR EACH ROW EXECUTE FUNCTION calculate_appointment_ends_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_saas_subscriptions_updated_at
  BEFORE UPDATE ON saas_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- Helper function: get the barbershop_id of the logged-in owner
CREATE OR REPLACE FUNCTION get_my_barbershop_id()
RETURNS UUID AS $$
  SELECT id FROM barbershops WHERE owner_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ---- barbershops ----
-- Owners can manage their own barbershop
CREATE POLICY "owner_manage_barbershop" ON barbershops
  FOR ALL USING (owner_id = auth.uid());

-- Public can read active barbershops (for /b/[slug] pages)
CREATE POLICY "public_read_active_barbershops" ON barbershops
  FOR SELECT USING (is_active = true);

-- ---- barbers ----
CREATE POLICY "owner_manage_barbers" ON barbers
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "public_read_active_barbers" ON barbers
  FOR SELECT USING (is_active = true);

-- ---- services ----
CREATE POLICY "owner_manage_services" ON services
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "public_read_active_services" ON services
  FOR SELECT USING (is_active = true);

-- ---- appointments ----
CREATE POLICY "owner_manage_appointments" ON appointments
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

-- Clients can insert their own appointments (unauthenticated booking)
CREATE POLICY "public_insert_appointments" ON appointments
  FOR INSERT WITH CHECK (true);

-- ---- products ----
CREATE POLICY "owner_manage_products" ON products
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

-- ---- reviews ----
CREATE POLICY "owner_manage_reviews" ON reviews
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "public_read_approved_reviews" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "public_insert_reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- ---- expenses ----
CREATE POLICY "owner_manage_expenses" ON expenses
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

-- ---- blocked_slots ----
CREATE POLICY "owner_manage_blocked_slots" ON blocked_slots
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "public_read_blocked_slots" ON blocked_slots
  FOR SELECT USING (true);
