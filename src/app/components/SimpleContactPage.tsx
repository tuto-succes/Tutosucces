import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Clock, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';
import contactImg from '../../imports/pexels-katerina-holmes-5905706-1.jpg';

interface SimpleContactPageProps {
  onBack: () => void;
}

export function SimpleContactPage({ onBack }: SimpleContactPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    requestType: 'student', // 'student' ou 'info'
    schoolLevel: '',
    matiere: '',
    heuresParSemaine: '',
    disponibilites: [] as string[],
    message: '',
  });

  const joursOptions = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const matieresParNiveau: Record<string, string[]> = {
    'Primaire': ['Mathématiques', 'Sciences', 'Français', 'Anglais', 'Mentorat'],
    'Secondaire': ['Mathématiques', 'Sciences', 'Physique', 'Chimie', 'Français', 'Anglais', 'Mentorat'],
    'CÉGEP': [
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

  const toggleDisponibilite = (jour: string) => {
    setFormData(prev => ({
      ...prev,
      disponibilites: prev.disponibilites.includes(jour)
        ? prev.disponibilites.filter(d => d !== jour)
        : [...prev.disponibilites, jour]
    }));
  };

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.message) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    // Simuler l'envoi
    console.log('Message de contact:', formData);
    
    // En mode mock, on stocke dans localStorage
    const contacts = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    contacts.push({
      ...formData,
      id: `contact-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem('contactMessages', JSON.stringify(contacts));

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #2E5CA8 0%, #E74C3C 100%)' }}>
        <div className="p-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <Send className="w-10 h-10" style={{ color: '#10b981' }} />
              </div>
              <CardTitle className="text-3xl mb-2" style={{ color: '#2C3E50' }}>
                Message envoyé avec succès !
              </CardTitle>
              <CardDescription className="text-lg">
                Merci de nous avoir contactés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3" style={{ color: '#2E5CA8' }}>
                  Prochaines étapes :
                </h3>
                <p className="text-sm mb-3" style={{ color: '#7F8C8D' }}>
                  Notre équipe vous contactera dans les 24-48 heures pour discuter de vos besoins.
                </p>
                <div className="space-y-1 text-sm" style={{ color: '#2E5CA8' }}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">Horaires :</span>
                  </div>
                  <p className="ml-6">Lundi au vendredi: 8h-20h</p>
                  <p className="ml-6">Samedi: 8h-18h</p>
                  <p className="ml-6">Dimanche: 8h-16h</p>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={onBack}
                  className="w-full"
                  style={{ backgroundColor: '#2E5CA8', color: 'white' }}
                >
                  Retour à l'accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-12" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Tuto-Succès B&D</h1>
                <span className="text-xs tracking-wide" style={{ color: '#7F8C8D' }}>EN LIGNE</span>
              </div>
            </button>
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="py-12" style={{ background: 'linear-gradient(135deg, #2E5CA8 0%, #E74C3C 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Contactez-nous
          </h2>
          <p className="text-xl text-white opacity-90">
            Notre équipe est là pour répondre à toutes vos questions
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulaire de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#2C3E50' }}>
                Envoyez-nous un message
              </CardTitle>
              <CardDescription>
                Tous les champs sont obligatoires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">
                      Prénom
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Votre prénom"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">
                      Nom
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="votre.email@exemple.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(514) 555-1234"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="requestType">
                    Type de demande
                  </Label>
                  <select
                    id="requestType"
                    value={formData.requestType}
                    onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    style={{ borderColor: '#E0E0E0' }}
                  >
                    <option value="student">Trouver un tuteur pour mon enfant/moi-même</option>
                    <option value="info">Demande d'information générale</option>
                  </select>
                </div>

                {formData.requestType === 'student' && (
                  <>
                    <div>
                      <Label htmlFor="schoolLevel">
                        Niveau scolaire
                      </Label>
                      <select
                        id="schoolLevel"
                        value={formData.schoolLevel}
                        onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value, matiere: '' })}
                        className="w-full px-3 py-2 border rounded-md"
                        style={{ borderColor: '#E0E0E0' }}
                      >
                        <option value="">Sélectionnez un niveau</option>
                        <option value="Primaire">Primaire</option>
                        <option value="Secondaire">Secondaire</option>
                        <option value="CÉGEP">CÉGEP</option>
                      </select>
                    </div>

                    {formData.schoolLevel && (
                      <div>
                        <Label htmlFor="matiere">
                          Matière recherchée *
                        </Label>
                        <select
                          id="matiere"
                          value={formData.matiere}
                          onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                          style={{ borderColor: '#E0E0E0' }}
                          required
                        >
                          <option value="">Sélectionnez une matière</option>
                          {matieresParNiveau[formData.schoolLevel].map((mat) => (
                            <option key={mat} value={mat}>
                              {mat}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="heuresParSemaine">
                        Nombre d'heures de séances souhaitées par semaine
                      </Label>
                      <select
                        id="heuresParSemaine"
                        value={formData.heuresParSemaine}
                        onChange={(e) => setFormData({ ...formData, heuresParSemaine: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        style={{ borderColor: '#E0E0E0' }}
                      >
                        <option value="">Sélectionnez le nombre d'heures</option>
                        <option value="1-2">1-2 heures/semaine</option>
                        <option value="3-5">3-5 heures/semaine</option>
                        <option value="6-10">6-10 heures/semaine</option>
                        <option value="10+">10+ heures/semaine</option>
                      </select>
                    </div>

                    <div>
                      <Label className="mb-2 block">
                        <Calendar className="inline h-4 w-4 mr-2" style={{ color: '#2E5CA8' }} />
                        Vos disponibilités dans la semaine
                      </Label>
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
                  </>
                )}

                <div>
                  <Label htmlFor="message">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Comment pouvons-nous vous aider ?"
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  style={{ backgroundColor: '#E74C3C', color: 'white' }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer le message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#2C3E50' }}>
                  <Clock className="h-5 w-5" style={{ color: '#2E5CA8' }} />
                  Heures d'ouverture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Lundi</span>
                  <span style={{ color: '#7F8C8D' }}>8h00 - 20h00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Mardi</span>
                  <span style={{ color: '#7F8C8D' }}>8h00 - 20h00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Mercredi</span>
                  <span style={{ color: '#7F8C8D' }}>8h00 - 20h00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Jeudi</span>
                  <span style={{ color: '#7F8C8D' }}>8h00 - 20h00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Vendredi</span>
                  <span style={{ color: '#7F8C8D' }}>8h00 - 20h00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Samedi</span>
                  <span style={{ color: '#7F8C8D' }}>8h00 - 18h00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Dimanche</span>
                  <span style={{ color: '#7F8C8D' }}>8h00 - 16h00</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#2C3E50' }}>
                  Coordonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-1" style={{ color: '#2E5CA8' }} />
                  <div>
                    <p className="font-medium" style={{ color: '#2C3E50' }}>Téléphone</p>
                    <p className="text-sm" style={{ color: '#7F8C8D' }}>
                      514-651-2401
                    </p>
                    <p className="text-xs" style={{ color: '#7F8C8D' }}>ou</p>
                    <p className="text-sm" style={{ color: '#7F8C8D' }}>
                      514-562-2884
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-1" style={{ color: '#2E5CA8' }} />
                  <div>
                    <p className="font-medium" style={{ color: '#2C3E50' }}>Email</p>
                    <p className="text-sm" style={{ color: '#7F8C8D' }}>
                      tutosuccesbd@gmail.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: '#E3F2FD' }}>
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-2" style={{ color: '#2E5CA8' }}>
                  Réponse rapide garantie
                </p>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>
                  Nous nous engageons à répondre à tous les messages dans un délai de 24-48 heures pendant nos heures d'ouverture.
                </p>
              </CardContent>
            </Card>

            {/* Image de tutorat */}
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={contactImg}
                alt="Séance de tutorat en ligne"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}