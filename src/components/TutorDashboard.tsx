import { useState, useEffect } from 'react';
import { Calendar, MessageSquare, DollarSign, BarChart, LogOut, User, Settings, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '../utils/supabase/client';
import { SessionsList } from './student/SessionsList';
import { MessagesPanel } from './student/MessagesPanel';
import { TutorEarnings } from './tutor/TutorEarnings';
import { TutorStats } from './tutor/TutorStats';
import { TutorProfile } from './tutor/TutorProfile';
import { TutorProgressReports } from './tutor/TutorProgressReports';
import { RevenueTracking } from './tutor/RevenueTracking';
import { TutorTaxReceipts } from './tutor/TutorTaxReceipts';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

interface TutorDashboardProps {
  user: any;
  onLogout: () => void;
}

export function TutorDashboard({ user, onLogout }: TutorDashboardProps) {
  const [accessToken, setAccessToken] = useState<string>('');
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    console.log('TutorDashboard mounted with user:', user);
    
    // Get access token from user object (stored by auth.login)
    if (user?.access_token) {
      setAccessToken(user.access_token);
      console.log('✅ Access token récupéré');
    } else {
      // Fallback: essayer de récupérer depuis localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.access_token) {
          setAccessToken(parsedUser.access_token);
          console.log('✅ Access token récupéré depuis localStorage');
        }
      }
    }
  }, [user]);

  async function getValidAccessToken() {
    try {
      // En mode mock, retourner simplement le token du localStorage
      const mockAuthStr = localStorage.getItem('mockAuth');
      if (mockAuthStr) {
        const { token } = JSON.parse(mockAuthStr);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  if (sessionExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
            Session expirée
          </h2>
          <p className="text-gray-600 mb-6">
            Votre session a expiré. Veuillez vous reconnecter pour continuer.
          </p>
          <Button
            onClick={onLogout}
            className="w-full"
            style={{ backgroundColor: '#2E5CA8', color: 'white' }}
          >
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-blue-500 text-5xl mb-4">🔄</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
            Chargement de votre espace tuteur...
          </h2>
          <p className="text-gray-600 mb-2">
            Récupération de votre token d'accès
          </p>
          <p className="text-xs text-gray-500 mt-4">
            User: {user?.email || 'Non défini'}<br/>
            Token présent: {user?.access_token ? 'Oui' : 'Non'}
          </p>
          <Button
            onClick={onLogout}
            variant="outline"
            className="mt-6"
          >
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="Logo Tuto-Succès B&D" className="h-12" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Tuto-Succès B&D</h1>
                <span className="text-xs tracking-wide" style={{ color: '#7F8C8D' }}>EN LIGNE</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" style={{ color: '#7F8C8D' }} />
                <span className="text-sm font-medium" style={{ color: '#2C3E50' }}>{user.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
                style={{ color: '#E74C3C' }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#2C3E50' }}>
            Bonjour, {user.name}
          </h2>
          <p style={{ color: '#7F8C8D' }}>
            Gérez vos séances, communiquez avec vos élèves et suivez vos revenus
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="sessions">
              <Calendar className="h-4 w-4 mr-2" />
              Séances
            </TabsTrigger>
            <TabsTrigger value="bilans">
              <FileText className="h-4 w-4 mr-2" />
              Bilans
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="earnings">
              <DollarSign className="h-4 w-4 mr-2" />
              Revenus
            </TabsTrigger>
            <TabsTrigger value="tax-receipts">
              <FileText className="h-4 w-4 mr-2" />
              Relevés fiscaux
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Settings className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <SessionsList userId={user.id} accessToken={accessToken} role="tutor" tutorName={user.name} />
          </TabsContent>

          <TabsContent value="bilans">
            <TutorProgressReports tutorId={user.id} tutorName={user.name} />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesPanel userId={user.id} accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="earnings">
            <RevenueTracking userId={user.id} accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="tax-receipts">
            <TutorTaxReceipts tutorId={user.id} tutorName={user.name} tutorEmail={user.email} />
          </TabsContent>

          <TabsContent value="profile">
            <TutorProfile userId={user.id} accessToken={accessToken} profile={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}