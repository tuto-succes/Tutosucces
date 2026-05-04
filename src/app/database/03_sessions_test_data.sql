-- ============================================
-- DONNÉES DE TEST POUR LE SYSTÈME DE SÉANCES
-- ============================================

-- IMPORTANT : Exécuter ce script APRÈS avoir créé les utilisateurs
-- avec le système ?setup=true

-- ============================================
-- 1. DISPONIBILITÉS DES TUTEURS
-- ============================================

-- Marie Dubois (Tutrice)
-- Disponible : Lundi-Vendredi 9h-17h, Samedi 10h-14h
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_recurring, is_available)
SELECT id, 1, '09:00', '17:00', true, true FROM profiles WHERE email = 'marie.dubois@tutosucces.com'
UNION ALL
SELECT id, 2, '09:00', '17:00', true, true FROM profiles WHERE email = 'marie.dubois@tutosucces.com'
UNION ALL
SELECT id, 3, '09:00', '17:00', true, true FROM profiles WHERE email = 'marie.dubois@tutosucces.com'
UNION ALL
SELECT id, 4, '09:00', '17:00', true, true FROM profiles WHERE email = 'marie.dubois@tutosucces.com'
UNION ALL
SELECT id, 5, '09:00', '17:00', true, true FROM profiles WHERE email = 'marie.dubois@tutosucces.com'
UNION ALL
SELECT id, 6, '10:00', '14:00', true, true FROM profiles WHERE email = 'marie.dubois@tutosucces.com';

-- ============================================
-- 2. SÉANCES DE TEST (différents statuts)
-- ============================================

-- Variables pour les IDs (à récupérer depuis profiles)
DO $$
DECLARE
  v_marie_id UUID;
  v_lucas_id UUID;
  v_session_id UUID;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO v_marie_id FROM profiles WHERE email = 'marie.dubois@tutosucces.com';
  SELECT id INTO v_lucas_id FROM profiles WHERE email = 'lucas.tremblay@gmail.com';

  -- ============================================
  -- SÉANCE 1 : EN ATTENTE (Pending)
  -- L'élève a fait une demande, le tuteur doit valider
  -- ============================================
  INSERT INTO sessions (
    student_id, tutor_id, subject, level,
    session_date, start_time, end_time, duration_minutes,
    status, price_per_hour, total_price,
    student_notes
  ) VALUES (
    v_lucas_id, v_marie_id, 'Mathématiques', 'Secondaire 3',
    CURRENT_DATE + INTERVAL '3 days', '14:00', '15:00', 60,
    'pending', 35.00, 35.00,
    'J''ai besoin d''aide avec les équations du second degré'
  );

  -- ============================================
  -- SÉANCE 2 : CONFIRMÉE (Confirmed)
  -- Le tuteur a validé, lien Zoom généré automatiquement
  -- ============================================
  INSERT INTO sessions (
    student_id, tutor_id, subject, level,
    session_date, start_time, end_time, duration_minutes,
    status, price_per_hour, total_price, payment_status,
    student_notes, confirmed_at
  ) VALUES (
    v_lucas_id, v_marie_id, 'Français', 'Secondaire 3',
    CURRENT_DATE + INTERVAL '5 days', '10:00', '11:30', 90,
    'confirmed', 35.00, 52.50, 'paid',
    'Préparation pour l''examen de la semaine prochaine',
    NOW()
  ) RETURNING id INTO v_session_id;

  -- Mettre à jour avec un lien Zoom simulé
  UPDATE sessions SET
    meeting_link = 'https://zoom.us/j/1234567890',
    meeting_password = 'abc123'
  WHERE id = v_session_id;

  -- ============================================
  -- SÉANCE 3 : TERMINÉE (Completed) - 1ère séance
  -- Séance passée avec commentaire simple
  -- ============================================
  INSERT INTO sessions (
    student_id, tutor_id, subject, level,
    session_date, start_time, end_time, duration_minutes,
    status, price_per_hour, total_price, payment_status,
    meeting_link, meeting_password,
    confirmed_at, completed_at
  ) VALUES (
    v_lucas_id, v_marie_id, 'Mathématiques', 'Secondaire 3',
    CURRENT_DATE - INTERVAL '7 days', '14:00', '15:00', 60,
    'completed', 35.00, 35.00, 'paid',
    'https://zoom.us/j/9876543210', 'xyz789',
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days'
  ) RETURNING id INTO v_session_id;

  -- Ajouter un commentaire post-séance (tuteur)
  INSERT INTO session_comments (
    session_id, author_id, author_role,
    comment, rating, is_visible_to_student, is_visible_to_parent
  ) VALUES (
    v_session_id, v_marie_id, 'tutor',
    'Excellente première séance ! Lucas est très motivé et pose de bonnes questions. Nous avons revu les bases des équations linéaires.',
    5, true, true
  );

  -- ============================================
  -- SÉANCE 4 : TERMINÉE - 2ème séance
  -- ============================================
  INSERT INTO sessions (
    student_id, tutor_id, subject, level,
    session_date, start_time, end_time, duration_minutes,
    status, price_per_hour, total_price, payment_status,
    meeting_link, meeting_password,
    confirmed_at, completed_at
  ) VALUES (
    v_lucas_id, v_marie_id, 'Mathématiques', 'Secondaire 3',
    CURRENT_DATE - INTERVAL '4 days', '14:00', '15:00', 60,
    'completed', 35.00, 35.00, 'paid',
    'https://zoom.us/j/1111222233', 'def456',
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'
  ) RETURNING id INTO v_session_id;

  -- Commentaire post-séance
  INSERT INTO session_comments (
    session_id, author_id, author_role,
    comment, rating
  ) VALUES (
    v_session_id, v_marie_id, 'tutor',
    'Bonne progression ! Lucas commence à maîtriser les équations du premier degré. Nous avons abordé les systèmes d''équations.',
    4
  );

  -- ============================================
  -- SÉANCE 5 : TERMINÉE - 3ème séance (AVEC BILAN)
  -- À partir de cette séance, un bilan détaillé est créé
  -- ============================================
  INSERT INTO sessions (
    student_id, tutor_id, subject, level,
    session_date, start_time, end_time, duration_minutes,
    status, price_per_hour, total_price, payment_status,
    meeting_link, meeting_password,
    confirmed_at, completed_at
  ) VALUES (
    v_lucas_id, v_marie_id, 'Mathématiques', 'Secondaire 3',
    CURRENT_DATE - INTERVAL '2 days', '14:00', '15:00', 60,
    'completed', 35.00, 35.00, 'paid',
    'https://zoom.us/j/4444555566', 'ghi789',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
  ) RETURNING id INTO v_session_id;

  -- Commentaire post-séance
  INSERT INTO session_comments (
    session_id, author_id, author_role,
    comment, rating
  ) VALUES (
    v_session_id, v_marie_id, 'tutor',
    'Très bonne séance ! Lucas a résolu plusieurs exercices sur les équations du second degré avec succès.',
    5
  );

  -- 🎯 BILAN DE PROGRESSION (à partir de la 3ème séance)
  INSERT INTO progress_reports (
    student_id, tutor_id, session_id,
    subject, session_number,
    understanding_level, participation_level, homework_completion, progress_since_last,
    strengths, areas_to_improve, topics_covered,
    homework_assigned, next_session_goals, tutor_comments,
    is_visible_to_student, is_visible_to_parent
  ) VALUES (
    v_lucas_id, v_marie_id, v_session_id,
    'Mathématiques', 3,
    4, 5, 4, 4,
    'Excellente capacité de raisonnement logique. Pose des questions pertinentes et n''hésite pas à demander des clarifications.',
    'Attention aux signes lors de la résolution d''équations. Parfois se précipite sur les calculs.',
    'Équations du second degré : résolution par factorisation, formule quadratique, discriminant. Problèmes d''application concrets.',
    'Exercices pages 45-47 du manuel. 5 problèmes de mise en situation à résoudre.',
    'Maîtriser la méthode du discriminant et savoir déterminer le nombre de solutions d''une équation.',
    'Lucas progresse très bien ! Il commence à développer une vraie compréhension des concepts mathématiques plutôt que de simplement appliquer des formules. Je recommande de continuer sur ce rythme.',
    true, true
  );

  -- ============================================
  -- SÉANCE 6 : ANNULÉE (Cancelled)
  -- Annulée par l'élève avec raison
  -- ============================================
  INSERT INTO sessions (
    student_id, tutor_id, subject, level,
    session_date, start_time, end_time, duration_minutes,
    status, price_per_hour, total_price, payment_status,
    cancellation_reason, cancelled_by, cancelled_at
  ) VALUES (
    v_lucas_id, v_marie_id, 'Mathématiques', 'Secondaire 3',
    CURRENT_DATE + INTERVAL '10 days', '14:00', '15:00', 60,
    'cancelled', 35.00, 35.00, 'refunded',
    'Conflit avec un examen à l''école',
    v_lucas_id, NOW()
  );

  -- Enregistrer la modification
  INSERT INTO session_modifications (
    session_id, modified_by, modification_type, reason
  )
  SELECT id, v_lucas_id, 'cancel', 'Conflit avec un examen à l''école'
  FROM sessions
  WHERE student_id = v_lucas_id AND status = 'cancelled'
  LIMIT 1;

  -- ============================================
  -- SÉANCE 7 : CONFIRMÉE - Plus de 24h (modifiable)
  -- ============================================
  INSERT INTO sessions (
    student_id, tutor_id, subject, level,
    session_date, start_time, end_time, duration_minutes,
    status, price_per_hour, total_price, payment_status,
    meeting_link, meeting_password, confirmed_at
  ) VALUES (
    v_lucas_id, v_marie_id, 'Français', 'Secondaire 3',
    CURRENT_DATE + INTERVAL '7 days', '15:00', '16:00', 60,
    'confirmed', 35.00, 35.00, 'paid',
    'https://zoom.us/j/7777888899', 'jkl012',
    NOW()
  );

  -- ============================================
  -- SÉANCE 8 : CONFIRMÉE - Moins de 24h (NON modifiable)
  -- ============================================
  INSERT INTO sessions (
    student_id, tutor_id, subject, level,
    session_date, start_time, end_time, duration_minutes,
    status, price_per_hour, total_price, payment_status,
    meeting_link, meeting_password, confirmed_at
  ) VALUES (
    v_lucas_id, v_marie_id, 'Mathématiques', 'Secondaire 3',
    CURRENT_DATE + INTERVAL '12 hours', '10:00', '11:00', 60,
    'confirmed', 35.00, 35.00, 'paid',
    'https://zoom.us/j/9999000011', 'mno345',
    NOW() - INTERVAL '2 days'
  );

END $$;

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Vérifier les disponibilités créées
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
  ta.end_time as fin
FROM tutor_availability ta
JOIN profiles p ON ta.tutor_id = p.id
ORDER BY p.name, ta.day_of_week, ta.start_time;

-- Vérifier les séances créées
SELECT 
  st.name as eleve,
  tu.name as tuteur,
  s.subject as matiere,
  s.session_date as date,
  s.start_time as heure,
  s.status as statut,
  s.total_price as prix,
  CASE 
    WHEN s.meeting_link IS NOT NULL THEN 'Oui'
    ELSE 'Non'
  END as lien_zoom,
  can_modify_session(s.id) as modifiable
FROM sessions s
JOIN profiles st ON s.student_id = st.id
JOIN profiles tu ON s.tutor_id = tu.id
ORDER BY s.session_date, s.start_time;

-- Vérifier les commentaires
SELECT 
  st.name as eleve,
  s.subject as matiere,
  s.session_date as date,
  au.name as auteur,
  sc.comment as commentaire,
  sc.rating as note
FROM session_comments sc
JOIN sessions s ON sc.session_id = s.id
JOIN profiles st ON s.student_id = st.id
JOIN profiles au ON sc.author_id = au.id
ORDER BY s.session_date;

-- Vérifier les bilans de progression
SELECT 
  st.name as eleve,
  tu.name as tuteur,
  pr.subject as matiere,
  pr.session_number as numero_seance,
  s.session_date as date,
  pr.understanding_level as comprehension,
  pr.participation_level as participation,
  pr.topics_covered as sujets
FROM progress_reports pr
JOIN sessions s ON pr.session_id = s.id
JOIN profiles st ON pr.student_id = st.id
JOIN profiles tu ON pr.tutor_id = tu.id
ORDER BY s.session_date;

-- ============================================
-- TESTS DES FONCTIONS
-- ============================================

-- Test 1 : Vérifier un conflit de séance (doit retourner false si conflit)
SELECT check_session_conflicts(
  (SELECT id FROM profiles WHERE email = 'marie.dubois@tutosucces.com'),
  CURRENT_DATE + INTERVAL '5 days',
  '10:30'::TIME,
  '11:00'::TIME,
  NULL
) as a_un_conflit;

-- Test 2 : Vérifier la disponibilité (doit retourner true si disponible)
SELECT check_tutor_availability(
  (SELECT id FROM profiles WHERE email = 'marie.dubois@tutosucces.com'),
  CURRENT_DATE + INTERVAL '8 days', -- Un lundi
  '10:00'::TIME,
  '11:00'::TIME
) as est_disponible;

-- Test 3 : Compter les séances terminées
SELECT count_completed_sessions(
  (SELECT id FROM profiles WHERE email = 'lucas.tremblay@gmail.com'),
  (SELECT id FROM profiles WHERE email = 'marie.dubois@tutosucces.com')
) as seances_terminees;

-- Test 4 : Vérifier si modification possible (24h)
SELECT 
  s.session_date,
  s.start_time,
  can_modify_session(s.id) as peut_modifier
FROM sessions s
WHERE s.status = 'confirmed'
ORDER BY s.session_date;

-- ============================================
-- COMMENTAIRES FINAUX
-- ============================================

COMMENT ON SCRIPT IS '
DONNÉES DE TEST POUR LE SYSTÈME DE SÉANCES

Ce script crée :
- Disponibilités pour Marie Dubois (Lun-Ven 9h-17h, Sam 10h-14h)
- 8 séances de test dans différents états :
  * 1 en attente (pending)
  * 2 confirmées (confirmed) - une modifiable, une non modifiable
  * 3 terminées (completed) - avec commentaires et un bilan détaillé
  * 1 annulée (cancelled)

Règles implémentées :
✅ Génération automatique du lien Zoom à la confirmation
✅ Bilans de progression à partir de la 3ème séance
✅ Détection des conflits de créneaux
✅ Vérification de la disponibilité du tuteur
✅ Délai de 24h pour modification/annulation
✅ Historique des modifications

Pour tester, connectez-vous avec :
- Élève : lucas.tremblay@gmail.com / Etudiant123!
- Tuteur : marie.dubois@tutosucces.com / Tuteur123!
- Admin : admin@tutosucces.com / Admin123!
';
