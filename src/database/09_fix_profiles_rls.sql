-- ============================================
-- FIX : INFINITE RECURSION SUR PROFILES RLS
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Supprimer TOUTES les policies existantes sur profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "bank_info_admin" ON tutor_bank_info;
DROP POLICY IF EXISTS "payouts_admin" ON tutor_payouts;

-- Recréer des policies simples SANS récursion
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Recréer les policies admin pour tutor_bank_info SANS référencer profiles
-- (utilise auth.jwt() à la place pour éviter la récursion)
CREATE POLICY "bank_info_admin_fixed" ON tutor_bank_info
  FOR SELECT USING (
    tutor_id = auth.uid()
    OR (auth.jwt() ->> 'role') = 'service_role'
  );

CREATE POLICY "payouts_admin_fixed" ON tutor_payouts
  FOR ALL USING (
    tutor_id = auth.uid()
    OR (auth.jwt() ->> 'role') = 'service_role'
  );

-- Vérification
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';
