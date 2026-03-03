import { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, TrendingUp, Settings, LogOut, User, FileText, UserPlus, AlertCircle, Calendar, Mail, Receipt } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AdminUsers } from './admin/AdminUsers';
import { AdminTutorApplications } from './admin/AdminTutorApplications';
import { AdminFinances } from './admin/AdminFinances';
import { AdminStats } from './admin/AdminStats';
import { AdminContactMessagesPage } from './AdminContactMessagesPage';
import { AdminSchedulePage } from './AdminSchedulePage';
import { AdminInvoicesPage } from './AdminInvoicesPage';
import { AdminTaxReceipts } from './admin/AdminTaxReceipts';
import logoImg from 'figma:asset/bf7daf7f4d90880ea5fa593b28754dac8a736020.png';

interface AdminDashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
}

export function AdminDashboard({ user, profile, onLogout }: AdminDashboardProps) {
  const [accessToken, setAccessToken] = useState<string>('');
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    console.log('AdminDashboard mounted with user:', user);
    
    if (user) {
      const mockToken = localStorage.getItem('mockAuth');
      if (mockToken) {
        const { token } = JSON.parse(mockToken);
        setAccessToken(token);
      }
    }
  }, [user]);

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
                <span className="text-xs tracking-wide" style={{ color: '#7F8C8D' }}>ADMINISTRATION</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" style={{ color: '#7F8C8D' }} />
                <span className="text-sm font-medium" style={{ color: '#2C3E50' }}>{profile.name}</span>
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
            Panneau d'administration
          </h2>
          <p style={{ color: '#7F8C8D' }}>
            Gérez les utilisateurs, les demandes de tutorat et les finances de la plateforme
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger value="stats">
              <TrendingUp className="h-4 w-4 mr-2" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="applications">
              <UserPlus className="h-4 w-4 mr-2" />
              Demandes
            </TabsTrigger>
            <TabsTrigger value="messages">
              <Mail className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Calendrier
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <Receipt className="h-4 w-4 mr-2" />
              Factures
            </TabsTrigger>
            <TabsTrigger value="finances">
              <DollarSign className="h-4 w-4 mr-2" />
              Finances
            </TabsTrigger>
            <TabsTrigger value="tax-receipts">
              <FileText className="h-4 w-4 mr-2" />
              Relevés fiscaux
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="applications">
            <AdminTutorApplications />
          </TabsContent>

          <TabsContent value="messages">
            <AdminContactMessagesPage />
          </TabsContent>

          <TabsContent value="schedule">
            <AdminSchedulePage />
          </TabsContent>

          <TabsContent value="invoices">
            <AdminInvoicesPage />
          </TabsContent>

          <TabsContent value="finances">
            <AdminFinances />
          </TabsContent>

          <TabsContent value="tax-receipts">
            <AdminTaxReceipts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}