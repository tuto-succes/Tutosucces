import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, GraduationCap, Clock } from 'lucide-react';
import { Button } from './ui/button';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';
import { projectId } from '../utils/supabase/info';
import { Footer } from './Footer';

interface TutorRegistrationPageProps {
  onBack: () => void;
  onNavigateToContact?: () => void;
}

type NiveauKey = 'primaire' | 'secondaire' | 'cegep';

interface TimeSlot {
  debut: string;
  fin: string;
}

interface WeeklyAvailability {
  lundi: TimeSlot[];
  mardi: TimeSlot[];
  mercredi: TimeSlot[];
  jeudi: TimeSlot[];
  vendredi: TimeSlot[];
  samedi: TimeSlot[];
  dimanche: TimeSlot[];
}

interface FormData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  niveaux: NiveauKey[];
  heures: string;
  matieresByNiveau: Record<NiveauKey, string[]>;
  disponibilites: WeeklyAvailability;
  cv: File | null;
}

export function TutorRegistrationPage({ onBack, onNavigateToContact }: TutorRegistrationPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [form, setForm] = useState<FormData>({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    niveaux: [],
    heures: '',
    matieresByNiveau: { primaire: [], secondaire: [], cegep: [] },
    disponibilites: {
      lundi: [], mardi: [], mercredi: [], jeudi: [],
      vendredi: [], samedi: [], dimanche: []
    },
    cv: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const niveaux = [
    { value: 'primaire' as NiveauKey, label: 'Primaire' },
    { value: 'secondaire' as NiveauKey, label: 'Secondaire' },
    { value: 'cegep' as NiveauKey, label: 'CÉGEP' },
  ];

  const heuresOptions = [
    '1-5 heures/semaine', '6-10 heures/semaine',
    '11-15 heures/semaine', '16-20 heures/semaine', '20+ heures/semaine'
  ];

  const matieresParNiveau: Record<NiveauKey, string[]> = {
    primaire: ['Mathématiques', 'Sciences', 'Français', 'Anglais', 'Mentorat'],
    secondaire: ['Mathématiques', 'Sciences', 'Physique', 'Chimie', 'Français', 'Anglais', 'Mentorat'],
    cegep: [
      'Calcul I et Calcul II', 'Algèbre linéaire', 'Chimie générale',
      'Chimie des solutions', 'Chimie organique', 'Physique mécanique',
      'Électricité et magnétisme', 'Ondes et physique moderne',
      'Français', 'Anglais', 'Mentorat',
    ],
  };

  const joursOptions = [
    { key: 'lundi' as keyof WeeklyAvailability, label: 'Lundi' },
    { key: 'mardi' as keyof WeeklyAvailability, label: 'Mardi' },
    { key: 'mercredi' as keyof WeeklyAvailability, label: 'Mercredi' },
    { key: 'jeudi' as keyof WeeklyAvailability, label: 'Jeudi' },
    { key: 'vendredi' as keyof WeeklyAvailability, label: 'Vendredi' },
    { key: 'samedi' as keyof WeeklyAvailability, label: 'Samedi' },
    { key: 'dimanche' as keyof WeeklyAvailability, label: 'Dimanche' },
  ];

  const toggleNiveau = (niveau: NiveauKey) => {
    if (form.niveaux.includes(niveau)) {
      setForm({ ...form, niveaux: form.niveaux.filter(n => n !== niveau), matieresByNiveau: { ...form.matieresByNiveau, [niveau]: [] } });
    } else {
      setForm({ ...form, niveaux: [...form.niveaux, niveau] });
    }
  };

  const toggleMatiere = (niveau: NiveauKey, matiere: string) => {
    const current = form.matieresByNiveau[niveau];
    setForm({
      ...form,
      matieresByNiveau: {
        ...form.matieresByNiveau,
        [niveau]: current.includes(matiere) ? current.filter(m => m !== matiere) : [...current, matiere]
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setSubmitError('Format non supporté. PDF, DOC ou DOCX seulement.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Fichier trop volumineux. Maximum 5MB.');
      return;
    }
    setForm({ ...form, cv: file });
    setSubmitError('');
  };

  const addTimeSlot = (jour: keyof WeeklyAvailability) => {
    setForm({ ...form, disponibilites: { ...form.disponibilites, [jour]: [...form.disponibilites[jour], { debut: '09:00', fin: '17:00' }] } });
  };

  const removeTimeSlot = (jour: keyof WeeklyAvailability, index: number) => {
    setForm({ ...form, disponibilites: { ...form.disponibilites, [jour]: form.disponibilites[jour].filter((_, i) => i !== index) } });
  };

  const updateTimeSlot = (jour: keyof WeeklyAvailability, index: number, field: 'debut' | 'fin', value: string) => {
    const newSlots = [...form.disponibilites[jour]];
    newSlots[index][field] = value;
    setForm({ ...form, disponibilites: { ...form.disponibilites, [jour]: newSlots } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!form.prenom || !form.nom || !form.email || !form.telephone) {
      setSubmitError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (form.niveaux.length === 0) {
      setSubmitError('Veuillez sélectionner au moins un niveau d\'enseignement.');
      return;
    }
    const hasMatiere = form.niveaux.some(n => form.matieresByNiveau[n].length > 0);
    if (!hasMatiere) {
      setSubmitError('Veuillez sélectionner au moins une matière.');
      return;
    }
    if (!form.cv) {
      setSubmitError('Veuillez télécharger votre CV.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('prenom', form.prenom);
      formData.append('nom', form.nom);
      formData.append('email', form.email);
      formData.append('telephone', form.telephone);
      formData.append('niveaux', JSON.stringify(form.niveaux));
      formData.append('heures', form.heures);
      formData.append('matieres', JSON.stringify(form.matieresByNiveau));
      formData.append('disponibilites', JSON.stringify(form.disponibilites));
      formData.append('cv', form.cv);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/tutor-application`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'envoi');

      setSubmitSuccess(true);
      setForm({
        prenom: '', nom: '', email: '', telephone: '', niveaux: [], heures: '',
        matieresByNiveau: { primaire: [], secondaire: [], cegep: [] },
        disponibilites: { lundi: [], mardi: [], mercredi: [], jeudi: [], vendredi: [], samedi: [], dimanche: [] },
        cv: null
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSubmitSuccess(false), 8000);
    } catch (error) {
      setSubmitError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" className="flex items-center gap-2" style={{ color: '#7F8C8D' }}>
            <ArrowLeft size={20} />
            Retour
          </Button>
          <button onClick={onBack} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-12" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Tuto-Succès B&D</h1>
              <span className="text-xs tracking-wide" style={{ color: '#7F8C8D' }}>EN LIGNE</span>
            </div>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 p-4 bg-white/20 rounded-full">
            <GraduationCap className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">Devenir Tuteur</h1>
          <p className="text-xl text-white opacity-90 mb-8">
            Rejoignez notre équipe de tuteurs passionnés et contribuez au succès de nos élèves
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
            <p className="text-lg leading-relaxed">
              <strong>Important :</strong> Votre candidature sera examinée par notre équipe.
              Vous ne pourrez vous connecter qu'après approbation de votre profil par Tuto-Succès B&D.
              Nous vous contacterons par courriel une fois votre compte validé.
            </p>
          </div>
        </div>
      </section>

      {submitSuccess && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="p-6 rounded-2xl text-center font-medium shadow-lg" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
            <div className="text-4xl mb-3">✓</div>
            <h3 className="text-xl font-bold mb-2">Candidature envoyée avec succès !</h3>
            <p>Notre équipe l'examinera dans les plus brefs délais et vous contactera par courriel.</p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="p-6 rounded-2xl font-medium shadow-lg flex items-center justify-between" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
            <span>✗ {submitError}</span>
            <button onClick={() => setSubmitError('')}><X size={20} /></button>
          </div>
        </div>
      )}

      {/* Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl">

            {/* 1. Informations personnelles */}
            <div className="mb-8 pb-8 border-b-2" style={{ borderColor: '#F8F9FA' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                  <span className="text-white font-bold">1</span>
                </div>
                Informations personnelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'prenom', label: 'Prénom', placeholder: 'Jean', field: 'prenom' as const },
                  { id: 'nom', label: 'Nom', placeholder: 'Dupont', field: 'nom' as const },
                  { id: 'email', label: 'Adresse courriel', placeholder: 'votre@email.com', field: 'email' as const, type: 'email' },
                  { id: 'telephone', label: 'Numéro de téléphone', placeholder: '(514) 123-4567', field: 'telephone' as const, type: 'tel' },
                ].map(({ id, label, placeholder, field, type = 'text' }) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                      {label} <span style={{ color: '#E74C3C' }}>*</span>
                    </label>
                    <input
                      id={id} type={type} required value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Niveaux */}
            <div className="mb-8 pb-8 border-b-2" style={{ borderColor: '#F8F9FA' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                  <span className="text-white font-bold">2</span>
                </div>
                Niveaux d'enseignement <span style={{ color: '#E74C3C' }}>*</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {niveaux.map((niveau) => (
                  <label key={niveau.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.niveaux.includes(niveau.value) ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="checkbox" checked={form.niveaux.includes(niveau.value)} onChange={() => toggleNiveau(niveau.value)} className="w-5 h-5 rounded" style={{ accentColor: '#E74C3C' }} />
                    <span className="font-semibold" style={{ color: '#2C3E50' }}>{niveau.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Matières */}
            <div className="mb-8 pb-8 border-b-2" style={{ borderColor: '#F8F9FA' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                  <span className="text-white font-bold">3</span>
                </div>
                Matières enseignées <span style={{ color: '#E74C3C' }}>*</span>
              </h2>
              {form.niveaux.length > 0 ? (
                <div className="space-y-8">
                  {form.niveaux.map((niveau) => (
                    <div key={niveau} className="p-6 rounded-xl" style={{ backgroundColor: '#F8F9FA' }}>
                      <h3 className="text-lg font-bold mb-4 capitalize" style={{ color: '#2C3E50' }}>
                        {niveau === 'cegep' ? 'CÉGEP' : niveau}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matieresParNiveau[niveau].map((matiere) => (
                          <label key={matiere} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 cursor-pointer hover:border-gray-300 transition-all">
                            <input type="checkbox" checked={form.matieresByNiveau[niveau].includes(matiere)} onChange={() => toggleMatiere(niveau, matiere)} className="w-4 h-4 rounded" style={{ accentColor: '#E74C3C' }} />
                            <span className="text-sm" style={{ color: '#2C3E50' }}>{matiere}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl text-center" style={{ backgroundColor: '#F8F9FA', color: '#7F8C8D' }}>
                  Veuillez d'abord sélectionner au moins un niveau d'enseignement.
                </div>
              )}
            </div>

            {/* 4. Disponibilité */}
            <div className="mb-8 pb-8 border-b-2" style={{ borderColor: '#F8F9FA' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                  <span className="text-white font-bold">4</span>
                </div>
                Disponibilité
              </h2>

              <div className="mb-6">
                <label htmlFor="heures" className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                  Nombre d'heures souhaitées par semaine
                </label>
                <select
                  id="heures" value={form.heures}
                  onChange={(e) => setForm({ ...form, heures: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-red-500 transition-all"
                  style={{ color: form.heures ? '#2C3E50' : '#7F8C8D' }}
                >
                  <option value="">Sélectionnez votre disponibilité</option>
                  {heuresOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: '#2C3E50' }}>
                  <Clock size={18} style={{ color: '#2E5CA8' }} />
                  Jours et plages horaires disponibles
                </label>
                <p className="text-sm mb-4" style={{ color: '#7F8C8D' }}>
                  Sélectionnez vos disponibilités pour chaque jour de la semaine
                </p>
                <div className="space-y-4">
                  {joursOptions.map((jour) => (
                    <div key={jour.key} className="p-4 rounded-xl" style={{ backgroundColor: '#F8F9FA' }}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold" style={{ color: '#2C3E50' }}>{jour.label}</h3>
                        <button type="button" onClick={() => addTimeSlot(jour.key)} className="px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-transform" style={{ backgroundColor: '#2E5CA8', color: '#FFFFFF' }}>
                          + Ajouter une plage horaire
                        </button>
                      </div>
                      {form.disponibilites[jour.key].length > 0 ? (
                        <div className="space-y-2">
                          {form.disponibilites[jour.key].map((slot, index) => (
                            <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                              <div className="flex items-center gap-2 flex-1">
                                <label className="text-sm font-medium" style={{ color: '#2C3E50' }}>De</label>
                                <input type="time" value={slot.debut} onChange={(e) => updateTimeSlot(jour.key, index, 'debut', e.target.value)} className="px-3 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500" style={{ color: '#2C3E50' }} />
                                <label className="text-sm font-medium" style={{ color: '#2C3E50' }}>à</label>
                                <input type="time" value={slot.fin} onChange={(e) => updateTimeSlot(jour.key, index, 'fin', e.target.value)} className="px-3 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500" style={{ color: '#2C3E50' }} />
                              </div>
                              <button type="button" onClick={() => removeTimeSlot(jour.key, index)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#E74C3C' }}>
                                <X size={20} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-sm" style={{ color: '#7F8C8D' }}>
                          Aucune disponibilité pour ce jour
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. CV */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                  <span className="text-white font-bold">5</span>
                </div>
                Curriculum Vitae <span style={{ color: '#E74C3C' }}>*</span>
              </h2>
              {!form.cv ? (
                <label htmlFor="cv-upload" className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-red-500 hover:bg-red-50" style={{ borderColor: '#E5E7EB' }}>
                  <Upload className="w-12 h-12 mb-4" style={{ color: '#7F8C8D' }} />
                  <p className="text-lg font-semibold mb-2" style={{ color: '#2C3E50' }}>Cliquez pour télécharger votre CV</p>
                  <p className="text-sm" style={{ color: '#7F8C8D' }}>PDF, DOC ou DOCX (max 5MB)</p>
                  <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl border-2" style={{ borderColor: '#E74C3C', backgroundColor: '#FFF5F5' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#2C3E50' }}>{form.cv.name}</p>
                      <p className="text-sm" style={{ color: '#7F8C8D' }}>{(form.cv.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setForm({ ...form, cv: null })} className="p-2 rounded-lg hover:bg-red-100 transition-colors" style={{ color: '#E74C3C' }}>
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            <Button
              type="submit" disabled={isSubmitting}
              className="w-full py-4 text-lg font-semibold rounded-lg shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: isSubmitting ? '#7F8C8D' : '#E74C3C', color: '#FFFFFF' }}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Soumettre ma candidature'}
            </Button>
          </form>
        </div>
      </section>

      <Footer
        onNavigateToConfidentialite={() => {}}
        onNavigateToAnnulation={() => {}}
        onNavigateToServices={() => {}}
        onNavigateToApproche={() => {}}
        onNavigateToEquipe={() => {}}
        onNavigateToTermes={() => {}}
        onNavigateToContact={() => {}}
      />
    </div>
  );
}
