import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { TutorDashboard } from './components/TutorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
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
import { initializeMockContactMessages } from './utils/mockContactMessages';
import { initializeMockPayments } from './utils/mockPayments';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'dashboard' | 'confidentialite' | 'annulation' | 'approche' | 'equipe' | 'termes' | 'contact' | 'inscription' | 'inscription-eleve' | 'contact-simple' | 'diagnostic'>('home');
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    // Nettoyer les anciennes clés Supabase qui pourraient causer des problèmes
    cleanOldSupabaseKeys();
    checkSession();
    initializeMockContactMessages();
    initializeMockPayments();
  }, []);

  function cleanOldSupabaseKeys() {
    try {
      const keys = Object.keys(localStorage);
      const supabaseKeys = keys.filter(k => 
        k.includes('supabase.auth') || k.startsWith('sb-')
      );
      
      if (supabaseKeys.length > 0) {
        console.log('🧹 Nettoyage des anciennes clés Supabase:', supabaseKeys);
        supabaseKeys.forEach(key => {
          localStorage.removeItem(key);
        });
        console.log('✅ Anciennes clés nettoyées');
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }

  async function checkSession() {
    try {
      console.log('🔍 Vérification de la session existante (mode mock)...');
      
      // Vérifier si une session mock existe dans localStorage
      const mockAuthStr = localStorage.getItem('mockAuth');
      
      if (mockAuthStr) {
        const mockAuth = JSON.parse(mockAuthStr);
        console.log('✅ Session mock trouvée:', mockAuth.user.email);
        
        setUser(mockAuth.user);
        setUserProfile({
          id: mockAuth.user.id,
          email: mockAuth.user.email,
          name: mockAuth.user.email.split('@')[0],
          role: mockAuth.user.role,
          createdAt: new Date().toISOString()
        });
        setCurrentPage('dashboard');
      } else {
        console.log('ℹ️ Aucune session mock active');
      }
    } catch (error) {
      console.error('❌ Exception lors de la vérification de session:', error);
    } finally {
      setLoading(false);
    }
  }

  // Function to navigate to home and scroll to services section
  const navigateToServices = () => {
    setCurrentPage('home');
    setTimeout(() => {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  async function handleLogin(email: string, password: string) {
    // La logique de connexion est maintenant dans LoginPage.tsx
    // On vérifie juste si la connexion a réussi
    const mockAuthStr = localStorage.getItem('mockAuth');
    if (mockAuthStr) {
      await checkSession();
    }
  }

  async function handleSignup(email: string, password: string, name: string, role: string, profile: any) {
    try {
      // Simulation d'inscription
      alert('Inscription réussie! Vous pouvez maintenant vous connecter avec les comptes de démonstration.');
      setCurrentPage('login');
    } catch (error) {
      console.error('Signup error:', error);
      alert('Erreur d\'inscription');
    }
  }

  async function handleLogout() {
    try {
      // Supprimer la session mock du localStorage
      localStorage.removeItem('mockAuth');
      setUser(null);
      setUserProfile(null);
      setCurrentPage('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
          <p className="mt-2 text-xs text-gray-500">Vérification de la session...</p>
        </div>
      </div>
    );
  }

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
        onNavigateToContactSimple={() => setCurrentPage('contact-simple')}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBack={() => setCurrentPage('home')}
        onNavigateToTutorRegistration={() => setCurrentPage('inscription')}
        onNavigateToDiagnostic={() => setCurrentPage('diagnostic')}
      />
    );
  }

  if (currentPage === 'confidentialite') {
    return <PolitiqueConfidentialite 
      onBack={() => setCurrentPage('home')}
      onNavigateToServices={navigateToServices}
      onNavigateToApproche={() => setCurrentPage('approche')}
      onNavigateToEquipe={() => setCurrentPage('equipe')}
      onNavigateToTermes={() => setCurrentPage('termes')}
      onNavigateToAnnulation={() => setCurrentPage('annulation')}
      onNavigateToContact={() => setCurrentPage('contact')}
    />;
  }

  if (currentPage === 'annulation') {
    return <PolitiqueAnnulation 
      onBack={() => setCurrentPage('home')}
      onNavigateToServices={navigateToServices}
      onNavigateToApproche={() => setCurrentPage('approche')}
      onNavigateToEquipe={() => setCurrentPage('equipe')}
      onNavigateToTermes={() => setCurrentPage('termes')}
      onNavigateToConfidentialite={() => setCurrentPage('confidentialite')}
      onNavigateToContact={() => setCurrentPage('contact')}
    />;
  }

  if (currentPage === 'approche') {
    return <NotreApproche 
      onBack={() => setCurrentPage('home')} 
      onNavigateToServices={navigateToServices}
      onNavigateToEquipe={() => setCurrentPage('equipe')}
      onNavigateToTermes={() => setCurrentPage('termes')}
      onNavigateToConfidentialite={() => setCurrentPage('confidentialite')}
      onNavigateToAnnulation={() => setCurrentPage('annulation')}
      onNavigateToContact={() => setCurrentPage('contact')}
    />;
  }

  if (currentPage === 'equipe') {
    return <NotreEquipe 
      onBack={() => setCurrentPage('home')} 
      onNavigateToRegistration={() => setCurrentPage('inscription')}
      onNavigateToServices={navigateToServices}
      onNavigateToApproche={() => setCurrentPage('approche')}
      onNavigateToTermes={() => setCurrentPage('termes')}
      onNavigateToConfidentialite={() => setCurrentPage('confidentialite')}
      onNavigateToAnnulation={() => setCurrentPage('annulation')}
      onNavigateToContact={() => setCurrentPage('contact')}
    />;
  }

  if (currentPage === 'termes') {
    return <TermesConditions 
      onBack={() => setCurrentPage('home')}
      onNavigateToServices={navigateToServices}
      onNavigateToApproche={() => setCurrentPage('approche')}
      onNavigateToEquipe={() => setCurrentPage('equipe')}
      onNavigateToConfidentialite={() => setCurrentPage('confidentialite')}
      onNavigateToAnnulation={() => setCurrentPage('annulation')}
      onNavigateToContact={() => setCurrentPage('contact')}
    />;
  }

  if (currentPage === 'contact') {
    return <ContactPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'inscription') {
    return (
      <TutorRegistrationPage 
        onBack={() => setCurrentPage('home')} 
        onNavigateToContact={() => setCurrentPage('contact')}
      />
    );
  }

  if (currentPage === 'inscription-eleve') {
    return (
      <StudentRegistrationPage 
        onBack={() => setCurrentPage('home')} 
        onNavigateToContact={() => setCurrentPage('contact')}
      />
    );
  }

  if (currentPage === 'contact-simple') {
    return <SimpleContactPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'diagnostic') {
    return (
      <DiagnosticPage 
        onBack={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'dashboard' && user && userProfile) {
    const role = userProfile.role;

    if (role === 'student') {
      return (
        <StudentDashboard
          user={user}
          profile={userProfile}
          onLogout={handleLogout}
        />
      );
    }

    if (role === 'tutor') {
      return (
        <TutorDashboard
          user={user}
          profile={userProfile}
          onLogout={handleLogout}
        />
      );
    }

    if (role === 'admin') {
      return (
        <AdminDashboard
          user={user}
          profile={userProfile}
          onLogout={handleLogout}
        />
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <p className="text-xl font-semibold text-gray-800 mb-4">Erreur de chargement</p>
        <p className="text-gray-600 mb-4">Le profil utilisateur n'a pas pu être chargé.</p>
        {user && (
          <div className="text-sm text-gray-500 mb-4">
            <p>User ID: {user.id}</p>
            <p>Email: {user.email}</p>
          </div>
        )}
        <button
          onClick={() => {
            localStorage.removeItem('mockAuth');
            setUser(null);
            setUserProfile(null);
            setCurrentPage('home');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}