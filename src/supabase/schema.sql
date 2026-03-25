-- ============================================================================
-- TUTOSUCCÈS - SCHÉMA DE BASE DE DONNÉES POSTGRESQL
-- ============================================================================
-- Ce fichier contient toute la structure de la base de données pour la plateforme de tutorat
-- À exécuter dans le SQL Editor de Supabase : https://supabase.com/dashboard/project/coycgljteeljqzbhfyaz/sql
--
-- INSTRUCTIONS :
-- 1. Copiez tout le contenu de ce fichier
-- 2. Allez dans SQL Editor de votre projet Supabase
-- 3. Collez et exécutez le script
-- ============================================================================

-- ============================================================================
-- 1. SUPPRESSION DES TABLES EXISTANTES (si nécessaire)
-- ============================================================================
DROP TABLE IF EXISTS progress_reports CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS tutor_availability CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS tutor_applications CASCADE;
DROP TABLE IF EXISTS tax_receipts CASCADE;

-- ============================================================================
-- 2. TABLE PROFILES - Profils utilisateurs
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL, -- Compatible avec l'auth existant
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'tutor', 'admin', 'parent')),
  
  -- Champs spécifiques aux tuteurs
  subjects TEXT[], -- Array de matières enseignées
  levels TEXT[], -- Array de niveaux (Primaire, Secondaire, CÉGEP)
  mode TEXT[], -- Array de modes (online, presentiel)
  rate DECIMAL(10, 2), -- Tarif horaire
  bio TEXT, -- Biographie du tuteur
  rating DECIMAL(3, 2) DEFAULT 0, -- Note moyenne
  review_count INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT false, -- Tuteur approuvé par admin
  
  -- Champs spécifiques aux étudiants/parents
  student_level TEXT, -- Niveau scolaire de l'élève
  parent_name TEXT, -- Nom du parent (si role = student)
  parent_email TEXT, -- Email du parent
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_approved ON profiles(approved) WHERE role = 'tutor';

-- ============================================================================
-- 3. TABLE TUTOR_AVAILABILITY - Disponibilités des tuteurs
-- ============================================================================
CREATE TABLE tutor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=dimanche, 6=samedi
  start_time TIME NOT NULL, -- Format HH:MM
  end_time TIME NOT NULL, -- Format HH:MM
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_availability_tutor ON tutor_availability(tutor_id);
CREATE INDEX idx_availability_day ON tutor_availability(day_of_week);

-- ============================================================================
-- 4. TABLE SESSIONS - Séances de tutorat
-- ============================================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL, -- ID externe (ex: session-1)
  student_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  tutor_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  tutor_name TEXT NOT NULL,
  
  -- Détails de la séance
  session_date TIMESTAMPTZ NOT NULL,
  session_time TEXT NOT NULL, -- Format "HH:mm"
  duration DECIMAL(4, 2) NOT NULL, -- Durée en heures (ex: 1.5)
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'pending')),
  
  -- Notes et liens
  notes TEXT,
  zoom_link TEXT,
  tutor_comment TEXT, -- Commentaire du tuteur après la séance
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_sessions_student ON sessions(student_id);
CREATE INDEX idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_session_id ON sessions(session_id);

-- ============================================================================
-- 5. TABLE PAYMENTS - Historique des paiements
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT UNIQUE NOT NULL, -- ID externe (ex: payment-1)
  student_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  tutor_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(session_id) ON DELETE SET NULL,
  invoice_id TEXT, -- Référence vers la facture
  
  -- Détails du paiement
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  payment_date TIMESTAMPTZ NOT NULL,
  method TEXT, -- Mode de paiement (Carte, Interac, etc.)
  
  -- Informations de la séance
  tutor_name TEXT NOT NULL,
  student_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  duration DECIMAL(4, 2) NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_tutor ON payments(tutor_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);

-- ============================================================================
-- 6. TABLE INVOICES - Factures
-- ============================================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT UNIQUE NOT NULL, -- ID externe (ex: INV-2026-001)
  student_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Informations client
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  
  -- Dates et statut
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('Payé', 'À payer', 'En retard')),
  
  -- Montants
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount_gst DECIMAL(10, 2) DEFAULT 0, -- TPS
  tax_amount_qst DECIMAL(10, 2) DEFAULT 0, -- TVQ
  total_due DECIMAL(10, 2) NOT NULL,
  
  -- Ligne items (JSON array)
  line_items JSONB NOT NULL, -- Array d'objets {date, studentName, subject, durationHours, rate, total}
  
  -- Lien de paiement
  payment_link_url TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_invoice_id ON invoices(invoice_id);
CREATE INDEX idx_invoices_status ON invoices(payment_status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);

-- ============================================================================
-- 7. TABLE MESSAGES - Messagerie
-- ============================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT UNIQUE NOT NULL, -- ID externe (ex: msg-1)
  conversation_id TEXT NOT NULL, -- Pour grouper les messages par conversation
  
  sender_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  receiver_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL, -- Alias pour compatibilité
  
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_read ON messages(read);

-- ============================================================================
-- 8. TABLE PROGRESS_REPORTS - Bilans de progression
-- ============================================================================
CREATE TABLE progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT UNIQUE NOT NULL, -- ID externe (ex: report-1)
  
  student_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  tutor_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  tutor_name TEXT NOT NULL,
  
  -- Détails du rapport
  report_date TIMESTAMPTZ NOT NULL,
  subject TEXT NOT NULL,
  session_number INTEGER NOT NULL, -- Numéro de la séance (min 3)
  
  -- Contenu du bilan
  strengths TEXT NOT NULL, -- Points forts
  areas_for_improvement TEXT NOT NULL, -- Points à améliorer
  recommendations TEXT NOT NULL, -- Recommandations
  overall_progress TEXT NOT NULL, -- Progrès global
  next_steps TEXT, -- Prochaines étapes
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT min_session_number CHECK (session_number >= 3)
);

CREATE INDEX idx_reports_student ON progress_reports(student_id);
CREATE INDEX idx_reports_tutor ON progress_reports(tutor_id);
CREATE INDEX idx_reports_date ON progress_reports(report_date);

-- ============================================================================
-- 9. TABLE CONTACT_MESSAGES - Messages de contact du site
-- ============================================================================
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_contact_date ON contact_messages(created_at);

-- ============================================================================
-- 10. TABLE TUTOR_APPLICATIONS - Demandes de tuteurs
-- ============================================================================
CREATE TABLE tutor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subjects TEXT[] NOT NULL,
  levels TEXT[] NOT NULL,
  experience TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT, -- Notes de l'admin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applications_status ON tutor_applications(status);
CREATE INDEX idx_applications_date ON tutor_applications(created_at);

-- ============================================================================
-- 11. TABLE TAX_RECEIPTS - Relevés fiscaux
-- ============================================================================
CREATE TABLE tax_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id TEXT UNIQUE NOT NULL, -- ID externe (ex: TAX-2026-001)
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'tutor')),
  
  -- Période fiscale
  year INTEGER NOT NULL,
  
  -- Montants
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Détails (JSON)
  details JSONB NOT NULL, -- Détails des paiements/revenus
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'downloaded')),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tax_receipts_user ON tax_receipts(user_id);
CREATE INDEX idx_tax_receipts_year ON tax_receipts(year);
CREATE INDEX idx_tax_receipts_type ON tax_receipts(user_type);

-- ============================================================================
-- 12. INSERTION DES DONNÉES D'EXEMPLE
-- ============================================================================

-- Profils utilisateurs
INSERT INTO profiles (user_id, email, name, phone, role, created_at) VALUES
-- Admin
('admin-1', 'admin@tutosucces.com', 'Administrateur', '(514) 000-0000', 'admin', '2024-01-01T00:00:00Z'),

-- Étudiants
('student-1', 'eleve.test@example.com', 'Élève Test', '(514) 123-4567', 'student', '2025-01-15T00:00:00Z'),
('student-2', 'sophie.lapointe@example.com', 'Sophie Lapointe', '(438) 555-1111', 'student', '2025-02-01T00:00:00Z'),
('student-3', 'lucas.gagnon@example.com', 'Lucas Gagnon', '(450) 555-2222', 'student', '2025-02-10T00:00:00Z'),
('student-4', 'emma.tremblay@example.com', 'Emma Tremblay', '(514) 555-3333', 'student', '2025-02-15T00:00:00Z'),

-- Tuteurs
('tutor-1', 'marie@example.com', 'Marie Dubois', '(514) 555-3333', 'tutor', '2024-12-01T00:00:00Z'),
('tutor-2', 'jean@example.com', 'Jean Tremblay', '(438) 555-4444', 'tutor', '2024-12-15T00:00:00Z'),
('tutor-3', 'sophie@example.com', 'Sophie Martin', '(450) 555-5555', 'tutor', '2025-01-01T00:00:00Z'),
('tutor-4', 'thomas@example.com', 'Thomas Gagnon', '(514) 555-6666', 'tutor', '2025-01-10T00:00:00Z');

-- Mise à jour des tuteurs avec leurs informations spécifiques
UPDATE profiles SET 
  subjects = ARRAY['Mathématiques', 'Physique', 'Chimie'],
  levels = ARRAY['Secondaire', 'CÉGEP'],
  mode = ARRAY['online', 'presentiel'],
  rate = 35,
  bio = 'Tutrice expérimentée en sciences avec 5 ans d''expérience. Spécialisée dans la préparation aux examens.',
  rating = 4.8,
  review_count = 24,
  approved = true
WHERE user_id = 'tutor-1';

UPDATE profiles SET 
  subjects = ARRAY['Français', 'Littérature', 'Histoire'],
  levels = ARRAY['Primaire', 'Secondaire'],
  mode = ARRAY['online'],
  rate = 30,
  bio = 'Passionné par l''enseignement du français et de la littérature. Méthodes pédagogiques adaptées à chaque élève.',
  rating = 4.9,
  review_count = 31,
  approved = true
WHERE user_id = 'tutor-2';

UPDATE profiles SET 
  subjects = ARRAY['Anglais', 'Espagnol'],
  levels = ARRAY['Primaire', 'Secondaire', 'CÉGEP'],
  mode = ARRAY['online', 'presentiel'],
  rate = 40,
  bio = 'Professeure de langues certifiée. Bilingue français-anglais, avec expérience internationale.',
  rating = 5.0,
  review_count = 18,
  approved = true
WHERE user_id = 'tutor-3';

UPDATE profiles SET 
  subjects = ARRAY['Mathématiques', 'Informatique', 'Programmation'],
  levels = ARRAY['Secondaire', 'CÉGEP'],
  mode = ARRAY['online'],
  rate = 45,
  bio = 'Ingénieur logiciel et tuteur en mathématiques et programmation. Spécialisé en Python et JavaScript.',
  rating = 4.7,
  review_count = 15,
  approved = true
WHERE user_id = 'tutor-4';

-- Disponibilités des tuteurs
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time) VALUES
-- Marie Dubois (tutor-1)
('tutor-1', 1, '09:00', '12:00'), ('tutor-1', 1, '14:00', '18:00'), -- Lundi
('tutor-1', 2, '10:00', '16:00'), -- Mardi
('tutor-1', 3, '14:00', '20:00'), -- Mercredi
('tutor-1', 4, '09:00', '12:00'), ('tutor-1', 4, '16:00', '19:00'), -- Jeudi
('tutor-1', 5, '10:00', '17:00'), -- Vendredi

-- Jean Tremblay (tutor-2)
('tutor-2', 1, '13:00', '19:00'), -- Lundi
('tutor-2', 2, '13:00', '19:00'), -- Mardi
('tutor-2', 3, '15:00', '21:00'), -- Mercredi
('tutor-2', 4, '13:00', '19:00'), -- Jeudi
('tutor-2', 6, '09:00', '15:00'), -- Samedi

-- Sophie Martin (tutor-3)
('tutor-3', 1, '08:00', '12:00'), ('tutor-3', 1, '14:00', '17:00'), -- Lundi
('tutor-3', 2, '08:00', '17:00'), -- Mardi
('tutor-3', 3, '08:00', '17:00'), -- Mercredi
('tutor-3', 4, '08:00', '12:00'), ('tutor-3', 4, '14:00', '17:00'), -- Jeudi
('tutor-3', 5, '08:00', '17:00'), -- Vendredi

-- Thomas Gagnon (tutor-4)
('tutor-4', 1, '18:00', '22:00'), -- Lundi
('tutor-4', 2, '18:00', '22:00'), -- Mardi
('tutor-4', 3, '18:00', '22:00'), -- Mercredi
('tutor-4', 4, '18:00', '22:00'), -- Jeudi
('tutor-4', 6, '10:00', '18:00'), -- Samedi
('tutor-4', 0, '10:00', '18:00'); -- Dimanche

-- Séances de tutorat
INSERT INTO sessions (session_id, student_id, tutor_id, student_name, tutor_name, session_date, session_time, duration, subject, status, notes, tutor_comment) VALUES
('session-1', 'student-1', 'tutor-1', 'Élève Test', 'Marie Dubois', '2026-03-05T14:00:00Z', '14:00', 1.5, 'Mathématiques', 'completed', 'Excellente séance ! Travail sur les systèmes d''équations et les matrices.', 'Excellente séance ! L''élève a bien compris les concepts d''algèbre linéaire.'),
('session-2', 'student-1', 'tutor-2', 'Élève Test', 'Jean Tremblay', '2026-03-08T10:00:00Z', '10:00', 2, 'Français', 'scheduled', 'Aide à la rédaction de dissertation', NULL),
('session-3', 'student-1', 'tutor-3', 'Élève Test', 'Sophie Martin', '2026-02-28T16:00:00Z', '16:00', 1, 'Anglais', 'completed', 'Practice conversation', 'Très bonne séance de conversation! L''élève gagne en confiance.'),
('session-4', 'student-1', 'tutor-1', 'Élève Test', 'Marie Dubois', '2026-03-12T15:00:00Z', '15:00', 1, 'Physique', 'pending', 'Introduction à la mécanique quantique', NULL),

-- Sophie Lapointe - Séances pour tester le bilan de progression
('session-5', 'student-2', 'tutor-1', 'Sophie Lapointe', 'Marie Dubois', '2026-02-20T14:00:00Z', '14:00', 1.5, 'Mathématiques', 'completed', 'Introduction aux fractions', 'Très bonne première séance! L''élève est attentif et motivé.'),
('session-6', 'student-2', 'tutor-1', 'Sophie Lapointe', 'Marie Dubois', '2026-02-25T14:00:00Z', '14:00', 1.5, 'Mathématiques', 'completed', 'Opérations avec les fractions', 'Bonnes améliorations. L''élève maîtrise maintenant les opérations de base.'),
('session-7', 'student-2', 'tutor-1', 'Sophie Lapointe', 'Marie Dubois', '2026-03-03T14:00:00Z', '14:00', 1.5, 'Mathématiques', 'confirmed', '3ème séance - Fractions complexes', NULL),

-- Lucas Gagnon
('session-8', 'student-3', 'tutor-1', 'Lucas Gagnon', 'Marie Dubois', '2026-02-18T10:00:00Z', '10:00', 2, 'Chimie', 'completed', 'Introduction à la chimie organique', 'Excellente première séance! Lucas comprend rapidement.'),
('session-9', 'student-3', 'tutor-1', 'Lucas Gagnon', 'Marie Dubois', '2026-02-23T10:00:00Z', '10:00', 2, 'Chimie', 'completed', 'Groupes fonctionnels et réactions', 'Progrès remarquables!'),
('session-10', 'student-3', 'tutor-1', 'Lucas Gagnon', 'Marie Dubois', '2026-03-06T10:00:00Z', '10:00', 2, 'Chimie', 'confirmed', '3ème séance - Mécanismes réactionnels', NULL),

-- Emma Tremblay
('session-11', 'student-4', 'tutor-1', 'Emma Tremblay', 'Marie Dubois', '2026-02-19T16:00:00Z', '16:00', 1.5, 'Physique', 'completed', 'Cinématique - MRU', 'Première séance très productive!'),
('session-12', 'student-4', 'tutor-1', 'Emma Tremblay', 'Marie Dubois', '2026-02-26T16:00:00Z', '16:00', 1.5, 'Physique', 'completed', 'MRUA', 'Bonne progression!'),
('session-13', 'student-4', 'tutor-1', 'Emma Tremblay', 'Marie Dubois', '2026-03-04T16:00:00Z', '16:00', 1.5, 'Physique', 'confirmed', '3ème séance - Forces et lois de Newton', NULL);

-- Paiements
INSERT INTO payments (payment_id, student_id, tutor_id, session_id, invoice_id, amount, status, payment_date, method, tutor_name, student_name, subject, duration, rate) VALUES
('payment-1', 'student-1', 'tutor-3', 'session-3', 'INV-2026-002', 40, 'completed', '2026-02-28T17:00:00Z', 'Carte de crédit', 'Sophie Martin', 'Élève Test', 'Anglais', 1, 40),
('payment-2', 'student-1', 'tutor-1', 'session-1', 'INV-2026-001', 52.50, 'completed', '2026-02-25T14:00:00Z', 'Interac', 'Marie Dubois', 'Élève Test', 'Mathématiques', 1.5, 35),
('payment-3', 'student-2', 'tutor-1', 'session-5', 'INV-2026-003', 52.50, 'completed', '2026-02-20T14:00:00Z', 'Carte de crédit', 'Marie Dubois', 'Sophie Lapointe', 'Mathématiques', 1.5, 35),
('payment-4', 'student-2', 'tutor-1', 'session-6', 'INV-2026-004', 52.50, 'completed', '2026-02-25T14:00:00Z', 'Interac', 'Marie Dubois', 'Sophie Lapointe', 'Mathématiques', 1.5, 35);

-- Factures
INSERT INTO invoices (invoice_id, student_id, client_name, client_email, student_name, invoice_date, due_date, payment_status, subtotal, discount_amount, tax_amount_gst, tax_amount_qst, total_due, line_items) VALUES
('INV-2026-001', 'student-1', 'Parent Test', 'parent.test@example.com', 'Élève Test', '2026-02-25T00:00:00Z', '2026-03-11T00:00:00Z', 'Payé', 52.50, 0, 0, 0, 52.50, '[{"date": "2026-02-25T14:00:00Z", "studentName": "Élève Test", "subject": "Mathématiques", "durationHours": 1.5, "rate": 35, "total": 52.50}]'::jsonb),
('INV-2026-002', 'student-1', 'Parent Test', 'parent.test@example.com', 'Élève Test', '2026-02-28T00:00:00Z', '2026-03-14T00:00:00Z', 'Payé', 40, 0, 0, 0, 40, '[{"date": "2026-02-28T16:00:00Z", "studentName": "Élève Test", "subject": "Anglais", "durationHours": 1, "rate": 40, "total": 40}]'::jsonb),
('INV-2026-003', 'student-2', 'M. Lapointe', 'lapointe@example.com', 'Sophie Lapointe', '2026-02-20T00:00:00Z', '2026-03-06T00:00:00Z', 'Payé', 52.50, 0, 0, 0, 52.50, '[{"date": "2026-02-20T14:00:00Z", "studentName": "Sophie Lapointe", "subject": "Mathématiques", "durationHours": 1.5, "rate": 35, "total": 52.50}]'::jsonb),
('INV-2026-004', 'student-2', 'M. Lapointe', 'lapointe@example.com', 'Sophie Lapointe', '2026-02-25T00:00:00Z', '2026-03-11T00:00:00Z', 'À payer', 52.50, 0, 0, 0, 52.50, '[{"date": "2026-02-25T14:00:00Z", "studentName": "Sophie Lapointe", "subject": "Mathématiques", "durationHours": 1.5, "rate": 35, "total": 52.50}]'::jsonb);

-- Messages
INSERT INTO messages (message_id, conversation_id, sender_id, sender_name, receiver_id, recipient_id, content, read, timestamp) VALUES
('msg-1', 'conv-1', 'tutor-1', 'Marie Dubois', 'student-1', 'student-1', 'Bonjour! J''ai bien reçu votre demande de cours. Je suis disponible jeudi après-midi.', true, '2026-03-01T10:30:00Z'),
('msg-2', 'conv-1', 'student-1', 'Élève Test', 'tutor-1', 'tutor-1', 'Parfait! 14h jeudi vous convient?', true, '2026-03-01T11:00:00Z'),
('msg-3', 'conv-1', 'tutor-1', 'Marie Dubois', 'student-1', 'student-1', 'Oui, c''est parfait. À jeudi!', false, '2026-03-01T11:15:00Z');

-- ============================================================================
-- 13. FONCTIONS ET TRIGGERS
-- ============================================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour sessions
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour invoices
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour progress_reports
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON progress_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 14. ROW LEVEL SECURITY (RLS) - Optionnel
-- ============================================================================
-- Note: À activer si vous voulez restreindre l'accès aux données par utilisateur
-- Pour l'instant, le serveur gère les permissions

-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ... etc

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- Vérification: Exécutez ces requêtes pour confirmer que tout fonctionne

-- SELECT COUNT(*) as total_profiles FROM profiles;
-- SELECT COUNT(*) as total_sessions FROM sessions;
-- SELECT COUNT(*) as total_tutors FROM profiles WHERE role = 'tutor';
-- SELECT COUNT(*) as total_students FROM profiles WHERE role = 'student';

-- Si tout s'est bien passé, vous devriez voir :
-- - 9 profils (1 admin, 4 étudiants, 4 tuteurs)
-- - 13 séances
-- - 4 tuteurs
-- - 4 étudiants

COMMIT;
