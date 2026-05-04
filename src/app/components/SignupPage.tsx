import { useState } from 'react';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

// Données des matières par niveau
const subjectsByLevel = {
  primaire: [
    'Mathématiques',
    'Sciences',
    'Français',
    'Anglais'
  ],
  secondaire: [
    'Mathématiques',
    'Sciences',
    'Physique',
    'Chimie',
    'Français',
    'Anglais'
  ],
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
    'Anglais'
  ]
};

interface SignupPageProps {
  onSignup: (email: string, password: string, name: string, role: string, profile: any) => void;
  onBack: () => void;
  onLogin: () => void;
}

export function SignupPage({ onSignup, onBack, onLogin }: SignupPageProps) {
  const [role, setRole] = useState<'student' | 'tutor'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  // Student fields
  const [level, setLevel] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // Tutor fields
  const [bio, setBio] = useState('');
  const [tutorLevels, setTutorLevels] = useState<string[]>([]);
  const [tutorSubjectsByLevel, setTutorSubjectsByLevel] = useState<{[key: string]: string[]}>({
    primaire: [],
    secondaire: [],
    cegep: []
  });
  const [yearsExperience, setYearsExperience] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    const profile = role === 'student' 
      ? { level, subjects: selectedSubjects }
      : {
          bio,
          subjectsByLevel: tutorSubjectsByLevel,
          levels: tutorLevels,
          yearsExperience: parseInt(yearsExperience) || 0,
          cvFile: cvFile?.name || null
        };

    onSignup(email, password, name, role, profile);
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const toggleLevel = (selectedLevel: string) => {
    if (tutorLevels.includes(selectedLevel)) {
      setTutorLevels(tutorLevels.filter(l => l !== selectedLevel));
    } else {
      setTutorLevels([...tutorLevels, selectedLevel]);
    }
  };

  const toggleStudentSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const toggleTutorSubject = (level: string, subject: string) => {
    const currentSubjects = tutorSubjectsByLevel[level] || [];
    if (currentSubjects.includes(subject)) {
      setTutorSubjectsByLevel({
        ...tutorSubjectsByLevel,
        [level]: currentSubjects.filter(s => s !== subject)
      });
    } else {
      setTutorSubjectsByLevel({
        ...tutorSubjectsByLevel,
        [level]: [...currentSubjects, subject]
      });
    }
  };

  // Get available subjects based on selected level for students
  const availableSubjects = level ? subjectsByLevel[level as keyof typeof subjectsByLevel] : [];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12" style={{ backgroundColor: '#2E5CA8' }}>
        <div className="max-w-md text-white">
          <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-20 mb-8 bg-white rounded-2xl p-4" />
          <h1 className="text-5xl font-bold mb-6">Tuto-Succès B&D</h1>
          <p className="text-xl mb-4 opacity-90">EN LIGNE</p>
          <div className="space-y-4 text-lg opacity-90">
            <p>• Rejoignez notre communauté d'apprentissage</p>
            <p>• Des milliers d'élèves et tuteurs nous font confiance</p>
            <p>• Apprentissage personnalisé et flexible</p>
            <p>• Commencez votre parcours de réussite aujourd'hui</p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 text-center">
          <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>Tuto-Succès B&D</h1>
          <span className="text-sm tracking-wide" style={{ color: '#7F8C8D' }}>EN LIGNE</span>
        </div>

        {/* Signup Card */}
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#2C3E50' }}>
                Créer un compte
              </h2>
              <p style={{ color: '#7F8C8D' }}>
                Rejoignez notre plateforme de tutorat
              </p>
            </div>

            {/* Tabs for Student/Tutor */}
            <Tabs value={role} onValueChange={(v) => setRole(v as 'student' | 'tutor')}>
              <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                <TabsTrigger 
                  value="student" 
                  className="text-base data-[state=active]:bg-[#E74C3C] data-[state=active]:text-white"
                >
                  Élève / Parent
                </TabsTrigger>
                <TabsTrigger 
                  value="tutor"
                  className="text-base data-[state=active]:bg-[#2E5CA8] data-[state=active]:text-white"
                >
                  Tuteur
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Common fields */}
                <div className="space-y-2">
                  <Label htmlFor="name" style={{ color: '#2C3E50' }}>Nom complet</Label>
                  <Input
                    id="name"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 border-2"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" style={{ color: '#2C3E50' }}>Adresse courriel</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-2"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" style={{ color: '#2C3E50' }}>Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 border-2"
                      style={{ borderColor: '#E5E7EB' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" style={{ color: '#2C3E50' }}>Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 border-2"
                      style={{ borderColor: '#E5E7EB' }}
                    />
                  </div>
                </div>

                {/* Student-specific fields */}
                <TabsContent value="student" className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="level" style={{ color: '#2C3E50' }}>Niveau scolaire</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger className="h-12 border-2" style={{ borderColor: '#E5E7EB' }}>
                        <SelectValue placeholder="Sélectionnez un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primaire">Primaire</SelectItem>
                        <SelectItem value="secondaire">Secondaire</SelectItem>
                        <SelectItem value="cegep">CÉGEP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {level && (
                    <div className="space-y-3">
                      <Label style={{ color: '#2C3E50' }}>Matières d'intérêt</Label>
                      <p className="text-sm" style={{ color: '#7F8C8D' }}>Sélectionnez les matières qui vous intéressent</p>
                      <div className="flex flex-wrap gap-3">
                        {availableSubjects.map((subject) => (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => toggleStudentSubject(subject)}
                            className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                              selectedSubjects.includes(subject)
                                ? 'text-white shadow-md'
                                : 'bg-white'
                            }`}
                            style={{
                              backgroundColor: selectedSubjects.includes(subject) ? '#E74C3C' : 'white',
                              borderColor: selectedSubjects.includes(subject) ? '#E74C3C' : '#E5E7EB',
                              color: selectedSubjects.includes(subject) ? 'white' : '#2C3E50'
                            }}
                          >
                            {subject}
                            {selectedSubjects.includes(subject) && (
                              <CheckCircle2 className="inline-block ml-2 h-4 w-4" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Tutor-specific fields */}
                <TabsContent value="tutor" className="space-y-6 mt-6">
                  {/* Important Notice for Tutors */}
                  <div className="rounded-lg p-4 border-2" style={{ backgroundColor: '#FFF3CD', borderColor: '#FFC107' }}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#856404' }} />
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#856404' }}>
                          Validation requise
                        </p>
                        <p className="text-sm mt-1" style={{ color: '#856404' }}>
                          Votre candidature sera examinée par notre équipe. Vous ne pourrez vous connecter qu'après approbation de votre profil par Tuto-Succès B&D. Nous vous contacterons par courriel une fois votre compte validé.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" style={{ color: '#2C3E50' }}>Présentation</Label>
                    <Textarea
                      id="bio"
                      placeholder="Parlez de votre parcours et votre approche pédagogique..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="border-2"
                      style={{ borderColor: '#E5E7EB' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience" style={{ color: '#2C3E50' }}>Années d'expérience en tutorat</Label>
                    <Select value={yearsExperience} onValueChange={setYearsExperience}>
                      <SelectTrigger className="h-12 border-2" style={{ borderColor: '#E5E7EB' }}>
                        <SelectValue placeholder="Sélectionnez votre expérience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Moins d'un an</SelectItem>
                        <SelectItem value="1">1-2 ans</SelectItem>
                        <SelectItem value="3">3-5 ans</SelectItem>
                        <SelectItem value="5">5-10 ans</SelectItem>
                        <SelectItem value="10">Plus de 10 ans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label style={{ color: '#2C3E50' }}>Niveaux préférés à enseigner</Label>
                    <div className="flex flex-wrap gap-3">
                      {['primaire', 'secondaire', 'cegep'].map((levelOption) => (
                        <button
                          key={levelOption}
                          type="button"
                          onClick={() => toggleLevel(levelOption)}
                          className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                            tutorLevels.includes(levelOption)
                              ? 'text-white shadow-md'
                              : 'bg-white'
                          }`}
                          style={{
                            backgroundColor: tutorLevels.includes(levelOption) ? '#2E5CA8' : 'white',
                            borderColor: tutorLevels.includes(levelOption) ? '#2E5CA8' : '#E5E7EB',
                            color: tutorLevels.includes(levelOption) ? 'white' : '#2C3E50'
                          }}
                        >
                          {levelOption === 'primaire' && 'Primaire'}
                          {levelOption === 'secondaire' && 'Secondaire'}
                          {levelOption === 'cegep' && 'CÉGEP'}
                          {tutorLevels.includes(levelOption) && (
                            <CheckCircle2 className="inline-block ml-2 h-4 w-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label style={{ color: '#2C3E50' }}>Matières préférées à enseigner par niveau</Label>
                    <p className="text-sm" style={{ color: '#7F8C8D' }}>Sélectionnez les matières que vous souhaitez enseigner pour chaque niveau</p>
                    
                    {['primaire', 'secondaire', 'cegep'].map((levelOption) => (
                      <div key={levelOption} className="border-2 rounded-lg p-4" style={{ borderColor: '#E5E7EB' }}>
                        <h3 className="text-sm font-bold mb-3" style={{ color: '#2C3E50' }}>
                          {levelOption === 'primaire' && 'Primaire'}
                          {levelOption === 'secondaire' && 'Secondaire'}
                          {levelOption === 'cegep' && 'CÉGEP'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {subjectsByLevel[levelOption as keyof typeof subjectsByLevel].map((subject) => (
                            <button
                              key={subject}
                              type="button"
                              onClick={() => toggleTutorSubject(levelOption, subject)}
                              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                tutorSubjectsByLevel[levelOption]?.includes(subject)
                                  ? 'text-white shadow-md'
                                  : 'bg-white'
                              }`}
                              style={{
                                backgroundColor: tutorSubjectsByLevel[levelOption]?.includes(subject) ? '#E74C3C' : 'white',
                                borderColor: tutorSubjectsByLevel[levelOption]?.includes(subject) ? '#E74C3C' : '#E5E7EB',
                                color: tutorSubjectsByLevel[levelOption]?.includes(subject) ? 'white' : '#2C3E50'
                              }}
                            >
                              {subject}
                              {tutorSubjectsByLevel[levelOption]?.includes(subject) && (
                                <CheckCircle2 className="inline-block ml-2 h-3 w-3" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cv" style={{ color: '#2C3E50' }}>Curriculum Vitae (CV)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: '#E5E7EB' }}>
                      <input
                        id="cv"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleCvUpload}
                        className="hidden"
                      />
                      <label htmlFor="cv" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: '#7F8C8D' }} />
                        {cvFile ? (
                          <div>
                            <p className="font-medium" style={{ color: '#2E5CA8' }}>{cvFile.name}</p>
                            <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>Cliquez pour changer</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium" style={{ color: '#2C3E50' }}>Cliquez pour télécharger votre CV</p>
                            <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>PDF, DOC ou DOCX (max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </TabsContent>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: role === 'student' ? '#E74C3C' : '#2E5CA8' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = role === 'student' ? '#C0392B' : '#234A87'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = role === 'student' ? '#E74C3C' : '#2E5CA8'}
                >
                  Créer mon compte
                </Button>
              </form>
            </Tabs>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }}></div>
              <span className="text-sm" style={{ color: '#7F8C8D' }}>ou</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }}></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <span style={{ color: '#7F8C8D' }}>Vous avez déjà un compte ? </span>
              <button
                onClick={onLogin}
                className="font-semibold hover:underline"
                style={{ color: '#2E5CA8' }}
              >
                Se connecter
              </button>
            </div>

            {/* Back Button */}
            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={onBack}
                className="w-full h-12"
                style={{ color: '#7F8C8D' }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <p className="text-center mt-6 text-sm" style={{ color: '#7F8C8D' }}>
            En créant un compte, vous acceptez nos{' '}
            <button className="hover:underline" style={{ color: '#2E5CA8' }}>
              Conditions d'utilisation
            </button>
            {' '}et notre{' '}
            <button className="hover:underline" style={{ color: '#2E5CA8' }}>
              Politique de confidentialité
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}