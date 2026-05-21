-- ============================================================
-- BarberSuite — Tabelas Adicionais: Fase 2 (Funcionalidades Completas)
-- Cole este conteúdo no SQL Editor do Supabase e clique Run
-- ============================================================

-- ============================================================
-- TABLE: clients (Base de Clientes / CRM)
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  phone             TEXT,
  email             TEXT,
  birth_date        DATE,
  notes             TEXT,
  tags              TEXT[] DEFAULT '{}',
  total_visits      INT NOT NULL DEFAULT 0,
  total_spent       DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_visit_at     TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: loyalty_config (Configuração do Programa de Fidelidade)
-- ============================================================
CREATE TABLE IF NOT EXISTS loyalty_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID UNIQUE NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  visits_required   INT NOT NULL DEFAULT 10,
  reward_description TEXT DEFAULT '1 serviço grátis',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: loyalty_progress (Progresso dos Clientes na Fidelidade)
-- ============================================================
CREATE TABLE IF NOT EXISTS loyalty_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  client_id         UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  current_visits    INT NOT NULL DEFAULT 0,
  total_redeemed    INT NOT NULL DEFAULT 0,
  last_redeemed_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(barbershop_id, client_id)
);

-- ============================================================
-- TABLE: orders (Comandas)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  client_name       TEXT NOT NULL,
  client_id         UUID REFERENCES clients(id) ON DELETE SET NULL,
  barber_id         UUID REFERENCES barbers(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','canceled')),
  items             JSONB NOT NULL DEFAULT '[]',
  subtotal          DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount          DECIMAL(10,2) NOT NULL DEFAULT 0,
  total             DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method    TEXT CHECK (payment_method IN ('cash','pix','credit_card','debit_card','other')),
  notes             TEXT,
  opened_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: waitlist (Lista de Espera)
-- ============================================================
CREATE TABLE IF NOT EXISTS waitlist (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  client_name       TEXT NOT NULL,
  client_phone      TEXT,
  client_id         UUID REFERENCES clients(id) ON DELETE SET NULL,
  service_id        UUID REFERENCES services(id) ON DELETE SET NULL,
  barber_id         UUID REFERENCES barbers(id) ON DELETE SET NULL,
  position          INT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','called','served','left')),
  notes             TEXT,
  added_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  served_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: reminders_config (Configuração de Lembretes SMS)
-- ============================================================
CREATE TABLE IF NOT EXISTS reminders_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID UNIQUE NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  hours_before      INT NOT NULL DEFAULT 24,
  sms_template      TEXT NOT NULL DEFAULT 'Olá {nome}! Lembrete: você tem um agendamento na {estabelecimento} amanhã às {horario} com {barbeiro}. Até lá!',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: automations (Mensagens de Retorno Automáticas)
-- ============================================================
CREATE TABLE IF NOT EXISTS automations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  trigger_days      INT NOT NULL DEFAULT 30,
  message_template  TEXT NOT NULL,
  channel           TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms','email','whatsapp')),
  is_active         BOOLEAN NOT NULL DEFAULT true,
  sent_count        INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: campaigns (Campanhas de Marketing)
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  message           TEXT NOT NULL,
  audience          TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all','vip','birthdays','inactive')),
  channel           TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms','email','whatsapp')),
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sent','failed')),
  recipients_count  INT,
  sent_count        INT DEFAULT 0,
  open_count        INT DEFAULT 0,
  scheduled_at      TIMESTAMPTZ,
  sent_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: surveys (Pesquisas de Satisfação NPS)
-- ============================================================
CREATE TABLE IF NOT EXISTS surveys (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  appointment_id    UUID REFERENCES appointments(id) ON DELETE SET NULL,
  client_name       TEXT,
  client_phone      TEXT,
  barber_id         UUID REFERENCES barbers(id) ON DELETE SET NULL,
  score             INT CHECK (score BETWEEN 0 AND 10),
  comment           TEXT,
  responded_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: surveys_config (Configuração de Pesquisa NPS)
-- ============================================================
CREATE TABLE IF NOT EXISTS surveys_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID UNIQUE NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  send_delay_hours  INT NOT NULL DEFAULT 2,
  sms_template      TEXT NOT NULL DEFAULT 'Olá {nome}! Como foi sua experiência na {estabelecimento}? Avalie de 0 a 10 respondendo esta mensagem.',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: birthday_config (Configuração de Aniversariantes)
-- ============================================================
CREATE TABLE IF NOT EXISTS birthday_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id     UUID UNIQUE NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  message_template  TEXT NOT NULL DEFAULT 'Feliz Aniversário, {nome}! 🎂 A {estabelecimento} tem um presente especial para você: {desconto}% de desconto no seu próximo atendimento. Aproveite!',
  discount_percent  INT DEFAULT 20,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clients_barbershop ON clients(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(barbershop_id, phone);
CREATE INDEX IF NOT EXISTS idx_clients_birth_date ON clients(birth_date);
CREATE INDEX IF NOT EXISTS idx_orders_barbershop ON orders(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(barbershop_id, status);
CREATE INDEX IF NOT EXISTS idx_waitlist_barbershop ON waitlist(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(barbershop_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_barbershop ON campaigns(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_surveys_barbershop ON surveys(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_progress_client ON loyalty_progress(client_id);

-- ============================================================
-- TRIGGERS: auto updated_at
-- ============================================================
DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_loyalty_config_updated_at ON loyalty_config;
CREATE TRIGGER trg_loyalty_config_updated_at
  BEFORE UPDATE ON loyalty_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_automations_updated_at ON automations;
CREATE TRIGGER trg_automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS — Row Level Security
-- ============================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "owner_manage_clients" ON clients;
DROP POLICY IF EXISTS "owner_manage_loyalty_config" ON loyalty_config;
DROP POLICY IF EXISTS "owner_manage_loyalty_progress" ON loyalty_progress;
DROP POLICY IF EXISTS "owner_manage_orders" ON orders;
DROP POLICY IF EXISTS "owner_manage_waitlist" ON waitlist;
DROP POLICY IF EXISTS "owner_manage_reminders_config" ON reminders_config;
DROP POLICY IF EXISTS "owner_manage_automations" ON automations;
DROP POLICY IF EXISTS "owner_manage_campaigns" ON campaigns;
DROP POLICY IF EXISTS "owner_manage_surveys" ON surveys;
DROP POLICY IF EXISTS "owner_manage_surveys_config" ON surveys_config;
DROP POLICY IF EXISTS "owner_manage_birthday_config" ON birthday_config;

-- Create policies
CREATE POLICY "owner_manage_clients" ON clients
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "owner_manage_loyalty_config" ON loyalty_config
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "owner_manage_loyalty_progress" ON loyalty_progress
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "owner_manage_orders" ON orders
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "owner_manage_waitlist" ON waitlist
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "owner_manage_reminders_config" ON reminders_config
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "owner_manage_automations" ON automations
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "owner_manage_campaigns" ON campaigns
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "owner_manage_surveys" ON surveys
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "owner_manage_surveys_config" ON surveys_config
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

CREATE POLICY "owner_manage_birthday_config" ON birthday_config
  FOR ALL USING (barbershop_id = get_my_barbershop_id());

-- ✅ Banco de dados da Fase 2 pronto!
-- Novas tabelas: clients, loyalty_config, loyalty_progress, orders,
-- waitlist, reminders_config, automations, campaigns, surveys,
-- surveys_config, birthday_config
