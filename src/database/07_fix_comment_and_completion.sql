-- ============================================
-- Correction commentaire tuteur + fin de seance
-- A executer dans Supabase SQL Editor
-- ============================================

-- 1. Autoriser la modification d'un commentaire existant
DROP POLICY IF EXISTS session_comments_update_participants ON session_comments;
CREATE POLICY session_comments_update_participants ON session_comments
  FOR UPDATE USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Ne pas revalider les conflits de creneaux quand on change
-- seulement le statut ou les notes d'une seance existante
CREATE OR REPLACE FUNCTION prevent_session_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.tutor_id = OLD.tutor_id
     AND NEW.session_date = OLD.session_date
     AND NEW.start_time = OLD.start_time
     AND NEW.end_time = OLD.end_time THEN
    RETURN NEW;
  END IF;

  IF NOT check_session_conflicts(
    NEW.tutor_id,
    NEW.session_date,
    NEW.start_time,
    NEW.end_time,
    NEW.id
  ) THEN
    RAISE EXCEPTION 'Conflit de seance : le tuteur a deja une seance a ce creneau';
  END IF;

  IF NOT check_tutor_availability(
    NEW.tutor_id,
    NEW.session_date,
    NEW.start_time,
    NEW.end_time
  ) THEN
    RAISE EXCEPTION 'Le tuteur n''est pas disponible a ce creneau';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
