# 🚀 CRÉATION AUTOMATIQUE DES UTILISATEURS

## ✅ SOLUTION LA PLUS SIMPLE !

J'ai créé une **route API automatique** qui va créer tous les 9 utilisateurs en une seule fois !

---

## 📍 Étapes :

### 1. Visitez cette URL dans votre navigateur :

```
https://coycgljteeljqzbhfyaz.supabase.co/functions/v1/make-server-385c5805/setup/create-test-users
```

**OU** utilisez curl dans le terminal :

```bash
curl -X POST https://coycgljteeljqzbhfyaz.supabase.co/functions/v1/make-server-385c5805/setup/create-test-users
```

**OU** utilisez ce bouton dans Postman/Insomnia :
- Method: `POST`
- URL: `https://coycgljteeljqzbhfyaz.supabase.co/functions/v1/make-server-385c5805/setup/create-test-users`

---

### 2. Vous verrez une réponse comme ça :

```json
{
  "message": "✅ Création des utilisateurs terminée",
  "summary": {
    "total": 9,
    "success": 9,
    "failed": 0
  },
  "results": [
    {
      "email": "admin@tutosucces.com",
      "success": true,
      "userId": "abc123..."
    },
    {
      "email": "eleve.test@example.com",
      "success": true,
      "userId": "def456..."
    },
    ...
  ]
}
```

---

### 3. Vérification

Allez dans le Dashboard Supabase pour vérifier :
👉 https://supabase.com/dashboard/project/coycgljteeljqzbhfyaz/auth/users

Vous devriez voir **9 utilisateurs** créés !

---

## 🔐 Comptes créés automatiquement :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@tutosucces.com` | `Admin123!` |
| **Étudiant** | `eleve.test@example.com` | `Eleve123!` |
| **Étudiant** | `sophie.lapointe@example.com` | `Sophie123!` |
| **Étudiant** | `lucas.gagnon@example.com` | `Lucas123!` |
| **Étudiant** | `emma.tremblay@example.com` | `Emma123!` |
| **Tuteur** | `marie@example.com` | `Marie123!` |
| **Tuteur** | `jean@example.com` | `Jean123!` |
| **Tuteur** | `sophie@example.com` | `Sophie123!` |
| **Tuteur** | `thomas@example.com` | `Thomas123!` |

---

## 🎯 Après la création

1. ✅ Les 9 utilisateurs sont créés dans Supabase Auth
2. ✅ Les emails sont automatiquement confirmés
3. 🚀 Vous pouvez maintenant vous connecter à votre application !

Testez avec :
- **Email** : `admin@tutosucces.com`
- **Password** : `Admin123!`

---

## ⚠️ En cas d'erreur "User already exists"

Si vous voyez cette erreur, c'est que les utilisateurs existent déjà ! Vous pouvez :
1. Les supprimer manuellement dans le Dashboard
2. Ou simplement utiliser les comptes existants

---

## 💡 Note

Cette route est **temporaire** et conçue uniquement pour le setup initial. Une fois les utilisateurs créés, vous n'avez plus besoin de l'utiliser.

C'est tout ! 🎉
