-- ============================================
-- SCRIPT DE VÉRIFICATION DE LA BASE DE DONNÉES
-- ============================================
-- Exécute ce script pour vérifier que tout est bien configuré

-- ============================================
-- 1. VÉRIFIER LES TABLES
-- ============================================
SELECT 
  'Tables créées' as verification,
  COUNT(*) as total
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'tutor_availability',
    'sessions',
    'session_comments',
    'progress_reports',
    'session_modifications'
  );
-- Résultat attendu : total = 6

-- ============================================
-- 2. VÉRIFIER LES UTILISATEURS
-- ============================================
SELECT 
  'Utilisateurs créés' as verification,
  COUNT(*) as total,
  string_agg(DISTINCT role, ', ') as roles
FROM profiles;
-- Résultat attendu : total >= 3, roles = 'admin, tutor, student'

-- Détail des utilisateurs
SELECT 
  name as nom,
  email,
  role,
  created_at as cree_le
FROM profiles
ORDER BY role, name;

-- ============================================
-- 3. VÉRIFIER LES DISPONIBILITÉS
-- ============================================
SELECT 
  'Disponibilités créées' as verification,
  COUNT(*) as total
FROM tutor_availability;

-- Détail des disponibilités
SELECT 
  p.name as tuteur,
  CASE ta.day_of_week
    WHEN 0 THEN 'Dimanche'
    WHEN 1 THEN 'Lundi'
    WHEN 2 THEN 'Mardi'
    WHEN 3 THEN 'Mercredi'
    WHEN 4 THEN 'Jeudi'
    WHEN 5 THEN 'Vendredi'
    WHEN 6 THEN 'Samedi'
  END as jour,
  ta.start_time as debut,
  ta.end_time as fin,
  ta.is_recurring as recurrent
FROM tutor_availability ta
JOIN profiles p ON ta.tutor_id = p.id
ORDER BY p.name, ta.day_of_week;

-- ============================================
-- 4. VÉRIFIER LES SÉANCES
-- ============================================
SELECT 
  'Séances créées' as verification,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as en_attente,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmees,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as terminees,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as annulees
FROM sessions;

-- Détail des séances
SELECT 
  st.name as eleve,
  tu.name as tuteur,
  s.subject as matiere,
  s.session_date as date,
  TO_CHAR(s.start_time, 'HH24:MI') as heure,
  s.status as statut,
  CASE 
    WHEN s.meeting_link IS NOT NULL THEN 'Oui'
    ELSE 'Non'
  END as a_lien_zoom,
  s.total_price || ' $' as prix
FROM sessions s
JOIN profiles st ON s.student_id = st.id
JOIN profiles tu ON s.tutor_id = tu.id
ORDER BY s.session_date, s.start_time;

-- ============================================
-- 5. VÉRIFIER LES COMMENTAIRES
-- ============================================
SELECT 
  'Commentaires créés' as verification,
  COUNT(*) as total,
  AVG(rating) as note_moyenne
FROM session_comments;

-- Détail des commentaires
SELECT 
  st.name as eleve,
  s.subject as matiere,
  s.session_date as date,
  au.name as auteur,
  LEFT(sc.comment, 50) || '...' as commentaire,
  sc.rating as note
FROM session_comments sc
JOIN sessions s ON sc.session_id = s.id
JOIN profiles st ON s.student_id = st.id
JOIN profiles au ON sc.author_id = au.id
ORDER BY s.session_date;

-- ============================================
-- 6. VÉRIFIER LES BILANS
-- ============================================
SELECT 
  'Bilans créés' as verification,
  COUNT(*) as total
FROM progress_reports;

-- Détail des bilans
SELECT 
  st.name as eleve,
  tu.name as tuteur,
  pr.subject as matiere,
  pr.session_number as seance_numero,
  s.session_date as date,
  pr.understanding_level as comprehension,
  pr.participation_level as participation,
  LEFT(pr.topics_covered, 50) || '...' as sujets_abordes
FROM progress_reports pr
JOIN sessions s ON pr.session_id = s.id
JOIN profiles st ON pr.student_id = st.id
JOIN profiles tu ON pr.tutor_id = tu.id
ORDER BY s.session_date;

-- ============================================
-- 7. VÉRIFIER LES FONCTIONS
-- ============================================
SELECT 
  'Fonctions créées' as verification,
  COUNT(*) as total
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'check_session_conflicts',
    'check_tutor_availability',
    'count_completed_sessions',
    'can_modify_session',
    'generate_meeting_link'
  );
-- Résultat attendu : total = 5

-- ============================================
-- 8. VÉRIFIER LES TRIGGERS
-- ============================================
SELECT 
  'Triggers créés' as verification,
  COUNT(*) as total
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND trigger_name LIKE '%_updated_at'
     OR trigger_name = 'generate_meeting_link_on_confirm'
     OR trigger_name = 'check_conflicts_before_save';
-- Résultat attendu : total >= 6

-- Détail des triggers
SELECT 
  event_object_table as table_concernee,
  trigger_name as nom_trigger,
  action_timing as quand,
  event_manipulation as action
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 9. VÉRIFIER RLS (Row Level Security)
-- ============================================
SELECT 
  schemaname as schema,
  tablename as table_name,
  rowsecurity as rls_active
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'tutor_availability',
    'sessions',
    'session_comments',
    'progress_reports',
    'session_modifications'
  )
ORDER BY tablename;
-- Résultat attendu : rls_active = true pour toutes les tables

-- ============================================
-- 10. TESTER LES FONCTIONS
-- ============================================

-- Test : Compter les séances complétées entre Lucas et Marie
SELECT 
  'Test : Compter séances' as test,
  count_completed_sessions(
    (SELECT id FROM profiles WHERE email = 'lucas.tremblay@gmail.com'),
    (SELECT id FROM profiles WHERE email = 'marie.dubois@tutosucces.com')
  ) as seances_terminees;
-- Résultat attendu : 3 (si données de test installées)

-- Test : Vérifier disponibilité Marie le lundi 10h-11h
SELECT 
  'Test : Disponibilité lundi 10h' as test,
  check_tutor_availability(
    (SELECT id FROM profiles WHERE email = 'marie.dubois@tutosucces.com'),
    CURRENT_DATE + INTERVAL '7 days', -- Prochaine semaine
    '10:00'::TIME,
    '11:00'::TIME
  ) as est_disponible;
-- Résultat attendu : true (Marie est dispo lun-ven 9h-17h)

-- Test : Vérifier disponibilité Marie le dimanche 10h-11h
SELECT 
  'Test : Disponibilité dimanche 10h' as test,
  check_tutor_availability(
    (SELECT id FROM profiles WHERE email = 'marie.dubois@tutosucces.com'),
    CURRENT_DATE + (7 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER, -- Prochain dimanche
    '10:00'::TIME,
    '11:00'::TIME
  ) as est_disponible;
-- Résultat attendu : false (Marie n'est pas dispo le dimanche)

-- Test : Séances modifiables (>24h)
SELECT 
  'Test : Séances modifiables' as test,
  COUNT(*) as total_modifiables
FROM sessions
WHERE status = 'confirmed'
  AND can_modify_session(id) = true;

-- ============================================
-- 11. STATISTIQUES GLOBALES
-- ============================================
SELECT 
  'Statistiques globales' as titre,
  (SELECT COUNT(*) FROM profiles) as total_utilisateurs,
  (SELECT COUNT(*) FROM profiles WHERE role = 'tutor') as total_tuteurs,
  (SELECT COUNT(*) FROM profiles WHERE role = 'student') as total_eleves,
  (SELECT COUNT(*) FROM tutor_availability) as total_disponibilites,
  (SELECT COUNT(*) FROM sessions) as total_seances,
  (SELECT COUNT(*) FROM sessions WHERE status = 'completed') as seances_terminees,
  (SELECT SUM(total_price) FROM sessions WHERE status = 'completed') as revenus_totaux,
  (SELECT COUNT(*) FROM session_comments) as total_commentaires,
  (SELECT COUNT(*) FROM progress_reports) as total_bilans;

-- ============================================
-- 12. VÉRIFICATIONS FINALES
-- ============================================

-- Vérifier que toutes les séances confirmées ont un lien Zoom
SELECT 
  'Séances confirmées SANS lien Zoom' as alerte,
  COUNT(*) as total
FROM sessions
WHERE status = 'confirmed' AND meeting_link IS NULL;
-- Résultat attendu : 0

-- Vérifier que les bilans sont uniquement pour séances >= 3
SELECT 
  'Bilans avec session_number < 3' as alerte,
  COUNT(*) as total
FROM progress_reports
WHERE session_number < 3;
-- Résultat attendu : 0

-- Vérifier qu'il n'y a pas de conflits de séances
SELECT 
  'Conflits de séances détectés' as alerte,
  COUNT(*) as total
FROM sessions s1
JOIN sessions s2 ON 
  s1.tutor_id = s2.tutor_id
  AND s1.session_date = s2.session_date
  AND s1.id != s2.id
  AND s1.status IN ('confirmed', 'pending')
  AND s2.status IN ('confirmed', 'pending')
  AND (
    (s1.start_time >= s2.start_time AND s1.start_time < s2.end_time)
    OR (s1.end_time > s2.start_time AND s1.end_time <= s2.end_time)
    OR (s1.start_time <= s2.start_time AND s1.end_time >= s2.end_time)
  );
-- Résultat attendu : 0

-- ============================================
-- RÉSUMÉ FINAL
-- ============================================
SELECT 
  '✅ VÉRIFICATION COMPLÈTE' as titre,
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'sessions', 'tutor_availability', 'session_comments', 'progress_reports', 'session_modifications')) = 6
      AND (SELECT COUNT(*) FROM profiles WHERE role IN ('admin', 'tutor', 'student')) >= 3
      AND (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('check_session_conflicts', 'check_tutor_availability', 'count_completed_sessions', 'can_modify_session', 'generate_meeting_link')) = 5
    ) THEN '✅ TOUT EST OK !'
    ELSE '❌ IL MANQUE DES ÉLÉMENTS'
  END as resultat;

-- ============================================
-- FIN DES VÉRIFICATIONS
-- ============================================
