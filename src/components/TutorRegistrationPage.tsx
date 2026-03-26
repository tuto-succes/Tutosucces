import { useState } from 'react';
import { ArrowLeft, Upload, X, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../app/core/supabase.client';
import { Footer } from './Footer';

interface TutorRegistrationPageProps {
  onBack: () => void;
  onNavigateToContact?: () => void;
}

type NiveauKey = 'primaire' | 'secondaire' | 'cegep';

interface FormData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  niveaux: NiveauKey[];
  heures: string;
  matieresByNiveau: Record<NiveauKey, string[]>;
  cv: File | null;
}

export function TutorRegistrationPage({ onBack, onNavigateToContact }: TutorRegistrationPageProps) {
  const [form, setForm] = useState<FormData>({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    niveaux: [],
    heures: '',
    matieresByNiveau: {
      primaire: [],
      secondaire: [],
      cegep: []
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

  const heuresOptions = ['1-5 heures/semaine', '6-10 heures/semaine', '11-15 heures/semaine', '16-20 heures/semaine', '20+ heures/semaine'];

  const matieresParNiveau: Record<NiveauKey, string[]> = {
    primaire: ['Mathématiques', 'Sciences', 'Français', 'Anglais'],
    secondaire: ['Mathématiques', 'Sciences', 'Physique', 'Chimie', 'Français', 'Anglais'],
    cegep: [
      'Calcul I',
      'Calcul II',
      'Algèbre linéaire',
      'Chimie générale',
      'Chimie des solutions',
      'Chimie organique',
      'Physique mécanique',
      'Électricité et magnétisme',
      'Ondes et physique moderne',
      'Français',
      'Anglais',
    ],
  };

  const toggleNiveau = (niveau: NiveauKey) => {
    if (form.niveaux.includes(niveau)) {
      // Retirer le niveau et ses matières
      setForm({
        ...form,
        niveaux: form.niveaux.filter(n => n !== niveau),
        matieresByNiveau: {
          ...form.matieresByNiveau,
          [niveau]: []
        }
      });
    } else {
      // Ajouter le niveau
      setForm({
        ...form,
        niveaux: [...form.niveaux, niveau]
      });
    }
  };

  const toggleMatiere = (niveau: NiveauKey, matiere: string) => {
    const currentMatieres = form.matieresByNiveau[niveau];
    if (currentMatieres.includes(matiere)) {
      setForm({
        ...form,
        matieresByNiveau: {
          ...form.matieresByNiveau,
          [niveau]: currentMatieres.filter(m => m !== matiere)
        }
      });
    } else {
      setForm({
        ...form,
        matieresByNiveau: {
          ...form.matieresByNiveau,
          [niveau]: [...currentMatieres, matiere]
        }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setSubmitError('Format de fichier non supporté. Veuillez uploader un PDF, DOC ou DOCX.');
        return;
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Le fichier est trop volumineux. Taille maximale: 5MB.');
        return;
      }
      setForm({ ...form, cv: file });
      setSubmitError('');
    }
  };

  const removeCV = () => {
    setForm({ ...form, cv: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validation
    if (!form.prenom || !form.nom || !form.email || !form.telephone) {
      setSubmitError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (form.niveaux.length === 0) {
      setSubmitError('Veuillez sélectionner au moins un niveau d\'enseignement.');
      return;
    }

    // Vérifier qu'au moins une matière est sélectionnée pour chaque niveau choisi
    let hasMatiere = false;
    for (const niveau of form.niveaux) {
      if (form.matieresByNiveau[niveau].length > 0) {
        hasMatiere = true;
        break;
      }
    }
    if (!hasMatiere) {
      setSubmitError('Veuillez sélectionner au moins une matière.');
      return;
    }

    if (!form.cv) {
      setSubmitError('Veuillez télécharger votre CV.');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    const levelLabels: Record<NiveauKey, string> = {
      primaire: 'Primaire',
      secondaire: 'Secondaire',
      cegep: 'CÉGEP',
    };

    const levels = form.niveaux.map((niveau) => levelLabels[niveau]);
    const subjects = Array.from(new Set(form.niveaux.flatMap((niveau) => form.matieresByNiveau[niveau])));
    const notes = [
      form.heures ? `Disponibilité souhaitée: ${form.heures}` : null,
      form.cv ? `CV fourni: ${form.cv.name}` : null,
      ...form.niveaux.map((niveau) => {
        const levelName = levelLabels[niveau];
        const levelSubjects = form.matieresByNiveau[niveau];
        return levelSubjects.length > 0 ? `${levelName}: ${levelSubjects.join(', ')}` : null;
      }),
    ].filter(Boolean).join('\n');

    try {
      // Upload CV to Supabase Storage
      let cvUrl: string | null = null;
      if (form.cv) {
        const fileName = `${Date.now()}_${form.cv.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(fileName, form.cv, { contentType: form.cv.type });
        if (uploadError) {
          console.error('Erreur upload CV:', uploadError);
          throw new Error(`Impossible d'envoyer le CV : ${uploadError.message}. Vérifiez que le bucket "cvs" existe dans Supabase Storage.`);
        }
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(uploadData.path);
          cvUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from('tutor_applications')
        .insert({
          name: `${form.prenom} ${form.nom}`.trim(),
          email: form.email,
          phone: form.telephone,
          subjects,
          levels,
          experience: `Candidature envoyée depuis le formulaire public. Disponibilité: ${form.heures || 'Non précisée'}.`,
          notes: notes || null,
          cv_url: cvUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      setSubmitSuccess(true);
      setForm({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        niveaux: [],
        heures: '',
        matieresByNiveau: {
          primaire: [],
          secondaire: [],
          cegep: []
        },
        cv: null
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSubmitSuccess(false), 8000);
      setIsSubmitting(false);
      return;
    } catch (directInsertError) {
      console.error('Insertion directe tutor_applications impossible, fallback serveur :', directInsertError);
    }

    try {
      console.log('Envoi de la candidature tuteur au serveur...');

      // Préparer les données
      const formData = new FormData();
      formData.append('prenom', form.prenom);
      formData.append('nom', form.nom);
      formData.append('email', form.email);
      formData.append('telephone', form.telephone);
      formData.append('niveaux', JSON.stringify(form.niveaux));
      formData.append('heures', form.heures);
      formData.append('matieres', JSON.stringify(form.matieresByNiveau));
      if (form.cv) {
        formData.append('cv', form.cv);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/tutor-application`,
        {
          method: 'POST',
          headers: {
            // Don't send Authorization header for public tutor application route
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Erreur serveur:', data);
        throw new Error(data.error || 'Erreur lors de l\'envoi de la candidature');
      }

      console.log('Candidature envoyée avec succès:', data);
      
      setSubmitSuccess(true);
      setForm({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        niveaux: [],
        heures: '',
        matieresByNiveau: {
          primaire: [],
          secondaire: [],
          cegep: []
        },
        cv: null
      });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => setSubmitSuccess(false), 8000);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
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
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center gap-2"
            style={{ color: '#7F8C8D' }}
          >
            <ArrowLeft size={20} />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-12" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Tuto-Succès B&D</h1>
              <span className="text-xs tracking-wide" style={{ color: '#7F8C8D' }}>EN LIGNE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 p-4 bg-white/20 rounded-full">
            <GraduationCap className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Devenir Tuteur
          </h1>
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

      {/* Success Message */}
      {submitSuccess && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="p-6 rounded-2xl text-center font-medium shadow-lg" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
            <div className="text-4xl mb-3">✓</div>
            <h3 className="text-xl font-bold mb-2">Candidature envoyée avec succès !</h3>
            <p>Nous avons bien reçu votre candidature. Notre équipe l'examinera dans les plus brefs délais et vous contactera par courriel.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="p-6 rounded-2xl text-center font-medium shadow-lg flex items-center justify-between" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
            <span>✗ {submitError}</span>
            <button onClick={() => setSubmitError('')} className="ml-4">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl">
            {/* Informations personnelles */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                  <span className="text-white font-bold">1</span>
                </div>
                Informations personnelles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prénom */}
                <div>
                  <label htmlFor="prenom" className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                    Prénom <span style={{ color: '#E74C3C' }}>*</span>
                  </label>
                  <input
                    id="prenom"
                    type="text"
                    required
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-red-500 transition-all"
                    placeholder="Jean"
                  />
                </div>

                {/* Nom */}
                <div>
                  <label htmlFor="nom" className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                    Nom <span style={{ color: '#E74C3C' }}>*</span>
                  </label>
                  <input
                    id="nom"
                    type="text"
                    required
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-red-500 transition-all"
                    placeholder="Dupont"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                    Adresse courriel <span style={{ color: '#E74C3C' }}>*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-red-500 transition-all"
                    placeholder="votre@email.com"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label htmlFor="telephone" className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                    Numéro de téléphone <span style={{ color: '#E74C3C' }}>*</span>
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    required
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-red-500 transition-all"
                    placeholder="(514) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Niveaux d'enseignement */}
            <div className="mb-8 pb-8 border-b-2" style={{ borderColor: '#F8F9FA' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                  <span className="text-white font-bold">2</span>
                </div>
                Niveaux d'enseignement <span style={{ color: '#E74C3C' }}>*</span>
              </h2>
              <p className="mb-4 text-sm" style={{ color: '#7F8C8D' }}>
                Sélectionnez tous les niveaux que vous souhaitez enseigner
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {niveaux.map((niveau) => (
                  <label
                    key={niveau.value}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.niveaux.includes(niveau.value)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.niveaux.includes(niveau.value)}
                      onChange={() => toggleNiveau(niveau.value)}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: '#E74C3C' }}
                    />
                    <span className="font-semibold" style={{ color: '#2C3E50' }}>
                      {niveau.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Matières par niveau */}
            <div className="mb-8 pb-8 border-b-2" style={{ borderColor: '#F8F9FA' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                  <span className="text-white font-bold">3</span>
                </div>
                Matières enseignées <span style={{ color: '#E74C3C' }}>*</span>
              </h2>
              <p className="mb-6 text-sm" style={{ color: '#7F8C8D' }}>
                Sélectionnez les matières que vous souhaitez enseigner pour chaque niveau choisi
              </p>

              {form.niveaux.length > 0 ? (
                <div className="space-y-8">
                  {form.niveaux.map((niveau) => (
                    <div key={niveau} className="p-6 rounded-xl" style={{ backgroundColor: '#F8F9FA' }}>
                      <h3 className="text-lg font-bold mb-4 capitalize" style={{ color: '#2C3E50' }}>
                        {niveau === 'cegep' ? 'CÉGEP' : niveau}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matieresParNiveau[niveau].map((matiere) => (
                          <label
                            key={matiere}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 cursor-pointer hover:border-gray-300 transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={form.matieresByNiveau[niveau].includes(matiere)}
                              onChange={() => toggleMatiere(niveau, matiere)}
                              className="w-4 h-4 rounded"
                              style={{ accentColor: '#E74C3C' }}
                            />
                            <span className="text-sm" style={{ color: '#2C3E50' }}>
                              {matiere}
                            </span>
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

            {/* Disponibilité */}
            <div className="mb-8 pb-8 border-b-2" style={{ borderColor: '#F8F9FA' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                  <span className="text-white font-bold">4</span>
                </div>
                Disponibilité
              </h2>

              <div>
                <label htmlFor="heures" className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                  Nombre d'heures souhaitées par semaine
                </label>
                <select
                  id="heures"
                  value={form.heures}
                  onChange={(e) => setForm({ ...form, heures: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-red-500 transition-all"
                  style={{ color: form.heures ? '#2C3E50' : '#7F8C8D' }}
                >
                  <option value="">Sélectionnez votre disponibilité</option>
                  {heuresOptions.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CV Upload */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                  <span className="text-white font-bold">5</span>
                </div>
                Curriculum Vitae <span style={{ color: '#E74C3C' }}>*</span>
              </h2>

              <div className="space-y-4">
                {!form.cv ? (
                  <label
                    htmlFor="cv-upload"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-red-500 hover:bg-red-50"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    <Upload className="w-12 h-12 mb-4" style={{ color: '#7F8C8D' }} />
                    <p className="text-lg font-semibold mb-2" style={{ color: '#2C3E50' }}>
                      Cliquez pour télécharger votre CV
                    </p>
                    <p className="text-sm" style={{ color: '#7F8C8D' }}>
                      PDF, DOC ou DOCX (max 5MB)
                    </p>
                    <input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-xl border-2" style={{ borderColor: '#E74C3C', backgroundColor: '#FFF5F5' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E74C3C' }}>
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#2C3E50' }}>
                          {form.cv.name}
                        </p>
                        <p className="text-sm" style={{ color: '#7F8C8D' }}>
                          {(form.cv.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCV}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                      style={{ color: '#E74C3C' }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 text-lg font-semibold rounded-lg shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: isSubmitting ? '#7F8C8D' : '#E74C3C',
                  color: '#FFFFFF'
                }}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Soumettre ma candidature'}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
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
