import { useState } from 'react';
import { ArrowLeft, Users, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onBack: () => void;
  onNavigateToTutorRegistration?: () => void;
  onNavigateToDiagnostic?: () => void;
}

export function LoginPage({ onLogin, onBack, onNavigateToTutorRegistration, onNavigateToDiagnostic }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'tutor' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDiagnosticLink, setShowDiagnosticLink] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulation de connexion simple sans base de données
    // Comptes de démonstration
    const demoAccounts = [
      { email: 'eleve@demo.com', password: 'demo123', role: 'student' },
      { email: 'tuteur@demo.com', password: 'demo123', role: 'tutor' },
      { email: 'admin@demo.com', password: 'admin123', role: 'admin' }
    ];

    const account = demoAccounts.find(acc => acc.email === email && acc.password === password);
    
    if (account) {
      // Créer un token simulé
      const mockToken = 'mock-token-' + Math.random().toString(36).substring(7);
      const mockUser = {
        id: account.role + '-1',
        email: email,
        role: account.role
      };
      
      // Stocker dans localStorage pour simulation
      localStorage.setItem('mockAuth', JSON.stringify({ user: mockUser, token: mockToken }));
      
      // Appeler onLogin pour continuer
      onLogin(email, password);
    } else {
      alert('Connexion échouée. Utilisez:\nÉlève: eleve@demo.com / demo123\nTuteur: tuteur@demo.com / demo123');
      setShowDiagnosticLink(true);
    }
  };

  // Page de sélection du rôle
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)' }}>
        {/* Header avec logo et retour */}
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
          <div className="w-full max-w-2xl">
            {/* Logo et titre centré */}
            <div className="text-center mb-12">
              <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-20 mx-auto mb-6 bg-white rounded-2xl p-4" />
              <h1 className="text-4xl font-bold text-white mb-2">Connexion</h1>
              <p className="text-xl text-white opacity-90">Choisissez votre profil</p>
            </div>

            {/* Cartes de sélection */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Élève / Parent */}
              <button
                onClick={() => setSelectedRole('student')}
                className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all group text-center"
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#E3F2FD' }}
                >
                  <Users className="w-10 h-10" style={{ color: '#2E5CA8' }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                  Élève / Parent
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7F8C8D' }}>
                  Accédez à votre espace pour réserver des séances, suivre votre progression et communiquer avec vos tuteurs
                </p>
              </button>

              {/* Tuteur */}
              <button
                onClick={() => setSelectedRole('tutor')}
                className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all group text-center"
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#FFEBEE' }}
                >
                  <GraduationCap className="w-10 h-10" style={{ color: '#E74C3C' }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                  Tuteur
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7F8C8D' }}>
                  Accédez à votre espace pour gérer vos disponibilités, vos séances et suivre vos revenus
                </p>
              </button>
            </div>

            {/* Section Devenir tuteur */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
              <p className="text-white mb-4 text-lg">
                Vous souhaitez rejoindre notre équipe de tuteurs ?
              </p>
              <Button
                onClick={onNavigateToTutorRegistration}
                className="px-8 py-3 text-lg rounded-lg shadow-lg"
                style={{ backgroundColor: '#FFFFFF', color: '#E74C3C' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                Devenir tuteur
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page de formulaire de connexion
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Left Side - Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12" 
        style={{ 
          background: selectedRole === 'student' 
            ? 'linear-gradient(135deg, #2E5CA8 0%, #9B59B6 100%)'
            : 'linear-gradient(135deg, #E74C3C 0%, #2E5CA8 100%)'
        }}
      >
        <div className="max-w-md text-white">
          <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-20 mb-8 bg-white rounded-2xl p-4" />
          <h1 className="text-5xl font-bold mb-6">Tuto-Succès B&D</h1>
          <p className="text-xl mb-4 opacity-90">EN LIGNE</p>
          
          {selectedRole === 'student' ? (
            <div className="space-y-4 text-lg opacity-90">
              <p>• Accédez à votre espace personnel</p>
              <p>• Recherchez et réservez vos tuteurs</p>
              <p>• Suivez votre progression académique</p>
              <p>• Communiquez avec vos tuteurs</p>
            </div>
          ) : (
            <div className="space-y-4 text-lg opacity-90">
              <p>• Gérez vos disponibilités</p>
              <p>• Acceptez les demandes de séances</p>
              <p>• Rédigez des bilans pour les parents</p>
              <p>• Suivez vos revenus et talons de paie</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 text-center">
          <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>Tuto-Succès B&D</h1>
          <span className="text-sm tracking-wide" style={{ color: '#7F8C8D' }}>EN LIGNE</span>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Bouton retour pour changer de rôle */}
            <button
              onClick={() => {
                setSelectedRole(null);
                setEmail('');
                setPassword('');
              }}
              className="flex items-center gap-2 mb-6 text-sm hover:underline"
              style={{ color: '#7F8C8D' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Changer de profil
            </button>

            {/* Header avec badge du rôle */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: selectedRole === 'student' ? '#E3F2FD' : '#FFEBEE'
                  }}
                >
                  {selectedRole === 'student' ? (
                    <Users className="w-6 h-6" style={{ color: '#2E5CA8' }} />
                  ) : (
                    <GraduationCap className="w-6 h-6" style={{ color: '#E74C3C' }} />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                    {selectedRole === 'student' ? 'Connexion Élève / Parent' : 'Connexion Tuteur'}
                  </h2>
                </div>
              </div>
              <p style={{ color: '#7F8C8D' }}>
                Connectez-vous à votre compte pour continuer
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" style={{ color: '#2C3E50' }}>Mot de passe</Label>
                  <button
                    type="button"
                    className="text-sm hover:underline"
                    style={{ color: '#2E5CA8' }}
                  >
                    Mot de passe oublié?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-2"
                  style={{ borderColor: '#E5E7EB' }}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                style={{ 
                  backgroundColor: selectedRole === 'student' ? '#2E5CA8' : '#E74C3C'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = selectedRole === 'student' ? '#1E4A88' : '#C0392B'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = selectedRole === 'student' ? '#2E5CA8' : '#E74C3C'}
              >
                Se connecter
              </Button>
            </form>

            {/* Info additionnelle */}
            {selectedRole === 'tutor' && (
              <div 
                className="mt-6 p-4 rounded-lg border-2"
                style={{ 
                  backgroundColor: '#FFF3E0',
                  borderColor: '#FFB74D'
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: '#F57C00' }}>
                  <strong>Note:</strong> Votre compte doit être validé par Tuto-Succès B&D avant de pouvoir vous connecter. Vous recevrez un courriel de confirmation une fois votre profil approuvé.
                </p>
              </div>
            )}

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

            {/* Diagnostic Link */}
            <div className="mt-4 text-center">
              <button
                onClick={onNavigateToDiagnostic}
                className="text-sm hover:underline"
                style={{ color: '#2E5CA8' }}
              >
                🔧 Problèmes de connexion ? Testez le diagnostic
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <p className="text-center mt-6 text-sm" style={{ color: '#7F8C8D' }}>
            En vous connectant, vous acceptez nos{' '}
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