# 🚀 GUIDE D'INTÉGRATION SUPABASE - ULTRA SIMPLE

## ✅ ÉTAPE 1 : Créer la table `profiles` (MAINTENANT)

Va sur **Supabase → SQL Editor** et copie/colle :

```sql
-- Nettoyer d'abord
DROP TABLE IF EXISTS profiles CASCADE;
DELETE FROM auth.users;

-- Créer la table profiles
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

-- Index pour performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- RLS (sécurité)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les profiles" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

---

## ✅ ÉTAPE 2 : Créer les utilisateurs (2 options)

### **OPTION A : Interface graphique (recommandé)**

1. Va sur ton app et ajoute `?setup=true` à l'URL
2. Clique sur "Créer les utilisateurs de test"
3. C'est fait ! ✅

### **OPTION B : Créer les utilisateurs via Supabase Dashboard**

Va sur **Supabase → Authentication → Users → Add User** et crée :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@tutosucces.com | Admin123! | admin |
| marie.dubois@tutosucces.com | Tuteur123! | tutor |
| lucas.tremblay@gmail.com | Etudiant123! | student |

Puis va dans **SQL Editor** et exécute :

```sql
-- Créer les profiles pour les utilisateurs créés
INSERT INTO profiles (id, email, name, role)
SELECT 
  id, 
  email, 
  CASE 
    WHEN email = 'admin@tutosucces.com' THEN 'Administrateur B&D'
    WHEN email = 'marie.dubois@tutosucces.com' THEN 'Marie Dubois'
    WHEN email = 'lucas.tremblay@gmail.com' THEN 'Lucas Tremblay'
  END,
  CASE 
    WHEN email LIKE '%admin%' THEN 'admin'
    WHEN email LIKE '%tutosucces.com' THEN 'tutor'
    ELSE 'student'
  END
FROM auth.users
WHERE email IN ('admin@tutosucces.com', 'marie.dubois@tutosucces.com', 'lucas.tremblay@gmail.com');
```

---

## ✅ ÉTAPE 3 : Tester la connexion

Va sur ton app, page de connexion, et utilise :

- **Admin** : `admin@tutosucces.com` / `Admin123!`
- **Tuteur** : `marie.dubois@tutosucces.com` / `Tuteur123!`
- **Étudiant** : `lucas.tremblay@gmail.com` / `Etudiant123!`

---

## 📦 Ce qui a été fait dans le code

✅ **Client Supabase** : `/utils/supabase-client.ts`
- Connexion directe à Supabase (pas de serveur intermédiaire)
- Fonctions `auth.login()`, `auth.logout()`, `auth.getCurrentUser()`
- Fonctions `profiles.getById()`, `profiles.update()`, etc.

✅ **LoginPage** : Utilise maintenant le client Supabase directement
✅ **App.tsx** : Vérifie la session au démarrage
✅ **Interface de setup** : Accès via `?setup=true`

---

## 🔄 PROCHAINES TABLES (après avoir testé profiles)

Une fois que la connexion fonctionne, on ajoutera **une table à la fois** :

### **Table 2 : tutors** (profils tuteurs détaillés)
```sql
CREATE TABLE tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate DECIMAL(10,2) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Table 3 : students** (profils étudiants)
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id),
  grade_level TEXT,
  school TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Table 4 : sessions** (séances de tutorat)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id),
  student_id UUID NOT NULL REFERENCES students(id),
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tu me diras quand tu veux ajouter la table suivante !**

---

## 🐛 En cas de problème

1. **Table profiles introuvable** → Vérifie que tu as bien exécuté l'ÉTAPE 1
2. **Erreur de connexion** → Vérifie que les utilisateurs existent dans Supabase Auth
3. **Profile not found** → Vérifie que la table profiles contient des données

**Console pour débugger** :
```javascript
// Dans la console du navigateur (F12)
import { supabase } from './utils/supabase-client';

// Vérifier les profiles
const { data } = await supabase.from('profiles').select('*');
console.log(data);
```

---

## 📁 Fichiers créés

- `/utils/supabase-client.ts` - Client Supabase + fonctions auth/profiles
- `/components/DatabaseSetup.tsx` - Interface de setup (accès via `?setup=true`)
- `/database/schema.sql` - Schéma complet de toutes les tables
- `/database/create_users_manual.sql` - Script SQL pour créer les users manuellement

---

**C'est parti ! Commence par l'ÉTAPE 1 et dis-moi quand c'est fait !** 🎯
