-- ============================================
-- SEED DATA - TUTO-SUCCÈS B&D
-- Données de test pour la plateforme
-- ============================================

-- IMPORTANT: Exécute d'abord schema.sql, puis ce fichier
-- Ce fichier contient des données de test

-- ============================================
-- ÉTAPE 1: Créer les utilisateurs dans auth.users
-- ============================================

-- NOTE: Cette partie doit être exécutée via le serveur avec SUPABASE_SERVICE_ROLE_KEY
-- Voir /supabase/functions/server/routes.tsx pour la route /create-test-users

-- Les utilisateurs seront créés avec ces infos:
-- Admin: admin@tutosucces.com / Admin123!
-- Tuteur 1: marie.dubois@tutosucces.com / Tuteur123!
-- Tuteur 2: jean.martin@tutosucces.com / Tuteur123!
-- Tuteur 3: sophie.bernard@tutosucces.com / Tuteur123!
-- Étudiant 1: lucas.tremblay@gmail.com / Etudiant123!
-- Étudiant 2: emma.gagnon@gmail.com / Etudiant123!
-- Parent 1: parent.tremblay@gmail.com / Parent123!
-- Parent 2: parent.gagnon@gmail.com / Parent123!

-- ============================================
-- ÉTAPE 2: Insérer les profils
-- ============================================

-- IMPORTANT: Remplace les UUIDs ci-dessous par les vrais UUIDs des utilisateurs créés dans auth.users

-- Admin
INSERT INTO profiles (id, email, name, role, phone, avatar_url) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@tutosucces.com', 'Administrateur B&D', 'admin', '+1-514-555-0001', NULL);

-- Tuteurs
INSERT INTO profiles (id, email, name, role, phone, avatar_url) VALUES
('00000000-0000-0000-0000-000000000002', 'marie.dubois@tutosucces.com', 'Marie Dubois', 'tutor', '+1-514-555-0002', NULL),
('00000000-0000-0000-0000-000000000003', 'jean.martin@tutosucces.com', 'Jean Martin', 'tutor', '+1-514-555-0003', NULL),
('00000000-0000-0000-0000-000000000004', 'sophie.bernard@tutosucces.com', 'Sophie Bernard', 'tutor', '+1-514-555-0004', NULL);

-- Étudiants
INSERT INTO profiles (id, email, name, role, phone, avatar_url) VALUES
('00000000-0000-0000-0000-000000000005', 'lucas.tremblay@gmail.com', 'Lucas Tremblay', 'student', NULL, NULL),
('00000000-0000-0000-0000-000000000006', 'emma.gagnon@gmail.com', 'Emma Gagnon', 'student', NULL, NULL);

-- Parents
INSERT INTO profiles (id, email, name, role, phone, avatar_url) VALUES
('00000000-0000-0000-0000-000000000007', 'parent.tremblay@gmail.com', 'Pierre Tremblay', 'parent', '+1-514-555-0007', NULL),
('00000000-0000-0000-0000-000000000008', 'parent.gagnon@gmail.com', 'Isabelle Gagnon', 'parent', '+1-514-555-0008', NULL);

-- ============================================
-- ÉTAPE 3: Insérer les tuteurs
-- ============================================

INSERT INTO tutors (id, profile_id, bio, subjects, education, experience_years, hourly_rate, rating, total_reviews, total_sessions, is_active, is_verified) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'Passionnée par les mathématiques, j''aide les élèves à surmonter leurs difficultés et à développer leur confiance. Spécialisée en algèbre et géométrie.',
  ARRAY['Mathématiques', 'Algèbre', 'Géométrie', 'Statistiques'],
  'Baccalauréat en Mathématiques, Université de Montréal',
  5,
  45.00,
  4.8,
  24,
  156,
  true,
  true
),
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  'Enseignant de français avec 8 ans d''expérience. J''aide les étudiants à améliorer leur compréhension de lecture, leur écriture et leur grammaire.',
  ARRAY['Français', 'Littérature', 'Grammaire', 'Rédaction'],
  'Maîtrise en Littérature française, UQAM',
  8,
  50.00,
  4.9,
  31,
  203,
  true,
  true
),
(
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  'Tutrice en sciences avec une approche pratique et interactive. Je rends la physique et la chimie accessibles et amusantes!',
  ARRAY['Sciences', 'Physique', 'Chimie', 'Biologie'],
  'Baccalauréat en Biochimie, McGill University',
  3,
  42.00,
  4.7,
  18,
  89,
  true,
  true
);

-- ============================================
-- ÉTAPE 4: Insérer les étudiants
-- ============================================

INSERT INTO students (id, profile_id, parent_id, grade_level, school, learning_goals) VALUES
(
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000007',
  'Secondaire 3',
  'École secondaire Jean-de-Brébeuf',
  'Améliorer mes notes en mathématiques et préparer mes examens de fin d''année'
),
(
  '20000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000008',
  'Secondaire 4',
  'École internationale de Montréal',
  'Renforcer ma compréhension en sciences et améliorer mes compétences en rédaction'
);

-- ============================================
-- ÉTAPE 5: Disponibilités des tuteurs
-- ============================================

-- Marie Dubois (Lundi, Mercredi, Vendredi)
INSERT INTO availability (tutor_id, day_of_week, start_time, end_time, is_active) VALUES
('10000000-0000-0000-0000-000000000001', 1, '09:00:00', '12:00:00', true), -- Lundi matin
('10000000-0000-0000-0000-000000000001', 1, '14:00:00', '18:00:00', true), -- Lundi après-midi
('10000000-0000-0000-0000-000000000001', 3, '09:00:00', '12:00:00', true), -- Mercredi matin
('10000000-0000-0000-0000-000000000001', 3, '14:00:00', '18:00:00', true), -- Mercredi après-midi
('10000000-0000-0000-0000-000000000001', 5, '14:00:00', '18:00:00', true); -- Vendredi après-midi

-- Jean Martin (Mardi, Jeudi, Samedi)
INSERT INTO availability (tutor_id, day_of_week, start_time, end_time, is_active) VALUES
('10000000-0000-0000-0000-000000000002', 2, '10:00:00', '13:00:00', true), -- Mardi matin
('10000000-0000-0000-0000-000000000002', 2, '15:00:00', '19:00:00', true), -- Mardi après-midi
('10000000-0000-0000-0000-000000000002', 4, '10:00:00', '13:00:00', true), -- Jeudi matin
('10000000-0000-0000-0000-000000000002', 4, '15:00:00', '19:00:00', true), -- Jeudi après-midi
('10000000-0000-0000-0000-000000000002', 6, '09:00:00', '12:00:00', true); -- Samedi matin

-- Sophie Bernard (Mercredi, Jeudi, Vendredi)
INSERT INTO availability (tutor_id, day_of_week, start_time, end_time, is_active) VALUES
('10000000-0000-0000-0000-000000000003', 3, '13:00:00', '17:00:00', true), -- Mercredi après-midi
('10000000-0000-0000-0000-000000000003', 4, '13:00:00', '17:00:00', true), -- Jeudi après-midi
('10000000-0000-0000-0000-000000000003', 5, '09:00:00', '12:00:00', true), -- Vendredi matin
('10000000-0000-0000-0000-000000000003', 5, '13:00:00', '17:00:00', true); -- Vendredi après-midi

-- ============================================
-- ÉTAPE 6: Séances de tutorat
-- ============================================

-- Séances complétées (Lucas avec Marie - 4 séances pour tester les rapports)
INSERT INTO sessions (id, tutor_id, student_id, subject, status, scheduled_at, duration_minutes, amount, notes) VALUES
(
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Mathématiques - Algèbre',
  'completed',
  NOW() - INTERVAL '3 weeks',
  60,
  45.00,
  'Première séance - Évaluation du niveau'
),
(
  '30000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Mathématiques - Équations',
  'completed',
  NOW() - INTERVAL '2 weeks',
  60,
  45.00,
  'Travail sur les équations du premier degré'
),
(
  '30000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Mathématiques - Géométrie',
  'completed',
  NOW() - INTERVAL '1 week',
  60,
  45.00,
  'Introduction aux théorèmes de géométrie'
),
(
  '30000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Mathématiques - Révision',
  'completed',
  NOW() - INTERVAL '3 days',
  60,
  45.00,
  'Révision avant l''examen'
);

-- Séances complétées (Emma avec Jean - 2 séances)
INSERT INTO sessions (id, tutor_id, student_id, subject, status, scheduled_at, duration_minutes, amount, notes) VALUES
(
  '30000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  'Français - Rédaction',
  'completed',
  NOW() - INTERVAL '10 days',
  60,
  50.00,
  'Travail sur la structure du texte argumentatif'
),
(
  '30000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  'Français - Grammaire',
  'completed',
  NOW() - INTERVAL '3 days',
  60,
  50.00,
  'Révision des accords du participe passé'
);

-- Séance confirmée (à venir)
INSERT INTO sessions (id, tutor_id, student_id, subject, status, scheduled_at, duration_minutes, amount, notes) VALUES
(
  '30000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000002',
  'Sciences - Chimie',
  'confirmed',
  NOW() + INTERVAL '2 days',
  60,
  42.00,
  'Introduction aux réactions chimiques'
);

-- Séance en attente
INSERT INTO sessions (id, tutor_id, student_id, subject, status, scheduled_at, duration_minutes, amount, notes) VALUES
(
  '30000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  'Mathématiques - Statistiques',
  'pending',
  NOW() + INTERVAL '5 days',
  60,
  45.00,
  'Demande en attente de confirmation'
);

-- ============================================
-- ÉTAPE 7: Rapports de progression
-- ============================================

-- Rapport pour la 3ème séance de Lucas (seulement à partir de la 3ème)
INSERT INTO progress_reports (session_id, tutor_id, student_id, content, strengths, areas_for_improvement, homework_assigned) VALUES
(
  '30000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Excellente progression dans la compréhension des concepts de géométrie. Lucas a bien assimilé les théorèmes de Pythagore et de Thalès.',
  'Bonne capacité de visualisation spatiale, raisonnement logique solide',
  'Travailler la rapidité d''exécution, attention aux calculs avec les fractions',
  'Exercices pages 45-48 du cahier, pratiquer 5 problèmes de géométrie'
);

-- Rapport pour la 4ème séance de Lucas
INSERT INTO progress_reports (session_id, tutor_id, student_id, content, strengths, areas_for_improvement, homework_assigned) VALUES
(
  '30000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Séance de révision très productive. Lucas maîtrise maintenant les concepts clés et est prêt pour son examen.',
  'Confiance en soi accrue, bonne préparation générale',
  'Continuer à pratiquer pour maintenir le niveau',
  'Revoir les exercices corrigés, faire un examen blanc'
);

-- ============================================
-- ÉTAPE 8: Avis et évaluations
-- ============================================

-- Avis pour Marie Dubois
INSERT INTO reviews (session_id, tutor_id, student_id, rating, comment) VALUES
(
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  5,
  'Marie est une excellente tutrice! Elle explique très bien et est très patiente. Mes notes se sont beaucoup améliorées.'
),
(
  '30000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  5,
  'Toujours à l''écoute et très pédagogue. Je recommande vivement!'
);

-- Avis pour Jean Martin
INSERT INTO reviews (session_id, tutor_id, student_id, rating, comment) VALUES
(
  '30000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  5,
  'Jean rend le français intéressant et accessible. J''ai enfin compris la structure du texte argumentatif!'
);

-- ============================================
-- ÉTAPE 9: Factures
-- ============================================

-- Facture pour Lucas (4 séances avec Marie)
INSERT INTO invoices (id, invoice_number, student_id, tutor_id, status, subtotal, tax_amount, total_amount, due_date, paid_at) VALUES
(
  '40000000-0000-0000-0000-000000000001',
  'INV-2026-001',
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'paid',
  180.00,
  26.99,
  206.99,
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '1 day'
);

-- Détails de la facture
INSERT INTO invoice_items (invoice_id, session_id, description, quantity, unit_price, total_price) VALUES
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Séance de tutorat - Mathématiques (Algèbre)', 1, 45.00, 45.00),
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'Séance de tutorat - Mathématiques (Équations)', 1, 45.00, 45.00),
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'Séance de tutorat - Mathématiques (Géométrie)', 1, 45.00, 45.00),
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 'Séance de tutorat - Mathématiques (Révision)', 1, 45.00, 45.00);

-- Facture pour Emma (2 séances avec Jean)
INSERT INTO invoices (id, invoice_number, student_id, tutor_id, status, subtotal, tax_amount, total_amount, due_date) VALUES
(
  '40000000-0000-0000-0000-000000000002',
  'INV-2026-002',
  '20000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  'pending',
  100.00,
  14.98,
  114.98,
  NOW() + INTERVAL '30 days'
);

-- Détails de la facture
INSERT INTO invoice_items (invoice_id, session_id, description, quantity, unit_price, total_price) VALUES
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', 'Séance de tutorat - Français (Rédaction)', 1, 50.00, 50.00),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000006', 'Séance de tutorat - Français (Grammaire)', 1, 50.00, 50.00);

-- ============================================
-- ÉTAPE 10: Reçus fiscaux
-- ============================================

INSERT INTO tax_receipts (receipt_number, student_id, tax_year, total_amount) VALUES
('RF-2025-001', '20000000-0000-0000-0000-000000000001', 2025, 206.99);

-- ============================================
-- ÉTAPE 11: Messages
-- ============================================

-- Message du parent de Lucas à Marie
INSERT INTO messages (sender_id, receiver_id, subject, content, is_read) VALUES
(
  '00000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000002',
  'Merci pour votre aide',
  'Bonjour Marie, je voulais vous remercier pour votre excellent travail avec Lucas. Ses notes se sont beaucoup améliorées et il a retrouvé confiance en lui. Merci!',
  true
);

-- Réponse de Marie
INSERT INTO messages (sender_id, receiver_id, subject, content, is_read, parent_message_id) VALUES
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000007',
  'Re: Merci pour votre aide',
  'Bonjour M. Tremblay, c''est un plaisir de travailler avec Lucas! Il est très motivé et appliqué. N''hésitez pas si vous avez des questions.',
  false,
  (SELECT id FROM messages WHERE subject = 'Merci pour votre aide')
);

-- Message d'Emma à Jean
INSERT INTO messages (sender_id, receiver_id, subject, content, is_read) VALUES
(
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000003',
  'Question sur le devoir',
  'Bonjour M. Martin, j''ai une question sur l''exercice 5 du devoir que vous m''avez donné. Pouvez-vous m''expliquer la consigne?',
  false
);

-- ============================================
-- ÉTAPE 12: Notifications
-- ============================================

-- Notifications pour Lucas
INSERT INTO notifications (user_id, type, title, message, link, is_read) VALUES
(
  '00000000-0000-0000-0000-000000000005',
  'session_confirmed',
  'Séance confirmée',
  'Votre séance de Mathématiques avec Marie Dubois a été confirmée pour le 28 mars 2026 à 14h00.',
  '/sessions/30000000-0000-0000-0000-000000000004',
  true
),
(
  '00000000-0000-0000-0000-000000000005',
  'progress_report',
  'Nouveau rapport de progression',
  'Marie Dubois a publié un rapport de progression pour votre dernière séance.',
  '/progress-reports/latest',
  false
);

-- Notifications pour Emma
INSERT INTO notifications (user_id, type, title, message, link, is_read) VALUES
(
  '00000000-0000-0000-0000-000000000006',
  'session_reminder',
  'Rappel de séance',
  'Votre séance de Chimie avec Sophie Bernard est prévue demain à 15h00.',
  '/sessions/30000000-0000-0000-0000-000000000007',
  false
),
(
  '00000000-0000-0000-0000-000000000006',
  'invoice_ready',
  'Nouvelle facture disponible',
  'Une nouvelle facture (INV-2026-002) est disponible. Montant: 114,98$',
  '/invoices/40000000-0000-0000-0000-000000000002',
  false
);

-- Notifications pour Marie (tutrice)
INSERT INTO notifications (user_id, type, title, message, link, is_read) VALUES
(
  '00000000-0000-0000-0000-000000000002',
  'new_booking',
  'Nouvelle demande de séance',
  'Emma Gagnon a demandé une séance de Mathématiques pour le 30 mars 2026.',
  '/sessions/30000000-0000-0000-0000-000000000008',
  false
);

-- ============================================
-- ÉTAPE 13: Paramètres administrateur
-- ============================================

INSERT INTO admin_settings (key, value) VALUES
('platform_commission_rate', '{"rate": 0.15, "description": "Commission de 15% sur chaque séance"}'::jsonb),
('tax_rate', '{"rate": 0.14975, "description": "TPS + TVQ Québec"}'::jsonb),
('payment_methods', '{"methods": ["credit_card", "debit", "etransfer"], "default": "credit_card"}'::jsonb),
('session_cancellation_policy', '{"hours_before": 24, "refund_percentage": 100, "description": "Annulation gratuite 24h avant"}'::jsonb),
('platform_settings', '{"name": "Tuto-Succès B&D", "tagline": "EN LIGNE", "support_email": "support@tutosucces.com", "support_phone": "+1-514-555-0000"}'::jsonb);

-- ============================================
-- ÉTAPE 14: Messages de contact (formulaire public)
-- ============================================

INSERT INTO contact_messages (name, email, subject, message, status) VALUES
(
  'Martin Lefebvre',
  'martin.lefebvre@gmail.com',
  'Informations sur les tarifs',
  'Bonjour, je souhaiterais avoir plus d''informations sur vos tarifs pour des cours de mathématiques niveau secondaire 5. Merci!',
  'unread'
),
(
  'Caroline Bouchard',
  'c.bouchard@hotmail.com',
  'Devenir tuteur',
  'Bonjour, je suis enseignante en français et j''aimerais devenir tutrice sur votre plateforme. Comment puis-je postuler?',
  'read'
);

-- ============================================
-- VÉRIFICATION DES DONNÉES
-- ============================================

-- Compter les enregistrements par table
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'tutors', COUNT(*) FROM tutors
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'availability', COUNT(*) FROM availability
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'progress_reports', COUNT(*) FROM progress_reports
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL
SELECT 'tax_receipts', COUNT(*) FROM tax_receipts
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'admin_settings', COUNT(*) FROM admin_settings
UNION ALL
SELECT 'contact_messages', COUNT(*) FROM contact_messages
ORDER BY table_name;

-- ============================================
-- FIN DES SEED DATA
-- ============================================

-- NOTE IMPORTANTE:
-- Les UUIDs dans ce fichier sont des exemples (00000000-0000-0000-0000-000000000XXX)
-- Tu dois les remplacer par les vrais UUIDs des utilisateurs créés dans auth.users
-- 
-- Pour obtenir les vrais UUIDs après création des utilisateurs:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC;
