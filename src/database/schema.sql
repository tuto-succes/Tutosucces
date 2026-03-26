-- ============================================
-- SCHÉMA BASE DE DONNÉES - TUTO-SUCCÈS B&D
-- Plateforme de tutorat complète
-- ============================================

-- IMPORTANT: Exécute ce fichier dans Supabase SQL Editor
-- Ce fichier crée uniquement la structure (pas de données)

-- ============================================
-- 1. TABLE PROFILES (Authentification)
-- ============================================
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

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================
-- 2. TABLE TUTORS (Profils tuteurs)
-- ============================================
CREATE TABLE tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  education TEXT,
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

CREATE INDEX idx_tutors_profile ON tutors(profile_id);
CREATE INDEX idx_tutors_subjects ON tutors USING GIN(subjects);
CREATE INDEX idx_tutors_active ON tutors(is_active);

-- RLS Policies
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors are viewable by everyone" 
  ON tutors FOR SELECT 
  USING (true);

CREATE POLICY "Tutors can update own profile" 
  ON tutors FOR UPDATE 
  USING (profile_id = auth.uid());

-- ============================================
-- 3. TABLE STUDENTS (Profils étudiants)
-- ============================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  grade_level TEXT,
  school TEXT,
  learning_goals TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

CREATE INDEX idx_students_profile ON students(profile_id);
CREATE INDEX idx_students_parent ON students(parent_id);

-- RLS Policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own profile" 
  ON students FOR SELECT 
  USING (profile_id = auth.uid() OR parent_id = auth.uid());

CREATE POLICY "Students can update own profile" 
  ON students FOR UPDATE 
  USING (profile_id = auth.uid() OR parent_id = auth.uid());

-- ============================================
-- 4. TABLE AVAILABILITY (Disponibilités tuteurs)
-- ============================================
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dimanche, 6=Samedi
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_availability_tutor ON availability(tutor_id);
CREATE INDEX idx_availability_day ON availability(day_of_week);

-- RLS Policies
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability is viewable by everyone" 
  ON availability FOR SELECT 
  USING (true);

CREATE POLICY "Tutors can manage own availability" 
  ON availability FOR ALL 
  USING (tutor_id IN (SELECT id FROM tutors WHERE profile_id = auth.uid()));

-- ============================================
-- 5. TABLE SESSIONS (Séances de tutorat)
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX idx_sessions_student ON sessions(student_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_scheduled ON sessions(scheduled_at);

-- RLS Policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions viewable by participants" 
  ON sessions FOR SELECT 
  USING (
    tutor_id IN (SELECT id FROM tutors WHERE profile_id = auth.uid()) OR
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid() OR parent_id = auth.uid())
  );

CREATE POLICY "Students can create sessions" 
  ON sessions FOR INSERT 
  WITH CHECK (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

CREATE POLICY "Participants can update sessions" 
  ON sessions FOR UPDATE 
  USING (
    tutor_id IN (SELECT id FROM tutors WHERE profile_id = auth.uid()) OR
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

-- ============================================
-- 6. TABLE PROGRESS_REPORTS (Bilans pédagogiques)
-- ============================================
CREATE TABLE progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  strengths TEXT,
  areas_for_improvement TEXT,
  homework_assigned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id)
);

CREATE INDEX idx_progress_reports_session ON progress_reports(session_id);
CREATE INDEX idx_progress_reports_student ON progress_reports(student_id);
CREATE INDEX idx_progress_reports_tutor ON progress_reports(tutor_id);

-- RLS Policies
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Progress reports viewable by participants" 
  ON progress_reports FOR SELECT 
  USING (
    tutor_id IN (SELECT id FROM tutors WHERE profile_id = auth.uid()) OR
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid() OR parent_id = auth.uid())
  );

CREATE POLICY "Tutors can create progress reports" 
  ON progress_reports FOR INSERT 
  WITH CHECK (tutor_id IN (SELECT id FROM tutors WHERE profile_id = auth.uid()));

-- ============================================
-- 7. TABLE MESSAGES (Messagerie interne)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" 
  ON messages FOR SELECT 
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" 
  ON messages FOR INSERT 
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages" 
  ON messages FOR UPDATE 
  USING (receiver_id = auth.uid());

-- ============================================
-- 8. TABLE REVIEWS (Avis et évaluations)
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id)
);

CREATE INDEX idx_reviews_tutor ON reviews(tutor_id);
CREATE INDEX idx_reviews_student ON reviews(student_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- RLS Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" 
  ON reviews FOR SELECT 
  USING (true);

CREATE POLICY "Students can create reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

-- ============================================
-- 9. TABLE INVOICES (Factures)
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES tutors(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_tutor ON invoices(tutor_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- RLS Policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoices viewable by related parties" 
  ON invoices FOR SELECT 
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid() OR parent_id = auth.uid()) OR
    tutor_id IN (SELECT id FROM tutors WHERE profile_id = auth.uid())
  );

-- ============================================
-- 10. TABLE INVOICE_ITEMS (Détails factures)
-- ============================================
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_session ON invoice_items(session_id);

-- RLS Policies
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoice items viewable with invoice" 
  ON invoice_items FOR SELECT 
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE 
        student_id IN (SELECT id FROM students WHERE profile_id = auth.uid() OR parent_id = auth.uid()) OR
        tutor_id IN (SELECT id FROM tutors WHERE profile_id = auth.uid())
    )
  );

-- ============================================
-- 11. TABLE TAX_RECEIPTS (Reçus fiscaux)
-- ============================================
CREATE TABLE tax_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tax_receipts_student ON tax_receipts(student_id);
CREATE INDEX idx_tax_receipts_year ON tax_receipts(tax_year);

-- RLS Policies
ALTER TABLE tax_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tax receipts viewable by student/parent" 
  ON tax_receipts FOR SELECT 
  USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid() OR parent_id = auth.uid()));

-- ============================================
-- 12. TABLE NOTIFICATIONS (Notifications)
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE 
  USING (user_id = auth.uid());

-- ============================================
-- 13. TABLE ADMIN_SETTINGS (Paramètres admin)
-- ============================================
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_settings_key ON admin_settings(key);

-- RLS Policies
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin settings viewable by admins" 
  ON admin_settings FOR SELECT 
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin settings manageable by admins" 
  ON admin_settings FOR ALL 
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ============================================
-- 14. TABLE CONTACT_MESSAGES (Messages de contact)
-- ============================================
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Politique : N'importe qui peut insérer un message de contact
DROP POLICY IF EXISTS "Contact messages insert anyone" ON contact_messages;
CREATE POLICY "Contact messages insert anyone" 
  ON contact_messages FOR INSERT 
  WITH CHECK (true);

-- Politique : Admins peuvent lire tous les messages
DROP POLICY IF EXISTS "Contact messages viewable by admins" ON contact_messages;
CREATE POLICY "Contact messages viewable by admins" 
  ON contact_messages FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'authenticated' AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Politique : Admins peuvent mettre à jour (marquer comme lu/répondu)
DROP POLICY IF EXISTS "Contact messages update by admins" ON contact_messages;
CREATE POLICY "Contact messages update by admins" 
  ON contact_messages FOR UPDATE 
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Politique : Admins peuvent supprimer
DROP POLICY IF EXISTS "Contact messages delete by admins" ON contact_messages;
CREATE POLICY "Contact messages delete by admins" 
  ON contact_messages FOR DELETE 
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour les stats du tuteur après un avis
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tutors
  SET 
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE tutor_id = NEW.tutor_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE tutor_id = NEW.tutor_id)
  WHERE id = NEW.tutor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tutor_rating_trigger AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_tutor_rating();

-- ============================================
-- FIN DU SCHÉMA
-- ============================================

-- Vérification des tables créées
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT LIKE 'kv_store%'
ORDER BY tablename;
