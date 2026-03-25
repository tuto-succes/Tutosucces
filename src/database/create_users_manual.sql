-- ============================================
-- CRÉER LES UTILISATEURS DE TEST
-- ============================================
-- ⚠️ IMPORTANT : Ce script doit être exécuté dans Supabase SQL Editor
-- ⚠️ Il utilise la fonction auth.admin_create_user qui n'existe que dans Supabase

-- Nettoyer d'abord
DELETE FROM auth.users;

-- ADMIN
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'admin@tutosucces.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Administrateur B&D"}',
  false,
  'authenticated'
);

-- TUTEUR 1 : Marie Dubois
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'marie.dubois@tutosucces.com',
  crypt('Tuteur123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Marie Dubois"}',
  false,
  'authenticated'
);

-- TUTEUR 2 : Jean Martin
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'jean.martin@tutosucces.com',
  crypt('Tuteur123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Jean Martin"}',
  false,
  'authenticated'
);

-- ÉTUDIANT 1 : Lucas Tremblay
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'lucas.tremblay@gmail.com',
  crypt('Etudiant123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Lucas Tremblay"}',
  false,
  'authenticated'
);

-- ÉTUDIANT 2 : Emma Gagnon
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'emma.gagnon@gmail.com',
  crypt('Etudiant123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Emma Gagnon"}',
  false,
  'authenticated'
);

-- PARENT 1 : Pierre Tremblay
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'parent.tremblay@gmail.com',
  crypt('Parent123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Pierre Tremblay"}',
  false,
  'authenticated'
);

-- Créer les profiles correspondants
INSERT INTO profiles (id, email, name, role)
SELECT id, email, raw_user_meta_data->>'name', 
  CASE 
    WHEN email LIKE '%admin%' THEN 'admin'
    WHEN email LIKE '%tutosucces.com' THEN 'tutor'
    WHEN email LIKE '%parent%' THEN 'parent'
    ELSE 'student'
  END
FROM auth.users;

-- Vérifier la création
SELECT email, role FROM profiles ORDER BY role, email;
