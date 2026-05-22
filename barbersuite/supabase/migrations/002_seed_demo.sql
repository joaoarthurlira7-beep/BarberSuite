-- ============================================================
-- BarberSuite — Seed Data (Demo Tenant: Barbearia Suite)
-- Migration: 002_seed_demo.sql
-- Run AFTER creating a user via Supabase Auth UI
-- ============================================================

-- NOTE: Replace 'YOUR-USER-UUID' with the actual UUID from auth.users
-- after you create your account at /signup

-- Demo barbershop (the existing Barbearia Suite becomes the first tenant)
INSERT INTO barbershops (
  slug, name, owner_id,
  primary_color, tagline,
  phone, whatsapp,
  address, city, state,
  plan, plan_status,
  working_hours
) VALUES (
  'barbearia-suite',
  'Barbearia Suite',
  NULL, -- Update with your user UUID after signup
  '#ffffff',
  'Precisão. Estilo.',
  '(11) 99999-9999',
  '5511999999999',
  'Avenida Paulista, 1000',
  'São Paulo',
  'SP',
  'pro',
  'active',
  '{"mon":["08:00","20:00"],"tue":["08:00","20:00"],"wed":["08:00","20:00"],"thu":["08:00","20:00"],"fri":["08:00","20:00"],"sat":["08:00","18:00"],"sun":null}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Demo barbers for Barbearia Suite
INSERT INTO barbers (barbershop_id, name, role, bio, color)
SELECT 
  id,
  'José Shaper',
  'Proprietário & Mestre Barbeiro',
  'Com uma paixão inabalável pela precisão, combina técnicas tradicionais com um olhar moderno.',
  '#ffffff'
FROM barbershops WHERE slug = 'barbearia-suite'
ON CONFLICT DO NOTHING;

INSERT INTO barbers (barbershop_id, name, role, bio, color)
SELECT 
  id,
  'Pablo Barber',
  'Proprietário & Barbeiro',
  'Especialista em visagismo e estilos clássicos com precisão absoluta.',
  '#c0c0c0'
FROM barbershops WHERE slug = 'barbearia-suite'
ON CONFLICT DO NOTHING;

-- Demo services for Barbearia Suite
INSERT INTO services (barbershop_id, name, description, price, duration_min, sort_order)
SELECT id, 'Fade Clássico', 'Degradê perfeito, alinhamento e acabamento na navalha.', 50.00, 45, 1 FROM barbershops WHERE slug = 'barbearia-suite'
ON CONFLICT DO NOTHING;

INSERT INTO services (barbershop_id, name, description, price, duration_min, sort_order)
SELECT id, 'Ritual de Barba', 'Toalha quente, óleos essenciais, alinhamento e massagem.', 40.00, 30, 2 FROM barbershops WHERE slug = 'barbearia-suite'
ON CONFLICT DO NOTHING;

INSERT INTO services (barbershop_id, name, description, price, duration_min, sort_order)
SELECT id, 'Full Experience', 'Corte + Barba + Máscara Negra + Bebida cortesia.', 80.00, 90, 3 FROM barbershops WHERE slug = 'barbearia-suite'
ON CONFLICT DO NOTHING;

INSERT INTO services (barbershop_id, name, description, price, duration_min, sort_order)
SELECT id, 'Corte Infantil', 'Corte para crianças com a mesma precisão e paciência.', 45.00, 40, 4 FROM barbershops WHERE slug = 'barbearia-suite'
ON CONFLICT DO NOTHING;

INSERT INTO services (barbershop_id, name, description, price, duration_min, sort_order)
SELECT id, 'Corte + Lavagem', 'Corte profissional com lavagem e finalização premium.', 60.00, 60, 5 FROM barbershops WHERE slug = 'barbearia-suite'
ON CONFLICT DO NOTHING;
