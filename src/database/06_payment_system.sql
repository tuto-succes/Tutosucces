-- ============================================
-- SYSTÈME DE PAIEMENT
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Table infos bancaires tuteurs
CREATE TABLE IF NOT EXISTS tutor_bank_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  institution_name TEXT,         -- ex: Banque Nationale
  transit_number TEXT,           -- 5 chiffres
  institution_number TEXT,       -- 3 chiffres
  account_number TEXT,           -- 7-12 chiffres
  account_holder TEXT,           -- nom sur le compte
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tutor_bank_info ENABLE ROW LEVEL SECURITY;

-- Le tuteur voit/modifie ses propres infos
CREATE POLICY "bank_info_own" ON tutor_bank_info
  FOR ALL USING (tutor_id = auth.uid());

-- L'admin voit tout
CREATE POLICY "bank_info_admin" ON tutor_bank_info
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Table virements tuteurs (payés chaque dimanche par admin)
CREATE TABLE IF NOT EXISTS tutor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  period_start DATE NOT NULL,    -- lundi de la semaine
  period_end DATE NOT NULL,      -- dimanche de la semaine
  session_ids UUID[],            -- séances incluses
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tutor_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payouts_own" ON tutor_payouts
  FOR SELECT USING (tutor_id = auth.uid());

CREATE POLICY "payouts_admin" ON tutor_payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Ajouter payment_due_date sur sessions si pas déjà présent
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS payment_due_date DATE;

-- Fonction : calculer la date limite (3 jours ouvrables après completed_at)
CREATE OR REPLACE FUNCTION compute_payment_due_date(base_date TIMESTAMPTZ)
RETURNS DATE AS $$
DECLARE
  result DATE;
  count INTEGER := 0;
BEGIN
  result := base_date::DATE;
  WHILE count < 3 LOOP
    result := result + INTERVAL '1 day';
    IF EXTRACT(DOW FROM result) NOT IN (0, 6) THEN  -- 0=dim, 6=sam
      count := count + 1;
    END IF;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger : quand une séance passe à 'completed', calculer la date limite
CREATE OR REPLACE FUNCTION set_payment_due_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.payment_due_date := compute_payment_due_date(NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_payment_due_date ON sessions;
CREATE TRIGGER trigger_payment_due_date
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_due_date();
