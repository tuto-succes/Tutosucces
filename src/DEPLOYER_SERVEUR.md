# 🚀 DÉPLOYER LE SERVEUR BACKEND

## Étape 1️⃣ : Installer Supabase CLI

### Sur Mac/Linux :
```bash
brew install supabase/tap/supabase
```

### Sur Windows :
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**OU télécharge depuis :** https://github.com/supabase/cli/releases

---

## Étape 2️⃣ : Se connecter à Supabase

```bash
supabase login
```

→ Ça va ouvrir ton navigateur pour te connecter.
→ Clique sur "Authorize"

---

## Étape 3️⃣ : Lier ton projet

```bash
supabase link --project-ref ytmztlafcbhemitqjkvr
```

→ Il va te demander ton **Database Password** (celui que tu as noté quand tu as créé le projet)

---

## Étape 4️⃣ : Déployer le serveur

```bash
supabase functions deploy server
```

### ✅ Tu devrais voir :
```
Deploying Function server...
Function URL: https://ytmztlafcbhemitqjkvr.supabase.co/functions/v1/server
```

---

## Étape 5️⃣ : Tester

Une fois déployé, **recharge la page** de l'application et essaie de te connecter !

---

## ❌ Si tu as une erreur "command not found"

→ Tu n'as pas installé Supabase CLI. Refais l'Étape 1️⃣

## ❌ Si tu as une erreur "Project not found"

→ Le project-ref est incorrect. Vérifie que c'est bien `ytmztlafcbhemitqjkvr`

---

**Lance ces commandes dans ton terminal et dis-moi si ça marche !** 🚀
