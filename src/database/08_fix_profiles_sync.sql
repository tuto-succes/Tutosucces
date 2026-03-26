-- ============================================
-- FIX : SYNCHRONISER PROFILS AVEC AUTH.USERS
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Étape 1 : Voir les auth.users existants et leurs profils
SELECT
  au.id as auth_id,
  au.email,
  p.id as profile_id,
  p.role,
  CASE WHEN p.id IS NULL THEN '❌ PROFIL MANQUANT' ELSE '✅ OK' END as status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.email;

-- Étape 2 : Créer les profils manquants automatiquement
-- (pour les users auth qui n'ont pas de profil)
INSERT INTO profiles (id, email, name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  CASE
    WHEN au.email ILIKE '%admin%' THEN 'admin'
    WHEN au.email ILIKE '%tutor%' OR au.email ILIKE '%tutosucces.com%' AND au.email NOT ILIKE '%admin%' THEN 'tutor'
    WHEN au.email ILIKE '%parent%' THEN 'parent'
    ELSE 'student'
  END
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Étape 3 : Créer un trigger pour auto-créer les profils lors d'une inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Étape 4 : Vérification finale
SELECT id, email, name, role FROM profiles ORDER BY role, email;
