-- ============================================================
-- BarberSuite — RLS Fix: Cadastro Dinâmico
-- Migration: 005_fix_signup_rls.sql
-- Cole este conteúdo no SQL Editor do Supabase e clique Run
-- ============================================================

-- Habilitar inserção de barbearias durante o cadastro (sign-up)
-- Quando o usuário se cadastra, o registro na tabela 'barbershops' é inserido
-- antes ou durante a ativação completa da sessão (principalmente se houver confirmação de e-mail).
-- Por isso, precisamos permitir que a barbearia correspondente seja inserida.
DROP POLICY IF EXISTS "allow_signup_insert_barbershop" ON barbershops;
CREATE POLICY "allow_signup_insert_barbershop" ON barbershops
  FOR INSERT WITH CHECK (true);
