-- ============================================
-- CANDIDATURE TUTEUR DE TEST (avec CV)
-- À exécuter dans Supabase SQL Editor
-- ============================================

INSERT INTO tutor_applications (
  name,
  email,
  phone,
  subjects,
  levels,
  experience,
  notes,
  cv_url,
  status,
  created_at
) VALUES (
  'Alexandre Dupont',
  'alexandre.dupont@test.com',
  '514-555-9999',
  ARRAY['Mathématiques', 'Physique', 'Chimie'],
  ARRAY['Secondaire', 'CÉGEP'],
  'Candidature envoyée depuis le formulaire public. Disponibilité: 5-10 heures/semaine.',
  E'Disponibilité souhaitée: 5-10 heures/semaine\nCV fourni: CV_Alexandre_Dupont.pdf\nSecondaire: Mathématiques, Physique\nCÉGEP: Chimie',
  'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf',
  'pending',
  NOW()
);

-- Vérification
SELECT id, name, email, cv_url, status FROM tutor_applications ORDER BY created_at DESC LIMIT 3;
