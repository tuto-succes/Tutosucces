-- ============================================
-- TABLES POUR LE SYSTÈME DE SÉANCES COMPLÈTES
-- ============================================

-- ============================================
-- 1. TABLE DES DISPONIBILITÉS DES TUTEURS
-- ============================================
CREATE TABLE IF NOT EXISTS tutor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Dimanche, 6 = Samedi
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT true, -- Récurrent chaque semaine
  specific_date DATE, -- Pour des dispos exceptionnelles
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CHECK (end_time > start_time),
  CHECK (
    (is_recurring = true AND specific_date IS NULL) OR
    (is_recurring = false AND specific_date IS NOT NULL)
  )
);

CREATE INDEX idx_tutor_availability_tutor ON tutor_availability(tutor_id);
CREATE INDEX idx_tutor_availability_date ON tutor_availability(specific_date);
CREATE INDEX idx_tutor_availability_dow ON tutor_availability(day_of_week);

-- ============================================
-- 2. TABLE DES SÉANCES (CŒUR DU SYSTÈME)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Informations de la séance
  subject VARCHAR(100) NOT NULL, -- Math, Français, Anglais, etc.
  level VARCHAR(50), -- Primaire, Secondaire 1, etc.
  
  -- Date et heure
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  
  -- Statut de la séance
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  
  -- Lien de visioconférence (généré automatiquement à la confirmation)
  meeting_link TEXT,
  meeting_password VARCHAR(50),
  
  -- Prix et paiement
  price_per_hour DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  
  -- Notes et commentaires
  student_notes TEXT, -- Notes de l'élève lors de la réservation
  tutor_notes TEXT, -- Notes privées du tuteur
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES profiles(id), -- Qui a annulé
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Contraintes
  CHECK (end_time > start_time),
  CHECK (duration_minutes > 0),
  CHECK (price_per_hour >= 0),
  CHECK (total_price >= 0),
  CHECK (tutor_id != student_id)
);

CREATE INDEX idx_sessions_student ON sessions(student_id);
CREATE INDEX idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_datetime ON sessions(session_date, start_time);

-- ============================================
-- 3. TABLE DES COMMENTAIRES POST-SÉANCE
-- ============================================
CREATE TABLE IF NOT EXISTS session_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_role VARCHAR(20) NOT NULL CHECK (author_role IN ('tutor', 'student', 'parent')),
  
  -- Contenu du commentaire
  comment TEXT NOT NULL,
  
  -- Évaluation (optionnel)
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  
  -- Visibilité
  is_visible_to_student BOOLEAN DEFAULT true,
  is_visible_to_parent BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte : un seul commentaire par auteur par séance
  UNIQUE(session_id, author_id)
);

CREATE INDEX idx_session_comments_session ON session_comments(session_id);
CREATE INDEX idx_session_comments_author ON session_comments(author_id);

-- ============================================
-- 4. TABLE DES BILANS DE PROGRESSION
-- (Uniquement à partir de la 3ème séance avec le même tuteur)
-- ============================================
CREATE TABLE IF NOT EXISTS progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  
  -- Informations du bilan
  subject VARCHAR(100) NOT NULL,
  session_number INTEGER NOT NULL, -- Numéro de la séance avec ce tuteur
  
  -- Évaluation des compétences (1-5)
  understanding_level INTEGER CHECK (understanding_level BETWEEN 1 AND 5),
  participation_level INTEGER CHECK (participation_level BETWEEN 1 AND 5),
  homework_completion INTEGER CHECK (homework_completion BETWEEN 1 AND 5),
  progress_since_last INTEGER CHECK (progress_since_last BETWEEN 1 AND 5),
  
  -- Contenu textuel
  strengths TEXT, -- Points forts
  areas_to_improve TEXT, -- Points à améliorer
  topics_covered TEXT NOT NULL, -- Sujets abordés
  homework_assigned TEXT, -- Devoirs assignés
  next_session_goals TEXT, -- Objectifs pour la prochaine séance
  tutor_comments TEXT, -- Commentaires généraux du tuteur
  
  -- Visibilité
  is_visible_to_student BOOLEAN DEFAULT true,
  is_visible_to_parent BOOLEAN DEFAULT true,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte : un seul bilan par séance
  UNIQUE(session_id),
  
  -- Contrainte : minimum 3 séances complétées avant de créer un bilan
  CHECK (session_number >= 3)
);

CREATE INDEX idx_progress_reports_student ON progress_reports(student_id);
CREATE INDEX idx_progress_reports_tutor ON progress_reports(tutor_id);
CREATE INDEX idx_progress_reports_session ON progress_reports(session_id);

-- ============================================
-- 5. TABLE DES MODIFICATIONS DE SÉANCES
-- (Historique des changements)
-- ============================================
CREATE TABLE IF NOT EXISTS session_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  modified_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Type de modification
  modification_type VARCHAR(20) NOT NULL CHECK (modification_type IN ('reschedule', 'cancel', 'confirm')),
  
  -- Anciennes valeurs (pour reschedule)
  old_date DATE,
  old_start_time TIME,
  old_end_time TIME,
  
  -- Nouvelles valeurs
  new_date DATE,
  new_start_time TIME,
  new_end_time TIME,
  
  -- Raison
  reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_session_modifications_session ON session_modifications(session_id);
CREATE INDEX idx_session_modifications_modified_by ON session_modifications(modified_by);

-- ============================================
-- FONCTIONS SQL POUR LA LOGIQUE MÉTIER
-- ============================================

-- ============================================
-- FONCTION 1 : Vérifier les conflits de séances
-- ============================================
CREATE OR REPLACE FUNCTION check_session_conflicts(
  p_tutor_id UUID,
  p_session_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_session_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Vérifier s'il y a des séances qui se chevauchent
  SELECT COUNT(*) INTO conflict_count
  FROM sessions
  WHERE tutor_id = p_tutor_id
    AND session_date = p_session_date
    AND status IN ('confirmed', 'pending')
    AND (id != p_exclude_session_id OR p_exclude_session_id IS NULL)
    AND (
      -- Nouvelle séance commence pendant une séance existante
      (p_start_time >= start_time AND p_start_time < end_time)
      OR
      -- Nouvelle séance se termine pendant une séance existante
      (p_end_time > start_time AND p_end_time <= end_time)
      OR
      -- Nouvelle séance englobe une séance existante
      (p_start_time <= start_time AND p_end_time >= end_time)
    );
  
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FONCTION 2 : Vérifier la disponibilité du tuteur
-- ============================================
CREATE OR REPLACE FUNCTION check_tutor_availability(
  p_tutor_id UUID,
  p_session_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
  day_num INTEGER;
  is_available BOOLEAN;
BEGIN
  -- Extraire le jour de la semaine (0 = Dimanche)
  day_num := EXTRACT(DOW FROM p_session_date);
  
  -- Vérifier les disponibilités exceptionnelles (dates spécifiques)
  SELECT EXISTS(
    SELECT 1
    FROM tutor_availability
    WHERE tutor_id = p_tutor_id
      AND specific_date = p_session_date
      AND is_available = true
      AND p_start_time >= start_time
      AND p_end_time <= end_time
  ) INTO is_available;
  
  -- Si pas de dispo exceptionnelle, vérifier les dispos récurrentes
  IF NOT is_available THEN
    SELECT EXISTS(
      SELECT 1
      FROM tutor_availability
      WHERE tutor_id = p_tutor_id
        AND is_recurring = true
        AND day_of_week = day_num
        AND is_available = true
        AND p_start_time >= start_time
        AND p_end_time <= end_time
    ) INTO is_available;
  END IF;
  
  RETURN is_available;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FONCTION 3 : Compter les séances complétées avec un tuteur
-- ============================================
CREATE OR REPLACE FUNCTION count_completed_sessions(
  p_student_id UUID,
  p_tutor_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  session_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO session_count
  FROM sessions
  WHERE student_id = p_student_id
    AND tutor_id = p_tutor_id
    AND status = 'completed';
  
  RETURN session_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FONCTION 4 : Vérifier si modification possible (24h)
-- ============================================
CREATE OR REPLACE FUNCTION can_modify_session(
  p_session_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  session_datetime TIMESTAMP;
  hours_until_session NUMERIC;
BEGIN
  -- Récupérer la date/heure de la séance
  SELECT (session_date + start_time::TIME) INTO session_datetime
  FROM sessions
  WHERE id = p_session_id;
  
  -- Calculer les heures restantes
  hours_until_session := EXTRACT(EPOCH FROM (session_datetime - NOW())) / 3600;
  
  -- Modification possible si > 24h
  RETURN hours_until_session > 24;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FONCTION 5 : Générer un lien Zoom automatique
-- (Simulation - dans la vraie vie, intégration API Zoom)
-- ============================================
CREATE OR REPLACE FUNCTION generate_meeting_link(
  p_session_id UUID
)
RETURNS TEXT AS $$
DECLARE
  meeting_id TEXT;
  meeting_link TEXT;
BEGIN
  -- Générer un ID de réunion aléatoire (10 chiffres)
  meeting_id := LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
  
  -- Créer le lien
  meeting_link := 'https://zoom.us/j/' || meeting_id;
  
  RETURN meeting_link;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS AUTOMATIQUES
-- ============================================

-- Trigger 1 : Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tutor_availability_updated_at
  BEFORE UPDATE ON tutor_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER session_comments_updated_at
  BEFORE UPDATE ON session_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER progress_reports_updated_at
  BEFORE UPDATE ON progress_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger 2 : Générer automatiquement le lien Zoom lors de la confirmation
CREATE OR REPLACE FUNCTION auto_generate_meeting_link()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le statut passe à 'confirmed' et qu'il n'y a pas encore de lien
  IF NEW.status = 'confirmed' AND (OLD.status != 'confirmed' OR OLD.status IS NULL) THEN
    IF NEW.meeting_link IS NULL THEN
      NEW.meeting_link = generate_meeting_link(NEW.id);
      NEW.meeting_password = SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6);
      NEW.confirmed_at = NOW();
    END IF;
  END IF;
  
  -- Si le statut passe à 'completed'
  IF NEW.status = 'completed' AND (OLD.status != 'completed' OR OLD.status IS NULL) THEN
    NEW.completed_at = NOW();
  END IF;
  
  -- Si le statut passe à 'cancelled'
  IF NEW.status = 'cancelled' AND (OLD.status != 'cancelled' OR OLD.status IS NULL) THEN
    NEW.cancelled_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_meeting_link_on_confirm
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_meeting_link();

-- Trigger 3 : Vérifier les conflits avant insertion/modification
CREATE OR REPLACE FUNCTION prevent_session_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier les conflits de séances
  IF NOT check_session_conflicts(
    NEW.tutor_id,
    NEW.session_date,
    NEW.start_time,
    NEW.end_time,
    NEW.id
  ) THEN
    RAISE EXCEPTION 'Conflit de séance : le tuteur a déjà une séance à ce créneau';
  END IF;
  
  -- Vérifier la disponibilité du tuteur
  IF NOT check_tutor_availability(
    NEW.tutor_id,
    NEW.session_date,
    NEW.start_time,
    NEW.end_time
  ) THEN
    RAISE EXCEPTION 'Le tuteur n''est pas disponible à ce créneau';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_conflicts_before_save
  BEFORE INSERT OR UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_session_conflicts();

-- ============================================
-- POLITIQUES RLS (Row Level Security)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_modifications ENABLE ROW LEVEL SECURITY;

-- Politique : Les tuteurs voient leurs propres disponibilités
CREATE POLICY tutor_availability_select_own ON tutor_availability
  FOR SELECT USING (
    tutor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY tutor_availability_insert_own ON tutor_availability
  FOR INSERT WITH CHECK (
    tutor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY tutor_availability_update_own ON tutor_availability
  FOR UPDATE USING (
    tutor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Politique : Les séances sont visibles par les participants et admin
CREATE POLICY sessions_select_participants ON sessions
  FOR SELECT USING (
    student_id = auth.uid() OR
    tutor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY sessions_insert_students ON sessions
  FOR INSERT WITH CHECK (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY sessions_update_participants ON sessions
  FOR UPDATE USING (
    student_id = auth.uid() OR
    tutor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Politique : Commentaires visibles par les participants
CREATE POLICY session_comments_select_participants ON session_comments
  FOR SELECT USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_comments.session_id
        AND (sessions.student_id = auth.uid() OR sessions.tutor_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY session_comments_insert_participants ON session_comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_comments.session_id
        AND (sessions.student_id = auth.uid() OR sessions.tutor_id = auth.uid())
    )
  );

-- Politique : Bilans visibles par les participants
CREATE POLICY progress_reports_select_participants ON progress_reports
  FOR SELECT USING (
    student_id = auth.uid() OR
    tutor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY progress_reports_insert_tutors ON progress_reports
  FOR INSERT WITH CHECK (
    tutor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY progress_reports_update_tutors ON progress_reports
  FOR UPDATE USING (
    tutor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue : Séances avec informations complètes
CREATE OR REPLACE VIEW sessions_detailed AS
SELECT
  s.*,
  st.name as student_name,
  st.email as student_email,
  st.phone as student_phone,
  tu.name as tutor_name,
  tu.email as tutor_email,
  tu.phone as tutor_phone,
  COUNT(sc.id) as comment_count,
  pr.id as progress_report_id
FROM sessions s
LEFT JOIN profiles st ON s.student_id = st.id
LEFT JOIN profiles tu ON s.tutor_id = tu.id
LEFT JOIN session_comments sc ON s.id = sc.session_id
LEFT JOIN progress_reports pr ON s.id = pr.session_id
GROUP BY s.id, st.id, tu.id, pr.id;

-- Vue : Statistiques par tuteur
CREATE OR REPLACE VIEW tutor_statistics AS
SELECT
  tutor_id,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_sessions,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_sessions,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_sessions,
  SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as total_earnings,
  AVG(CASE WHEN status = 'completed' THEN total_price ELSE NULL END) as avg_session_price
FROM sessions
GROUP BY tutor_id;

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON TABLE sessions IS 'Table principale des séances de tutorat avec gestion complète du cycle de vie';
COMMENT ON TABLE tutor_availability IS 'Disponibilités des tuteurs (récurrentes ou exceptionnelles)';
COMMENT ON TABLE session_comments IS 'Commentaires post-séance des tuteurs et élèves';
COMMENT ON TABLE progress_reports IS 'Bilans de progression détaillés (à partir de la 3ème séance)';
COMMENT ON TABLE session_modifications IS 'Historique des modifications et annulations de séances';

COMMENT ON FUNCTION check_session_conflicts IS 'Vérifie les conflits de créneaux pour un tuteur donné';
COMMENT ON FUNCTION check_tutor_availability IS 'Vérifie si un tuteur est disponible à un créneau donné';
COMMENT ON FUNCTION count_completed_sessions IS 'Compte le nombre de séances terminées entre un élève et un tuteur';
COMMENT ON FUNCTION can_modify_session IS 'Vérifie si une séance peut être modifiée (délai de 24h)';
COMMENT ON FUNCTION generate_meeting_link IS 'Génère un lien Zoom simulé pour une séance';

-- ============================================
-- FIN DU SCRIPT
-- ============================================
