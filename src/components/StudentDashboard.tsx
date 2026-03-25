import { useState, useEffect } from 'react';
import { GraduationCap, Search, Calendar, MessageSquare, CreditCard, BarChart, LogOut, User, Settings, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '../utils/supabase/client';
import { TutorSearch } from './student/TutorSearch';
import { SessionsList } from './student/SessionsList';
import { MessagesPanel } from './student/MessagesPanel';
import { PaymentsHistory } from './student/PaymentsHistory';
import { ProgressTracking } from './student/ProgressTracking';
import { SettingsPanel } from './student/SettingsPanel';
import { ProgressReports } from './student/ProgressReports';
import { StudentTaxReceipts } from './student/StudentTaxReceipts';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

interface StudentDashboardProps {
  user: any;
  onLogout: () => void;
}

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [accessToken, setAccessToken] = useState<string>('');
  const [activeTab, setActiveTab] = useState('search');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    console.log('StudentDashboard mounted with user:', user);
    
    // Get access token from localStorage (Supabase auth)
    if (user) {
      const token = localStorage.getItem('access_token');
      if (token) {
        setAccessToken(token);
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
    return <div className="text-center py-8">Chargement...</div>;
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
            Bienvenue, {user.name}
          </h2>
          <p style={{ color: '#7F8C8D' }}>
            Trouvez des tuteurs et gérez vos cours depuis votre tableau de bord
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Recherche
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Calendar className="h-4 w-4 mr-2" />
              Séances
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Paiements
            </TabsTrigger>
            <TabsTrigger value="progress">
              <FileText className="h-4 w-4 mr-2" />
              Bilans
            </TabsTrigger>
            <TabsTrigger value="tax-receipts">
              <FileText className="h-4 w-4 mr-2" />
              Relevés fiscaux
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <TutorSearch userId={user.id} accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionsList userId={user.id} accessToken={accessToken} role="student" />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesPanel userId={user.id} accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsHistory userId={user.id} accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressReports userId={user.id} accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="tax-receipts">
            <StudentTaxReceipts 
              studentId={user.id} 
              studentName={user.name}
              parentName={user.parentName || 'Parent de ' + user.name}
              parentEmail={user.parentEmail || user.email}
            />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel userId={user.id} accessToken={accessToken} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}