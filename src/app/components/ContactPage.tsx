import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Mail, Phone, Clock, Calendar } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import contactImg from '../../imports/pexels-katerina-holmes-5905706-1.jpg';

interface ContactPageProps {
  onBack: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  niveau: string;
  matiere: string;
  heuresParSemaine: string;
  disponibilites: string[];
  message: string;
}

export function ContactPage({ onBack }: ContactPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    niveau: '',
    matiere: '',
    heuresParSemaine: '',
    disponibilites: [],
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const joursOptions = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const matieresParNiveau: Record<string, string[]> = {
    primaire: ['Mathématiques', 'Sciences', 'Français', 'Anglais', 'Mentorat'],
    secondaire: ['Mathématiques', 'Sciences', 'Physique', 'Chimie', 'Français', 'Anglais', 'Mentorat'],
    cegep: [
      'Calcul I et Calcul II',
      'Algèbre linéaire',
      'Chimie générale',
      'Chimie des solutions',
      'Chimie organique',
      'Physique mécanique',
      'Électricité et magnétisme',
      'Ondes et physique moderne',
      'Français',
      'Anglais',
      'Mentorat',
    ],
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNiveauChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const niveau = e.target.value;
    setFormData(prev => ({
      ...prev,
      niveau,
      matiere: '' // Réinitialiser la matière quand on change de niveau
    }));
  };

  const toggleDisponibilite = (jour: string) => {
    setFormData(prev => ({
      ...prev,
      disponibilites: prev.disponibilites.includes(jour)
        ? prev.disponibilites.filter(d => d !== jour)
        : [...prev.disponibilites, jour]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(false);

    try {
      console.log('Submitting contact form...', formData);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Don't send Authorization header for public contact route
          },
          body: JSON.stringify(formData)
        }
      );

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.error('Server error:', data);
        throw new Error(data.error || 'Erreur lors de l\'envoi du message');
      }

      console.log('Contact form submitted successfully');
      setSubmitSuccess(true);

      // Réinitialiser le formulaire
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        niveau: '',
        matiere: '',
        heuresParSemaine: '',
        disponibilites: [],
        message: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du formulaire de contact:', error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.message;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section avec gradient moderne */}
      <section 
        className="relative py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2E5CA8 0%, #1a3a6e 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white mb-8 hover:gap-3 transition-all duration-300 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Retour à l'accueil</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Contactez-nous
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Une question ? Un projet ? Notre équipe est là pour vous accompagner
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="-mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Email Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: '#E74C3C' }}
              >
                <Mail className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#2C3E50' }}>
                E-mail
              </h3>
              <p className="text-sm mb-3" style={{ color: '#7F8C8D' }}>
                Envoyez-nous un message
              </p>
              <a
                href="mailto:tutosuccesbd@gmail.com"
                className="text-sm font-medium hover:underline"
                style={{ color: '#2E5CA8' }}
              >
                tutosuccesbd@gmail.com
              </a>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: '#2E5CA8' }}
              >
                <Phone className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#2C3E50' }}>
                Téléphone
              </h3>
              <p className="text-sm mb-3" style={{ color: '#7F8C8D' }}>
                Lundi au dimanche
              </p>
              <div className="space-y-1">
                <a
                  href="tel:+15146512401"
                  className="block text-sm font-medium hover:underline"
                  style={{ color: '#2E5CA8' }}
                >
                  514-651-2401
                </a>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>ou</p>
                <a
                  href="tel:+15145622884"
                  className="block text-sm font-medium hover:underline"
                  style={{ color: '#2E5CA8' }}
                >
                  514-562-2884
                </a>
              </div>
            </div>

            {/* Horaires Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: '#E74C3C' }}
              >
                <Clock className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#2C3E50' }}>
                Horaires
              </h3>
              <div className="space-y-1 text-sm" style={{ color: '#7F8C8D' }}>
                <p>Lundi au vendredi: 8h-20h</p>
                <p>Samedi: 8h-18h</p>
                <p>Dimanche: 8h-16h</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Contact Form Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title - Above both columns */}
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#2C3E50' }}>
              Prêt à démarrer votre réussite scolaire ?
            </h2>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: '#7F8C8D' }}>
              Remplissez le formulaire et notre équipe vous contactera dans les 24-48 heures pour discuter de vos besoins et vous proposer les meilleurs tuteurs adaptés à votre profil.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Image */}
            <div>
              {/* Image - hauteur réduite pour correspondre au formulaire */}
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={contactImg}
                  alt="Tutorat en ligne - Séance de tutorat par vidéo"
                  className="w-full h-[750px] object-cover"
                />
              </div>
            </div>

            {/* Right Side - Form */}
            <div 
              className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border-t-4"
              style={{ borderTopColor: '#E74C3C' }}
            >
              <div className="mb-8">
                <h3 className="text-3xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                  Envoyez-nous un message
                </h3>
                <p style={{ color: '#7F8C8D' }}>
                  Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Prénom et Nom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label 
                      htmlFor="firstName" 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: '#2C3E50' }}
                    >
                      Prénom *
                    </label>
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Jean"
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ 
                        borderColor: '#E0E0E0',
                      }}
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="lastName" 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: '#2C3E50' }}
                    >
                      Nom *
                    </label>
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Dupont"
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ borderColor: '#E0E0E0' }}
                    />
                  </div>
                </div>

                {/* E-mail */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#2C3E50' }}
                  >
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail 
                      className="absolute left-3 top-1/2 -translate-y-1/2" 
                      size={20} 
                      style={{ color: '#7F8C8D' }}
                    />
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="jean.dupont@exemple.com"
                      className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ borderColor: '#E0E0E0' }}
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#2C3E50' }}
                  >
                    Téléphone <span className="font-normal" style={{ color: '#7F8C8D' }}>(optionnel)</span>
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      size={20}
                      style={{ color: '#7F8C8D' }}
                    />
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(514) 123-4567"
                      className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ borderColor: '#E0E0E0' }}
                    />
                  </div>
                </div>

                {/* Niveau scolaire */}
                <div>
                  <label
                    htmlFor="niveau"
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#2C3E50' }}
                  >
                    Niveau scolaire *
                  </label>
                  <select
                    id="niveau"
                    name="niveau"
                    value={formData.niveau}
                    onChange={handleNiveauChange}
                    required
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ borderColor: '#E0E0E0', color: formData.niveau ? '#2C3E50' : '#7F8C8D' }}
                  >
                    <option value="">Sélectionnez le niveau</option>
                    <option value="primaire">Primaire</option>
                    <option value="secondaire">Secondaire</option>
                    <option value="cegep">CÉGEP</option>
                  </select>
                </div>

                {/* Matières */}
                {formData.niveau && (
                  <div>
                    <label
                      htmlFor="matiere"
                      className="block text-sm font-semibold mb-2"
                      style={{ color: '#2C3E50' }}
                    >
                      Matière recherchée *
                    </label>
                    <select
                      id="matiere"
                      name="matiere"
                      value={formData.matiere}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ borderColor: '#E0E0E0', color: formData.matiere ? '#2C3E50' : '#7F8C8D' }}
                    >
                      <option value="">Sélectionnez une matière</option>
                      {matieresParNiveau[formData.niveau].map((matiere) => (
                        <option key={matiere} value={matiere}>
                          {matiere}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Nombre d'heures par semaine */}
                <div>
                  <label
                    htmlFor="heuresParSemaine"
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#2C3E50' }}
                  >
                    Nombre d'heures de séances souhaitées par semaine
                  </label>
                  <select
                    id="heuresParSemaine"
                    name="heuresParSemaine"
                    value={formData.heuresParSemaine}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ borderColor: '#E0E0E0', color: formData.heuresParSemaine ? '#2C3E50' : '#7F8C8D' }}
                  >
                    <option value="">Sélectionnez le nombre d'heures</option>
                    <option value="1-2">1-2 heures/semaine</option>
                    <option value="3-5">3-5 heures/semaine</option>
                    <option value="6-10">6-10 heures/semaine</option>
                    <option value="10+">10+ heures/semaine</option>
                  </select>
                </div>

                {/* Disponibilités */}
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: '#2C3E50' }}>
                    <Calendar size={18} className="inline mr-2" style={{ color: '#2E5CA8' }} />
                    Vos disponibilités dans la semaine
                  </label>
                  <p className="text-xs mb-3" style={{ color: '#7F8C8D' }}>
                    Sélectionnez les jours où vous êtes disponible
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {joursOptions.map((jour) => (
                      <button
                        key={jour}
                        type="button"
                        onClick={() => toggleDisponibilite(jour)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.disponibilites.includes(jour)
                            ? 'text-white shadow-md'
                            : 'border-2 hover:border-gray-400'
                        }`}
                        style={{
                          backgroundColor: formData.disponibilites.includes(jour) ? '#2E5CA8' : 'white',
                          borderColor: formData.disponibilites.includes(jour) ? '#2E5CA8' : '#E0E0E0',
                          color: formData.disponibilites.includes(jour) ? 'white' : '#2C3E50'
                        }}
                      >
                        {jour}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label 
                    htmlFor="message" 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#2C3E50' }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Décrivez votre besoin, votre niveau scolaire, vos objectifs..."
                    className="w-full px-4 py-3 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{ borderColor: '#E0E0E0' }}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full text-white px-8 py-4 text-lg rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none"
                  style={{ 
                    backgroundColor: isFormValid && !isSubmitting ? '#E74C3C' : '#CCCCCC',
                    cursor: isFormValid && !isSubmitting ? 'pointer' : 'not-allowed'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Envoyer le message
                    </>
                  )}
                </Button>

                {/* Success Message */}
                {submitSuccess && (
                  <div
                    className="p-5 rounded-xl flex items-start gap-3 animate-fade-in border-l-4"
                    style={{
                      backgroundColor: '#D4EDDA',
                      color: '#155724',
                      borderLeftColor: '#28a745'
                    }}
                  >
                    <CheckCircle size={24} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Message envoyé avec succès !</p>
                      <p className="text-sm">Notre équipe vous contactera dans les 24-48 heures pour discuter de vos besoins.</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div 
                    className="p-5 rounded-xl flex items-start gap-3 animate-fade-in border-l-4"
                    style={{ 
                      backgroundColor: '#F8D7DA', 
                      color: '#721C24',
                      borderLeftColor: '#dc3545'
                    }}
                  >
                    <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Une erreur est survenue</p>
                      <p className="text-sm">Veuillez réessayer ou nous contacter directement par téléphone.</p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}