# SETUP SUPABASE - ÉTAPE PAR ÉTAPE

## 🎯 ÉTAPE 1 : Créer un NOUVEAU projet Supabase

1. Va sur https://supabase.com/dashboard
2. Clique sur "New Project"
3. Nom du projet : `tuto-succes` (ou ce que tu veux)
4. Mot de passe de la base : **NOTE-LE BIEN** (tu en auras besoin)
5. Région : Europe (ou la plus proche)
6. Clique "Create new project"
7. **ATTENDS 2-3 minutes** que le projet se crée

---

## 🎯 ÉTAPE 2 : Noter les informations importantes

Une fois le projet créé, va dans **Settings** → **API** :

Tu verras :
- **Project URL** : `https://XXXXXXX.supabase.co`
- **anon public key** : `eyJhbGc...` (une LONGUE chaîne)

**📝 COPIE CES DEUX VALEURS ET ENVOIE-LES MOI**

Je vais les mettre dans le code pour connecter l'application.

---

## 🎯 ÉTAPE 3 : Créer UNE SEULE table (profiles)

1. Va dans **SQL Editor** (dans le menu de gauche)
2. Clique sur "New query"
3. Copie-colle ce code SQL :

```sql
-- Table profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'tutor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

4. Clique "Run" (en bas à droite)
5. Tu devrais voir : "Success. No rows returned"

---

## 🎯 ÉTAPE 4 : Créer UN utilisateur de test

### A. Dans Auth (pour la connexion)

1. Va dans **Authentication** → **Users** (dans le menu de gauche)
2. Clique sur "Add user" → "Create new user"
3. Remplis :
   - Email : `admin@test.com`
   - Password : `Admin123!`
   - ✅ Coche "Auto Confirm User"
4. Clique "Create user"

### B. Dans la table profiles

1. Retourne dans **SQL Editor**
2. Nouvelle query avec ce code :

```sql
INSERT INTO profiles (email, name, role)
VALUES ('admin@test.com', 'Admin Test', 'admin');
```

3. Clique "Run"
4. Tu devrais voir : "Success. No rows returned"

---

## 🎯 ÉTAPE 5 : Vérifier que ça marche

Dans le SQL Editor, copie-colle :

```sql
SELECT * FROM profiles;
```

Clique "Run"

**Tu devrais voir UNE LIGNE avec :**
- email: admin@test.com
- name: Admin Test
- role: admin

---

## ✅ C'EST BON !

Si tu vois cette ligne → **DIS-MOI ET ENVOIE-MOI tes infos de l'ÉTAPE 2** :
- Project URL
- anon public key

Je vais connecter l'application et on pourra se connecter avec `admin@test.com` / `Admin123!`

---

## ❌ SI ÇA MARCHE PAS

Dis-moi à quelle étape ça bloque et je t'aide !
