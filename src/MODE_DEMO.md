# 📋 MODE DÉMONSTRATION - Tuto-Succès B&D

## 🎯 État actuel

Toutes les interactions avec la base de données Supabase ont été temporairement retirées. L'application fonctionne maintenant en mode démonstration avec des données mock pour que vous puissiez tester l'interface sans problèmes d'authentification.

## 🔑 Comptes de démonstration

Utilisez ces identifiants pour vous connecter :

### Élève / Parent
- **Email:** `eleve@demo.com`
- **Mot de passe:** `demo123`

### Tuteur
- **Email:** `tuteur@demo.com`
- **Mot de passe:** `demo123`

### Administrateur
- **Email:** `admin@demo.com`
- **Mot de passe:** `admin123`

## ✨ Fonctionnalités implémentées

### 1. Lien Zoom dans les séances
- ✅ Quand un élève a une séance confirmée, il peut voir et cliquer sur le lien Zoom
- ✅ Le lien s'affiche dans une section verte avec icône vidéo
- ✅ Le lien ouvre dans un nouvel onglet

### 2. Paiement obligatoire pour réserver
- ✅ Avant de confirmer une réservation, l'élève doit effectuer un paiement
- ✅ Un dialogue de paiement simulé s'affiche avec le récapitulatif
- ✅ Une fois le paiement "effectué", l'élève peut confirmer sa réservation
- ⚠️ **Note:** L'intégration Stripe réelle sera configurée plus tard

## 📂 Fichiers modifiés

### Données mock
- **`/utils/mockData.tsx`** - Contient toutes les données de démonstration
  - Tuteurs (4 tuteurs avec leurs profils)
  - Séances (avec liens Zoom pour les séances confirmées)
  - Messages
  - Paiements
  - Factures

### Composants principaux
- **`/App.tsx`** - Authentification simplifiée avec localStorage
- **`/components/LoginPage.tsx`** - Login sans Supabase
- **`/components/student/SessionsList.tsx`** - Affichage du lien Zoom
- **`/components/student/TutorSearch.tsx`** - Système de paiement obligatoire
- **`/components/student/MessagesPanel.tsx`** - Messages avec données mock
- **`/components/student/PaymentsHistory.tsx`** - Historique avec données mock

## 🔧 Prochaines étapes (à configurer par vous)

1. **Base de données Supabase**
   - Créer les tables nécessaires
   - Configurer les politiques de sécurité (RLS)
   - Migrer les données mock vers la vraie DB

2. **Authentification Supabase**
   - Configurer l'authentification par email/mot de passe
   - Configurer les rôles utilisateurs
   - Implémenter la création de comptes par l'admin

3. **Intégration Stripe**
   - Créer un compte Stripe
   - Configurer les clés API
   - Remplacer le dialogue de paiement simulé par Stripe Checkout
   - Gérer les webhooks de paiement

4. **Génération de liens Zoom**
   - Configurer un compte Zoom avec API
   - Créer automatiquement des liens lors de la confirmation d'une séance
   - Stocker les liens dans la base de données

## 📊 Structure des données mock

### Séances
```typescript
{
  id: string,
  studentId: string,
  tutorId: string,
  date: string (ISO),
  duration: number (heures),
  subject: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  notes: string,
  zoomLink: string | null,  // ⭐ Lien Zoom pour les séances confirmées
  tutorComment: string | null
}
```

### Tuteurs
```typescript
{
  userId: string,
  user: { name: string, email: string },
  subjects: string[],
  levels: string[],
  mode: ('online' | 'presentiel')[],
  rate: number,  // Tarif horaire en €
  bio: string,
  rating: number,
  reviewCount: number,
  approved: boolean
}
```

## 🎨 Couleurs de la marque

Les couleurs sont déjà appliquées dans toute l'application :
- **Rouge primaire:** `#E74C3C`
- **Bleu primaire:** `#2E5CA8`
- **Texte foncé:** `#2C3E50`
- **Texte clair:** `#7F8C8D`
- **Fond clair:** `#F8F9FA`
- **Blanc:** `#FFFFFF`

## 🚀 Comment tester

1. Allez sur la page d'accueil
2. Cliquez sur "Connexion"
3. Choisissez "Élève / Parent"
4. Connectez-vous avec `eleve@demo.com` / `demo123`
5. Testez les fonctionnalités :
   - ✅ Voir les séances avec liens Zoom (onglet "Séances")
   - ✅ Réserver un tuteur avec paiement obligatoire (onglet "Trouver un tuteur")
   - ✅ Envoyer des messages
   - ✅ Voir l'historique des paiements

## ⚠️ Limitations actuelles

- Les données sont réinitialisées à chaque rechargement de la page
- Les modifications ne sont pas persistées
- Le paiement est simulé (pas de vrai traitement)
- Les liens Zoom sont statiques (à générer automatiquement plus tard)
- Pas de gestion des rôles depuis la base de données

## 💡 Notes importantes

- **Tous les appels API ont été retirés** - Aucune connexion à Supabase
- **LocalStorage** est utilisé pour simuler la session utilisateur
- **Déconnexion** nettoie le localStorage
- Les fonctions de données mock simulent un délai réseau pour un effet réaliste

---

**Date de création:** 2 mars 2026
**Créé par:** Assistant IA
**Pour:** Configuration de la base de données et intégrations tierces
