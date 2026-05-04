import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Calendar, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { supabase } from '../utils/supabase/client';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

interface StudentRegistrationPageProps {
  onBack: () => void;
  onNavigateToContact?: () => void;
}

export function StudentRegistrationPage({ onBack, onNavigateToContact }: StudentRegistrationPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    parentName: '',
    studentName: '',
    email: '',
    phone: '',
    schoolLevel: '',
    subjects: [] as string[],
    disponibilites: [] as string[],
    goals: '',
    additionalInfo: '',
  });

  const joursOptions = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const [submitted, setSubmitted] = useState(false);

  const schoolLevels = ['Primaire', 'Secondaire', 'CÉGEP'];

  const subjectsByLevel: { [key: string]: string[] } = {
    'Primaire': [
      'Mathématiques',
      'Sciences',
      'Français',
      'Anglais',
      'Mentorat',
    ],
    'Secondaire': [
      'Mathématiques',
      'Sciences',
      'Physique',
      'Chimie',
      'Français',
      'Anglais',
      'Mentorat',
    ],
    'CÉGEP': [
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
      'Mentorat',
    ],
  };

  const availableSubjects = formData.schoolLevel
    ? subjectsByLevel[formData.schoolLevel] || []
    : [];

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const toggleDisponibilite = (jour: string) => {
    setFormData((prev) => ({
      ...prev,
      disponibilites: prev.disponibilites.includes(jour)
        ? prev.disponibilites.filter((d) => d !== jour)
        : [...prev.disponibilites, jour],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.parentName || !formData.studentName || !formData.email || !formData.phone) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!formData.schoolLevel) {
      alert('Veuillez sélectionner un niveau scolaire.');
      return;
    }

    if (formData.subjects.length === 0) {
      alert('Veuillez sélectionner au moins une matière.');
      return;
    }

    const fullMessage = [
      '[DEMANDE DE TUTORAT]',
      `Élève : ${formData.studentName}`,
      formData.disponibilites.length > 0 ? `Disponibilités : ${formData.disponibilites.join(', ')}` : '',
      formData.goals ? `Objectifs : ${formData.goals}` : '',
      formData.additionalInfo ? `Informations supplémentaires : ${formData.additionalInfo}` : '',
    ].filter(Boolean).join('\n\n');

    const { error } = await supabase.from('contact_messages').insert({
      first_name: formData.parentName.split(' ')[0] || formData.parentName,
      last_name: formData.parentName.split(' ').slice(1).join(' ') || '',
      email: formData.email,
      phone: formData.phone,
      school_level: formData.schoolLevel,
      subjects: formData.subjects,
      message: fullMessage,
      status: 'new',
    });

    if (error) {
      console.error('Erreur envoi:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #2E5CA8 0%, #E74C3C 100%)' }}>
        <div className="p-6">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/10">
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
                Demande envoyée avec succès !
              </CardTitle>
              <CardDescription className="text-lg">
                Merci pour votre intérêt pour Tuto-Succès B&D
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3" style={{ color: '#2E5CA8' }}>
                  Prochaines étapes :
                </h3>
                <ol className="space-y-2 text-sm" style={{ color: '#7F8C8D' }}>
                  <li className="flex gap-2">
                    <span className="font-bold" style={{ color: '#2E5CA8' }}>1.</span>
                    <span>Notre équipe examinera votre demande dans les 24-48 heures</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold" style={{ color: '#2E5CA8' }}>2.</span>
                    <span>Nous vous contacterons par email pour discuter de vos besoins</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold" style={{ color: '#2E5CA8' }}>3.</span>
                    <span>Nous vous proposerons des tuteurs adaptés à votre profil</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold" style={{ color: '#2E5CA8' }}>4.</span>
                    <span>Vous pourrez planifier votre première séance</span>
                  </li>
                </ol>
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm" style={{ color: '#7F8C8D' }}>
                  Des questions ? Notre équipe est là pour vous aider.
                </p>
                <Button
                  onClick={onNavigateToContact}
                  variant="outline"
                  style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                >
                  Nous contacter
                </Button>
              </div>

              <div className="text-center">
                <Button onClick={onBack} className="w-full" style={{ backgroundColor: '#2E5CA8', color: 'white' }}>
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
            <button onClick={onBack} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
            Trouver un tuteur ou mentor adapté à vos besoins
          </h2>
          <p className="text-xl text-white opacity-90">
            Remplissez le formulaire ci-dessous et nous vous proposerons les meilleurs tuteurs ou mentors pour vous
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: '#2C3E50' }}>
              Formulaire d'inscription
            </CardTitle>
            <CardDescription>
              Tous les champs marqués d'un * sont obligatoires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Coordonnées */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: '#2C3E50' }}>Coordonnées</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentName">Nom du parent *</Label>
                    <Input
                      id="parentName"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="Ex: Marie Dubois"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="studentName">Nom de l'élève *</Label>
                    <Input
                      id="studentName"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      placeholder="Ex: Sophie Dubois"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="exemple@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(514) 555-1234"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Niveau scolaire */}
              <div>
                <Label>Niveau scolaire *</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {schoolLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, schoolLevel: level, subjects: [] })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.schoolLevel === level
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <BookOpen className="h-6 w-6 mx-auto mb-2" style={{ color: formData.schoolLevel === level ? '#2E5CA8' : '#7F8C8D' }} />
                      <span className="text-sm font-medium" style={{ color: formData.schoolLevel === level ? '#2E5CA8' : '#2C3E50' }}>
                        {level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Matières */}
              <div>
                <Label>Matières d'intérêt *</Label>
                <p className="text-sm text-gray-500 mb-3">Sélectionnez toutes les matières qui vous intéressent</p>
                {!formData.schoolLevel ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg" style={{ borderColor: '#E0E0E0' }}>
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" style={{ color: '#7F8C8D' }} />
                    <p className="text-sm font-medium" style={{ color: '#7F8C8D' }}>
                      Sélectionnez d'abord un niveau scolaire
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableSubjects.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSubjectToggle(subject)}
                        className={`p-3 rounded-lg border-2 text-sm transition-all ${
                          formData.subjects.includes(subject)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ color: formData.subjects.includes(subject) ? '#E74C3C' : '#2C3E50' }}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Disponibilités */}
              <div>
                <Label className="mb-3 block">
                  <Calendar className="inline h-4 w-4 mr-2" style={{ color: '#2E5CA8' }} />
                  Vos disponibilités dans la semaine
                </Label>
                <p className="text-xs mb-3" style={{ color: '#7F8C8D' }}>
                  Sélectionnez les jours où vous êtes disponible pour les séances de tutorat
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {joursOptions.map((jour) => (
                    <button
                      key={jour}
                      type="button"
                      onClick={() => toggleDisponibilite(jour)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: formData.disponibilites.includes(jour) ? '#2E5CA8' : 'white',
                        border: '2px solid',
                        borderColor: formData.disponibilites.includes(jour) ? '#2E5CA8' : '#E0E0E0',
                        color: formData.disponibilites.includes(jour) ? 'white' : '#2C3E50',
                      }}
                    >
                      {jour}
                    </button>
                  ))}
                </div>
              </div>

              {/* Objectifs */}
              <div>
                <Label htmlFor="goals">Objectifs et besoins</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="Ex: Améliorer les notes en mathématiques, préparer les examens du ministère..."
                  rows={4}
                />
              </div>

              {/* Informations additionnelles */}
              <div>
                <Label htmlFor="additionalInfo">Informations additionnelles</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Toute autre information pertinente (besoins particuliers, préférences de tuteur, etc.)"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" className="flex-1" style={{ backgroundColor: '#E74C3C', color: 'white' }}>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer la demande
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
