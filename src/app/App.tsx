import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { TutorDashboard } from './components/TutorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ServerDiagnostic } from './components/ServerDiagnostic';
import { DatabaseSetup } from './components/DatabaseSetup';
import { PolitiqueConfidentialite } from './components/PolitiqueConfidentialite';
import { PolitiqueAnnulation } from './components/PolitiqueAnnulation';
import { NotreApproche } from './components/NotreApproche';
import { NotreEquipe } from './components/NotreEquipe';
import { TermesConditions } from './components/TermesConditions';
import { ContactPage } from './components/ContactPage';
import { TutorRegistrationPage } from './components/TutorRegistrationPage';
import { StudentRegistrationPage } from './components/StudentRegistrationPage';
import { SimpleContactPage } from './components/SimpleContactPage';
import { DiagnosticPage } from './components/DiagnosticPage';
import { auth } from './utils/supabase-client';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'dashboard' | 'confidentialite' | 'annulation' | 'approche' | 'equipe' | 'termes' | 'contact' | 'inscription' | 'inscription-eleve' | 'contact-simple' | 'diagnostic' | 'server-diagnostic' | 'db-setup'>('home');
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Check for existing session on mount
  useEffect(() => {
    // Check if URL contains ?setup=true for database setup
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('setup') === 'true') {
      setCurrentPage('db-setup');
      return;
    }
    
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const currentUser = auth.getCurrentUser();
      console.log('🔍 checkSession - currentUser from localStorage:', currentUser);
      if (currentUser) {
        setUser({ email: currentUser.email });
        setUserProfile(currentUser);
        console.log('✅ Setting dashboard with user:', currentUser);
        setCurrentPage('dashboard');
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  }

  function handleLogout() {
    auth.logout();
    setUser(null);
    setUserProfile(null);
    setCurrentPage('home');
  }

  const handleContactNavigation = () => {
    setCurrentPage('contact-simple');
  };

  const handleInscriptionEleve = () => {
    setCurrentPage('inscription-eleve');
  };

  const handleTutorRegistration = () => {
    setCurrentPage('inscription');
  };

  const handleDiagnostic = () => {
    setCurrentPage('diagnostic');
  };

  async function handleLogin(email: string, password: string) {
    // La logique de connexion est maintenant dans LoginPage.tsx avec Supabase
    // On recharge juste la session
    await checkSession();
  }

  async function handleSignup(email: string, password: string, name: string, role: string, profile: any) {
    try {
      // Simulation d'inscription
      alert('Inscription réussie! Vous pouvez maintenant vous connecter avec les comptes de démonstration.');
      setCurrentPage('login');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Home Page
  if (currentPage === 'home') {
    return (
      <HomePage
        onLogin={() => setCurrentPage('login')}
        onSignup={() => setCurrentPage('signup')}
        onNavigateToConfidentialite={() => setCurrentPage('confidentialite')}
        onNavigateToAnnulation={() => setCurrentPage('annulation')}
        onNavigateToApproche={() => setCurrentPage('approche')}
        onNavigateToEquipe={() => setCurrentPage('equipe')}
        onNavigateToTermes={() => setCurrentPage('termes')}
        onNavigateToContact={() => setCurrentPage('contact')}
        onNavigateToInscription={() => setCurrentPage('inscription')}
        onNavigateToInscriptionEleve={() => setCurrentPage('inscription-eleve')}
        onNavigateToContactSimple={handleContactNavigation}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBack={() => setCurrentPage('home')}
        onNavigateToTutorRegistration={handleTutorRegistration}
        onNavigateToDiagnostic={() => setCurrentPage('server-diagnostic')}
      />
    );
  }

  if (currentPage === 'server-diagnostic') {
    return (
      <ServerDiagnostic
        onBack={() => setCurrentPage('login')}
      />
    );
  }

  if (currentPage === 'diagnostic') {
    return (
      <DiagnosticPage
        onBack={() => setCurrentPage('login')}
      />
    );
  }

  if (currentPage === 'confidentialite') {
    return <PolitiqueConfidentialite onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'annulation') {
    return <PolitiqueAnnulation onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'approche') {
    return <NotreApproche onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'equipe') {
    return (
      <NotreEquipe
        onBack={() => setCurrentPage('home')}
        onNavigateToRegistration={() => setCurrentPage('inscription')}
        onNavigateToServices={() => {
          setCurrentPage('home');
          setTimeout(() => {
            const servicesSection = document.getElementById('services');
            if (servicesSection) {
              servicesSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }}
        onNavigateToApproche={() => setCurrentPage('approche')}
        onNavigateToTermes={() => setCurrentPage('termes')}
        onNavigateToConfidentialite={() => setCurrentPage('confidentialite')}
        onNavigateToAnnulation={() => setCurrentPage('annulation')}
        onNavigateToContact={() => setCurrentPage('contact')}
      />
    );
  }

  if (currentPage === 'termes') {
    return <TermesConditions onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'contact') {
    return <ContactPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'inscription') {
    return <TutorRegistrationPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'inscription-eleve') {
    return <StudentRegistrationPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'contact-simple') {
    return <SimpleContactPage onBack={() => setCurrentPage('home')} />;
  }

  // Database Setup (temporary for initial setup)
  if (currentPage === 'db-setup') {
    return <DatabaseSetup />;
  }

  // Dashboard
  if (currentPage === 'dashboard' && userProfile) {
    console.log('📊 Rendering dashboard for role:', userProfile.role);
    if (userProfile.role === 'admin') {
      console.log('🔑 Rendering AdminDashboard');
      return <AdminDashboard user={userProfile} onLogout={handleLogout} />;
    }
    if (userProfile.role === 'tutor') {
      console.log('👨‍🏫 Rendering TutorDashboard');
      return <TutorDashboard user={userProfile} onLogout={handleLogout} />;
    }
    if (userProfile.role === 'student') {
      console.log('👨‍🎓 Rendering StudentDashboard');
      return <StudentDashboard user={userProfile} onLogout={handleLogout} />;
    }
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Chargement...</h1>
        <p className="text-gray-600">Veuillez patienter</p>
      </div>
    </div>
  );
}