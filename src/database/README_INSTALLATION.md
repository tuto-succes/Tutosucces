# 📚 INSTALLATION COMPLÈTE DE LA BASE DE DONNÉES

## 🎯 Vue d'ensemble

Le système de base de données comprend **5 tables principales** avec toute la logique métier pour gérer une plateforme de tutorat professionnelle.

---

## 📋 ÉTAPES D'INSTALLATION

### **Étape 1 : Créer la table `profiles`**

1. Va dans Supabase → **SQL Editor**
2. Copie/colle le contenu de **`/database/01_create_profiles.sql`**
3. Clique sur **"Run"**

✅ Cette table stocke tous les utilisateurs (admin, tuteurs, élèves, parents)

---

### **Étape 2 : Créer les tables de séances**

1. Dans le **SQL Editor**
2. Copie/colle le contenu de **`/database/02_sessions_tables.sql`**
3. Clique sur **"Run"**

✅ Ceci crée :
- `tutor_availability` (disponibilités des tuteurs)
- `sessions` (toutes les séances)
- `session_comments` (commentaires post-séance)
- `progress_reports` (bilans détaillés à partir de la 3ème séance)
- `session_modifications` (historique des changements)

✅ **BONUS** : Fonctions SQL automatiques incluses :
- `check_session_conflicts()` - Empêche les conflits de créneaux
- `check_tutor_availability()` - Vérifie la disponibilité du tuteur
- `count_completed_sessions()` - Compte les séances terminées
- `can_modify_session()` - Vérifie le délai de 24h
- `generate_meeting_link()` - Génère un lien Zoom automatique

✅ **TRIGGERS AUTOMATIQUES** :
- Génération automatique du lien Zoom lors de la confirmation
- Mise à jour automatique du champ `updated_at`
- Vérification des conflits avant insertion/modification

---

### **Étape 3 : Créer les utilisateurs de test**

1. Va sur ton application : **`?setup=true`**
2. Clique sur **"Créer les utilisateurs"**
3. Attends la confirmation

✅ Ceci crée 3 comptes :
- **Admin** : `admin@tutosucces.com` / `Admin123!`
- **Tuteur** : `marie.dubois@tutosucces.com` / `Tuteur123!`
- **Élève** : `lucas.tremblay@gmail.com` / `Etudiant123!`

---

### **Étape 4 : Ajouter les données de test (OPTIONNEL)**

1. Dans le **SQL Editor**
2. Copie/colle le contenu de **`/database/03_sessions_test_data.sql`**
3. Clique sur **"Run"**

✅ Ceci crée :
- **Disponibilités** pour Marie Dubois (Lun-Ven 9h-17h, Sam 10h-14h)
- **8 séances de test** dans différents états :
  * 1 en attente (le tuteur doit valider)
  * 2 confirmées (avec lien Zoom)
  * 3 terminées (avec commentaires + 1 bilan détaillé)
  * 1 annulée
  * 1 modifiable (>24h)
  * 1 NON modifiable (<24h)

---

## 🎯 FONCTIONNALITÉS IMPLÉMENTÉES

### ✅ **1. Système de réservation complet**

#### **Flux de réservation :**
1. **L'élève** cherche un tuteur et fait une demande → Statut `pending`
2. **Le tuteur** valide la demande → Statut `confirmed`
3. **Système** génère automatiquement un lien Zoom
4. **Après la séance** → Statut `completed`
5. **Tuteur** ajoute un commentaire post-séance
6. **À partir de la 3ème séance** → Bilan de progression détaillé

#### **Règles de modification/annulation :**
- ✅ **Plus de 24h avant** : Modification/annulation possible
- ❌ **Moins de 24h avant** : Modification/annulation IMPOSSIBLE
- 🔄 **Historique complet** dans `session_modifications`

---

### ✅ **2. Prévention des conflits**

#### **Le système vérifie automatiquement :**
1. **Conflit de créneaux** : Un tuteur ne peut pas avoir 2 séances en même temps
2. **Disponibilité du tuteur** : La séance doit être dans les créneaux disponibles
3. **Chevauchement** : Détection intelligente de tous les types de conflits

#### **Erreurs automatiques si :**
```sql
-- Exemple : Conflit détecté
ERREUR: Conflit de séance : le tuteur a déjà une séance à ce créneau

-- Exemple : Hors disponibilité
ERREUR: Le tuteur n'est pas disponible à ce créneau
```

---

### ✅ **3. Génération automatique du lien Zoom**

Quand le tuteur confirme une séance :
```
Statut: pending → confirmed
↓
TRIGGER automatique
↓
Génère meeting_link = "https://zoom.us/j/1234567890"
Génère meeting_password = "abc123"
```

---

### ✅ **4. Bilans de progression (3ème séance)**

#### **Règle métier :**
- ❌ **1ère et 2ème séance** : Commentaire simple uniquement
- ✅ **À partir de la 3ème séance** : Bilan détaillé obligatoire

#### **Contenu du bilan :**
```typescript
{
  understanding_level: 1-5,      // Niveau de compréhension
  participation_level: 1-5,      // Niveau de participation
  homework_completion: 1-5,      // Complétion des devoirs
  progress_since_last: 1-5,      // Progression depuis la dernière séance
  
  strengths: "Points forts...",
  areas_to_improve: "Points à améliorer...",
  topics_covered: "Sujets abordés...",
  homework_assigned: "Devoirs assignés...",
  next_session_goals: "Objectifs prochaine séance...",
  tutor_comments: "Commentaires généraux..."
}
```

---

### ✅ **5. Sécurité (Row Level Security)**

#### **Permissions automatiques :**
- 👨‍🎓 **Élèves** : Voient uniquement LEURS séances
- 👨‍🏫 **Tuteurs** : Voient uniquement LEURS séances
- 👨‍💼 **Admin** : Voit TOUTES les séances
- 🔒 **Autres utilisateurs** : Ne voient RIEN

---

## 📊 STRUCTURE DES TABLES

### **1. `tutor_availability`** (Disponibilités)
```
- tutor_id (UUID)
- day_of_week (0-6) → Dimanche à Samedi
- start_time / end_time
- is_recurring (true = chaque semaine)
- specific_date (pour dates exceptionnelles)
```

### **2. `sessions`** (Séances)
```
- student_id, tutor_id
- subject, level
- session_date, start_time, end_time
- status (pending/confirmed/completed/cancelled)
- meeting_link, meeting_password
- price_per_hour, total_price
- student_notes, tutor_notes
```

### **3. `session_comments`** (Commentaires)
```
- session_id, author_id
- comment, rating (1-5)
- is_visible_to_student, is_visible_to_parent
```

### **4. `progress_reports`** (Bilans détaillés)
```
- session_id, student_id, tutor_id
- session_number (minimum 3)
- understanding_level, participation_level, etc.
- strengths, areas_to_improve, topics_covered
- homework_assigned, next_session_goals
```

### **5. `session_modifications`** (Historique)
```
- session_id, modified_by
- modification_type (reschedule/cancel/confirm)
- old_date, new_date (pour reschedule)
- reason
```

---

## 🧪 TESTER LES FONCTIONS

### **Test 1 : Vérifier un conflit**
```sql
SELECT check_session_conflicts(
  '00000000-0000-0000-0000-000000000000'::UUID, -- tutor_id
  '2026-04-01'::DATE,
  '14:00'::TIME,
  '15:00'::TIME,
  NULL
);
-- Retourne false s'il y a un conflit, true sinon
```

### **Test 2 : Vérifier la disponibilité**
```sql
SELECT check_tutor_availability(
  '00000000-0000-0000-0000-000000000000'::UUID, -- tutor_id
  '2026-04-01'::DATE, -- Un mardi
  '10:00'::TIME,
  '11:00'::TIME
);
-- Retourne true si le tuteur est dispo, false sinon
```

### **Test 3 : Compter les séances complétées**
```sql
SELECT count_completed_sessions(
  'student_id'::UUID,
  'tutor_id'::UUID
);
-- Retourne le nombre de séances terminées
```

### **Test 4 : Vérifier si modification possible (24h)**
```sql
SELECT 
  session_date,
  start_time,
  can_modify_session(id) as modifiable
FROM sessions
WHERE status = 'confirmed';
```

---

## 🔍 VUES UTILES

### **Vue 1 : Séances détaillées**
```sql
SELECT * FROM sessions_detailed;
-- Inclut les noms des élèves/tuteurs, nombre de commentaires, etc.
```

### **Vue 2 : Statistiques par tuteur**
```sql
SELECT * FROM tutor_statistics;
-- Total séances, séances complétées, revenus, etc.
```

---

## 🚨 ERREURS COURANTES

### **Erreur 1 : "relation profiles does not exist"**
**Solution** : Exécute d'abord `01_create_profiles.sql`

### **Erreur 2 : "Conflit de séance"**
**Cause** : Le tuteur a déjà une séance à ce créneau
**Solution** : Change l'heure ou la date

### **Erreur 3 : "Le tuteur n'est pas disponible"**
**Cause** : Hors des créneaux de disponibilité
**Solution** : Ajoute des disponibilités dans `tutor_availability`

### **Erreur 4 : "CHECK constraint progress_reports session_number"**
**Cause** : Tentative de créer un bilan avant la 3ème séance
**Solution** : Attends d'avoir au moins 3 séances complétées

---

## 📝 PROCHAINES ÉTAPES

Après installation :
1. ✅ Teste la connexion avec les comptes créés
2. ✅ Vérifie que les séances de test s'affichent
3. ✅ Teste la réservation d'une nouvelle séance
4. ✅ Teste la confirmation par un tuteur
5. ✅ Vérifie la génération du lien Zoom
6. ✅ Teste l'ajout d'un commentaire post-séance
7. ✅ Après 3 séances, vérifie le bilan de progression

---

## 💡 CONSEILS

- 🔄 **Backup régulier** : Exporte ta base via Supabase Dashboard
- 🧹 **Données de test** : Supprime-les avant le lancement en prod
- 🔒 **RLS activé** : Ne désactive JAMAIS Row Level Security
- 📊 **Logs** : Surveille les logs Supabase pour les erreurs

---

## 🎉 TOUT EST PRÊT !

Tu as maintenant un système de séances complet avec :
- ✅ Réservation intelligente
- ✅ Prévention des conflits
- ✅ Lien Zoom automatique
- ✅ Commentaires post-séance
- ✅ Bilans de progression détaillés
- ✅ Règle des 24h pour modifications
- ✅ Sécurité complète (RLS)

**Prochaine étape : Intégrer l'API dans le frontend ! 🚀**
