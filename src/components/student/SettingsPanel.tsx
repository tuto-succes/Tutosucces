import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { InvoicesPanel } from '../shared/InvoicesPanel';
import { simulateNetworkDelay } from '../../utils/mockData';
import { supabase } from '../../app/core/supabase.client';

interface SettingsPanelProps {
  userId: string;
  accessToken: string;
}

export function SettingsPanel({ userId, accessToken }: SettingsPanelProps) {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      // Utilisation des données mock
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    setProfileError('');

    try {
      // Simulation de mise à jour en mode mock
      await simulateNetworkDelay();

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError('Erreur lors de la mise à jour du profil');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      // Simulation de changement de mot de passe en mode mock
      alert('✅ Fonctionnalité non disponible en mode démonstration. Configurez Supabase pour activer cette fonction.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      alert('Erreur lors de la modification du mot de passe');
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="password">Mot de passe</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" style={{ color: '#E74C3C' }} />
                <div>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Modifiez vos informations de profil</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Votre nom complet"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse courriel</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs" style={{ color: '#7F8C8D' }}>
                    L'adresse courriel ne peut pas être modifiée
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="(514) 123-4567"
                  />
                </div>

                {profileSuccess && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                    ✓ Profil mis à jour avec succès
                  </div>
                )}

                {profileError && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                    ✗ {profileError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full"
                  style={{ backgroundColor: '#E74C3C', color: 'white' }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          {/* Password Update */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" style={{ color: '#2E5CA8' }} />
                <div>
                  <CardTitle>Modifier le mot de passe</CardTitle>
                  <CardDescription>Changez votre mot de passe de connexion</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: '#7F8C8D' }}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: '#7F8C8D' }}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: '#7F8C8D' }}>
                    Minimum 8 caractères
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: '#7F8C8D' }}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {passwordSuccess && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                    ✓ Mot de passe mis à jour avec succès
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                    ✗ {passwordError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full"
                  style={{ backgroundColor: '#2E5CA8', color: 'white' }}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {savingPassword ? 'Mise à jour...' : 'Modifier le mot de passe'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invoices">
          <InvoicesPanel userId={userId} accessToken={accessToken} role="student" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
