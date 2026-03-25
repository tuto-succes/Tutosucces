/**
 * Script de configuration de la base de données
 * À exécuter UNE SEULE FOIS après avoir créé la table profiles
 */

import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-385c5805`;

/**
 * Crée tous les utilisateurs de test en une seule fois
 */
export async function createTestUsers() {
  console.log('🧪 Creating test users...');
  
  try {
    const response = await fetch(`${API_URL}/create-test-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create test users');
    }

    console.log('✅ Test users created successfully!');
    console.log('📊 Results:', data);
    
    return data;
  } catch (error: any) {
    console.error('❌ Error creating test users:', error.message);
    throw error;
  }
}

/**
 * Instructions pour l'utilisateur
 */
export function printSetupInstructions() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                  CONFIGURATION DE LA BASE DE DONNÉES            ║
╚══════════════════════════════════════════════════════════════════╝

📋 ÉTAPE 1 : Créer la table profiles
────────────────────────────────────────────────────────────────────
Va sur Supabase → SQL Editor et exécute :

DROP TABLE IF EXISTS profiles CASCADE;
DELETE FROM auth.users;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tutor', 'student', 'parent')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

────────────────────────────────────────────────────────────────────

📋 ÉTAPE 2 : Créer les utilisateurs de test
────────────────────────────────────────────────────────────────────
Ouvre la console du navigateur (F12) et exécute :

import { createTestUsers } from './utils/setup-database';
await createTestUsers();

────────────────────────────────────────────────────────────────────

✅ ÉTAPE 3 : Tester la connexion
────────────────────────────────────────────────────────────────────
Utilise ces identifiants :

👨‍💼 Admin:
   - Email: admin@tutosucces.com
   - Password: Admin123!

👩‍🏫 Tuteurs:
   - Email: marie.dubois@tutosucces.com / Tuteur123!
   - Email: jean.martin@tutosucces.com / Tuteur123!
   - Email: sophie.bernard@tutosucces.com / Tuteur123!

👨‍🎓 Étudiants:
   - Email: lucas.tremblay@gmail.com / Etudiant123!
   - Email: emma.gagnon@gmail.com / Etudiant123!

👨‍👩‍👧 Parents:
   - Email: parent.tremblay@gmail.com / Parent123!
   - Email: parent.gagnon@gmail.com / Parent123!

────────────────────────────────────────────────────────────────────
  `);
}
