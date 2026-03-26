import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Mail, Phone, Clock } from 'lucide-react';
import contactImg from 'figma:asset/f6b2bca6a82ee2769f6e5b3505df8795d7984e63.png';
import { supabase } from '../app/core/supabase.client';

interface ContactPageProps {
  onBack: () => void;
}

const SUBJECTS_BY_LEVEL: Record<string, string[]> = {
  Primaire: ['Mathématiques', 'Sciences', 'Français', 'Anglais'],
  Secondaire: ['Mathématiques', 'Sciences', 'Physique', 'Chimie', 'Français', 'Anglais'],
  CÉGEP: [
    'Calcul I', 'Calcul II', 'Algèbre linéaire',
    'Chimie générale', 'Chimie des solutions', 'Chimie organique',
    'Physique mécanique', 'Électricité et magnétisme', 'Ondes et physique moderne',
    'Français', 'Anglais',
  ],
};

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  schoolLevel: string;
  subjects: string[];
  message: string;
}

export function ContactPage({ onBack }: ContactPageProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    schoolLevel: '',
    subjects: [],
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(false);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          school_level: formData.schoolLevel || null,
          subjects: formData.subjects.length > 0 ? formData.subjects : null,
          message: formData.message,
          status: 'new',
        });

      if (error) throw error;

      setSubmitSuccess(true);
      
      // Réinitialiser le formulaire
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        schoolLevel: '',
        subjects: [],
        message: '',
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
                href="mailto:contact@tutosucces.com"
                className="text-sm font-medium hover:underline"
                style={{ color: '#2E5CA8' }}
              >
                contact@tutosucces.com
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
                Du lundi au vendredi
              </p>
              <a 
                href="tel:+15141234567"
                className="text-sm font-medium hover:underline"
                style={{ color: '#2E5CA8' }}
              >
                (514) 123-4567
              </a>
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
                <p>Lundi - Vendredi: 9h00 - 20h00</p>
                <p>Samedi: 8h00 - 18h</p>
                <p>Dimanche: Fermé</p>
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
              Remplissez le formulaire et notre équipe vous contactera dans les 24 heures pour discuter de vos besoins et vous proposer les meilleurs tuteurs adaptés à votre profil.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Image */}
            <div>
              {/* Image - hauteur réduite pour correspondre au formulaire */}
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={contactImg}
                  alt="Contactez Tuto-Succès"
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
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                    Niveau scolaire <span className="font-normal" style={{ color: '#7F8C8D' }}>(optionnel)</span>
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {['Primaire', 'Secondaire', 'CÉGEP'].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          schoolLevel: prev.schoolLevel === level ? '' : level,
                          subjects: [],
                        }))}
                        className="px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all"
                        style={
                          formData.schoolLevel === level
                            ? { backgroundColor: '#E74C3C', color: 'white', borderColor: '#E74C3C' }
                            : { backgroundColor: 'white', color: '#7F8C8D', borderColor: '#E0E0E0' }
                        }
                      >
                        {level}
                      </button>
                    ))}
                  </div>

                  {formData.schoolLevel && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                        Matières recherchées
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(SUBJECTS_BY_LEVEL[formData.schoolLevel] ?? []).map(subject => (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              subjects: prev.subjects.includes(subject)
                                ? prev.subjects.filter(s => s !== subject)
                                : [...prev.subjects, subject],
                            }))}
                            className="px-3 py-1 rounded-full text-sm border-2 transition-all"
                            style={
                              formData.subjects.includes(subject)
                                ? { backgroundColor: '#E74C3C', color: 'white', borderColor: '#E74C3C' }
                                : { backgroundColor: 'white', color: '#7F8C8D', borderColor: '#E0E0E0' }
                            }
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
                      <p className="text-sm">Nous vous répondrons dans les plus brefs délais.</p>
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