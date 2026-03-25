# 🎓 Tuto-Succès B&D - Configuration de la base de données

## 📋 Guide d'intégration simple

### **Option 1 : Interface graphique (RECOMMANDÉ)**

1. **Accéder à la page de setup**
   ```
   Dans le navigateur, modifie l'URL pour accéder à :
   /?page=db-setup
   
   OU dans la console du navigateur :
   window.location.href = '/?page=db-setup'
   ```

2. **Suivre les instructions à l'écran**
   - Étape 1 : Copier/coller le SQL dans Supabase
   - Étape 2 : Cliquer sur "Créer les utilisateurs de test"
   - Étape 3 : Tester la connexion avec les identifiants fournis

---

### **Option 2 : Manuel (SQL + Script)**

#### **ÉTAPE 1 : Créer la table `profiles`**

Va sur **Supabase → SQL Editor** et exécute :

```sql
-- Supprimer toutes les tables existantes (sauf kv_store)
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

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

#### **ÉTAPE 2 : Créer les utilisateurs de test**

Dans la console du navigateur (F12), exécute :

```javascript
// Appeler la route pour créer les utilisateurs
const response = await fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-385c5805/create-test-users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
});

const data = await response.json();
console.log(data);
```

#### **ÉTAPE 3 : Tester la connexion**

Utilise ces identifiants :

- **Admin** : `admin@tutosucces.com` / `Admin123!`
- **Tuteur** : `marie.dubois@tutosucces.com` / `Tuteur123!`
- **Étudiant** : `lucas.tremblay@gmail.com` / `Etudiant123!`
- **Parent** : `parent.tremblay@gmail.com` / `Parent123!`

---

## 🚀 Prochaines étapes

Une fois que l'authentification fonctionne avec la table `profiles`, tu peux ajouter les autres tables **une par une** :

1. **Tables de base** : `tutors`, `students`
2. **Tables de fonctionnalités** : `sessions`, `availability`, `progress_reports`
3. **Tables avancées** : `messages`, `reviews`, `invoices`, `notifications`

Consulte `/database/schema.sql` pour le schéma complet.

---

## 📂 Fichiers importants

- `/database/schema.sql` - Schéma complet de la base de données
- `/database/seed_data.sql` - Données de test (à adapter avec les vrais UUIDs)
- `/supabase/functions/server/index.tsx` - Routes API du serveur
- `/utils/api.ts` - Fonctions helper pour appeler l'API
- `/components/DatabaseSetup.tsx` - Interface graphique de setup

---

## ⚠️ Notes importantes

- **Pas d'inscription publique** : C'est toi qui crées tous les comptes via l'admin
- **Rapports de progression** : N'apparaissent qu'à partir de la 3ème séance
- **Palette de couleurs** : Rouge #E74C3C, Bleu #2E5CA8, maintenue dans tout le code

---

## 🐛 En cas de problème

1. Vérifier que les tables existent : `SELECT * FROM profiles;` dans Supabase SQL Editor
2. Vérifier les logs du serveur : Console du navigateur + Supabase Logs
3. Tester la route health : `GET /make-server-385c5805/health`
4. Vérifier les erreurs RLS (Row Level Security) dans Supabase

---

Bonne chance ! 🎉
