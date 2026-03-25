import { useState, useEffect } from 'react';
import { Building2, Save, CheckCircle, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../app/core/supabase.client';

interface TutorBankInfoProps {
  tutorId: string;
}

export function TutorBankInfo({ tutorId }: TutorBankInfoProps) {
  const [form, setForm] = useState({
    institution_name: '',
    transit_number: '',
    institution_number: '',
    account_number: '',
    account_holder: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchBankInfo();
  }, [tutorId]);

  async function fetchBankInfo() {
    const { data } = await supabase
      .from('tutor_bank_info')
      .select('*')
      .eq('tutor_id', tutorId)
      .single();

    if (data) {
      setForm({
        institution_name: data.institution_name || '',
        transit_number: data.transit_number || '',
        institution_number: data.institution_number || '',
        account_number: data.account_number || '',
        account_holder: data.account_holder || '',
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('tutor_bank_info')
      .upsert({ tutor_id: tutorId, ...form, updated_at: new Date().toISOString() }, { onConflict: 'tutor_id' });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Chargement...</div>;

  return (
    <div className="max-w-lg space-y-6">

      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Informations bancaires
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Ces informations sont utilisées par l'administration pour vous virer votre paye chaque dimanche.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Vos informations sont sécurisées et uniquement visibles par l'administration. Le virement est effectué chaque <strong>dimanche</strong> pour toutes les séances confirmées de la semaine.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Nom de la banque</label>
          <Input
            className="mt-1"
            placeholder="ex: Banque Nationale, RBC, Desjardins..."
            value={form.institution_name}
            onChange={e => setForm(f => ({ ...f, institution_name: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Titulaire du compte</label>
          <Input
            className="mt-1"
            placeholder="Nom complet tel qu'il apparaît sur votre compte"
            value={form.account_holder}
            onChange={e => setForm(f => ({ ...f, account_holder: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">N° de transit <span className="text-gray-400">(5 chiffres)</span></label>
            <Input
              className="mt-1"
              placeholder="00000"
              maxLength={5}
              value={form.transit_number}
              onChange={e => setForm(f => ({ ...f, transit_number: e.target.value.replace(/\D/g, '') }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">N° d'institution <span className="text-gray-400">(3 chiffres)</span></label>
            <Input
              className="mt-1"
              placeholder="000"
              maxLength={3}
              value={form.institution_number}
              onChange={e => setForm(f => ({ ...f, institution_number: e.target.value.replace(/\D/g, '') }))}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">N° de compte <span className="text-gray-400">(7-12 chiffres)</span></label>
          <Input
            className="mt-1"
            placeholder="0000000"
            value={form.account_number}
            onChange={e => setForm(f => ({ ...f, account_number: e.target.value.replace(/\D/g, '') }))}
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving || !form.account_number}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {saved
          ? <><CheckCircle className="h-4 w-4 mr-2" /> Enregistré</>
          : saving
            ? 'Enregistrement...'
            : <><Save className="h-4 w-4 mr-2" /> Enregistrer mes informations</>
        }
      </Button>
    </div>
  );
}
