# 🔐 CRÉATION DES COMPTES UTILISATEURS - GUIDE CORRIGÉ

## ❌ Problème

La fonction `auth.admin_create_user()` n'existe pas en SQL dans Supabase. Il faut utiliser l'API ou le Dashboard.

---

## ✅ SOLUTION 1 : Via le Dashboard (Recommandé - Plus simple)

### Étapes :

1. **Ouvrez Authentication dans Supabase** :
   👉 https://supabase.com/dashboard/project/coycgljteeljqzbhfyaz/auth/users

2. **Pour chaque utilisateur ci-dessous** :
   - Cliquez sur **"Add user"** en haut à droite
   - Sélectionnez **"Create new user"**
   - Entrez l'**Email** et le **Password**
   - ✅ **Cochez "Auto Confirm User"** (important !)
   - Cliquez sur **"Create user"**

### 👥 Liste des utilisateurs à créer :

#### 👨‍💼 Admin
- **Email** : `admin@tutosucces.com`
- **Password** : `Admin123!`

#### 👨‍🎓 Étudiants
| Email | Password |
|-------|----------|
| `eleve.test@example.com` | `Eleve123!` |
| `sophie.lapointe@example.com` | `Sophie123!` |
| `lucas.gagnon@example.com` | `Lucas123!` |
| `emma.tremblay@example.com` | `Emma123!` |

#### 👨‍🏫 Tuteurs
| Email | Password |
|-------|----------|
| `marie@example.com` | `Marie123!` |
| `jean@example.com` | `Jean123!` |
| `sophie@example.com` | `Sophie123!` |
| `thomas@example.com` | `Thomas123!` |

**Total : 9 utilisateurs à créer**

---

## ✅ SOLUTION 2 : Script automatique (Avancé)

Si vous voulez automatiser la création, j'ai créé un script dans `/supabase/functions/server/create-users.tsx`.

### Pour l'exécuter :

**Option A : Via le terminal local (si vous avez Deno installé)** :

```bash
cd supabase/functions/server
deno run --allow-env --allow-net create-users.tsx
```

**Option B : Via le serveur Supabase** :

Ajoutez une route temporaire dans `/supabase/functions/server/index.tsx` :

```typescript
// Route temporaire pour créer les utilisateurs
app.post("/make-server-385c5805/setup-users", async (c) => {
  try {
    const users = [
      { email: 'admin@tutosucces.com', password: 'Admin123!', name: 'Administrateur', role: 'admin' },
      { email: 'eleve.test@example.com', password: 'Eleve123!', name: 'Élève Test', role: 'student' },
      // ... etc (liste complète dans le fichier create-users.tsx)
    ];

    const results = [];
    for (const user of users) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: { name: user.name, role: user.role },
        email_confirm: true
      });

      results.push({ email: user.email, success: !error, error: error?.message });
    }

    return c.json({ results });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
```

Puis appelez cette route depuis Postman ou curl :
```bash
curl -X POST https://coycgljteeljqzbhfyaz.supabase.co/functions/v1/make-server-385c5805/setup-users
```

---

## ⚠️ IMPORTANT

- ✅ **Cochez toujours "Auto Confirm User"** lors de la création via le Dashboard
- ✅ Les mots de passe doivent contenir au moins 6 caractères
- ✅ N'oubliez pas de créer TOUS les 9 utilisateurs
- ⚠️ Ces mots de passe sont pour les tests uniquement - changez-les en production !

---

## 🔍 Vérification

Après avoir créé les utilisateurs, vérifiez dans le Dashboard :

1. Allez dans **Authentication → Users**
2. Vous devriez voir **9 utilisateurs** listés
3. Tous doivent avoir le statut **"Confirmed"** (pas "Waiting for verification")

---

## 🎯 Après la création

Une fois les 9 utilisateurs créés :

1. ✅ Les tables existent (étape 1 terminée)
2. ✅ Les utilisateurs existent (étape 2 terminée)
3. 🚀 Vous pouvez maintenant **tester la connexion** dans votre application !

Essayez de vous connecter avec :
- **Email** : `admin@tutosucces.com`
- **Password** : `Admin123!`

---

## 🆘 En cas de problème

Si vous avez des difficultés avec le Dashboard, je peux :
1. Créer une page d'administration dans votre app pour créer les utilisateurs
2. Vous guider étape par étape avec des captures d'écran

Dites-moi ce qui vous convient le mieux ! 😊
