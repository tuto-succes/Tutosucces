-- ============================================
-- CORRECTION RLS : Lecture publique des disponibilités
-- Les élèves doivent pouvoir lire les disponibilités des tuteurs pour réserver
-- ============================================

DROP POLICY IF EXISTS tutor_availability_select_public ON tutor_availability;
CREATE POLICY tutor_availability_select_public ON tutor_availability
  FOR SELECT USING (true);
