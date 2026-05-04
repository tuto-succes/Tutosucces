import { useState, useEffect } from 'react';
import { Save, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AvailabilityManager } from './AvailabilityManager';
import { getMockTutorProfile } from '../../utils/mockData';

interface TutorProfileProps {
  userId: string;
  accessToken: string;
  profile: any;
}

const AVAILABLE_SUBJECTS = [
  'Français',
  'Anglais',
  'Mathématiques',
  'Sciences',
  'Histoire',
  'Géographie',
  'Chimie',
  'Physique',
  'Biologie',
  'Informatique',
  'Philosophie',
  'Économie'
];

const AVAILABLE_LEVELS = [
  'Primaire',
  'Secondaire',
  'CÉGEP'
];

export function TutorProfile({ userId, accessToken, profile }: TutorProfileProps) {
  const [tutorProfile, setTutorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [bio, setBio] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchTutorProfile();
  }, []);

  async function fetchTutorProfile() {
    try {
      // Utiliser les données mock au lieu d'appels réseau
      const data = await getMockTutorProfile(userId);
      
      // Vérifier si des données sont stockées dans localStorage
      const storedProfile = localStorage.getItem('mockTutorProfile');
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile.id === userId) {
            setTutorProfile(parsedProfile);
            setBio(parsedProfile.bio || '');
            setSelectedSubjects(parsedProfile.subjects || []);
            setSelectedLevels(parsedProfile.levels || []);
            setActive(parsedProfile.active ?? true);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing stored profile:', error);
        }
      }
      
      // Sinon utiliser les données mock par défaut
      setTutorProfile(data);
      setBio(data.bio || 'Tuteur expérimenté passionné par l\'enseignement et le succès de mes élèves.');
      setSelectedSubjects(data.subjects || []);
      setSelectedLevels(data.levels || ['Primaire', 'Secondaire', 'CÉGEP']);
      setActive(data.active ?? true);
    } catch (error) {
      console.error('Error fetching tutor profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      console.log('[TutorProfile] Début de la sauvegarde en mode mock...');
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sauvegarder dans localStorage
      const updatedProfile = {
        ...tutorProfile,
        bio,
        subjects: selectedSubjects,
        levels: selectedLevels,
        active
      };
      
      localStorage.setItem('mockTutorProfile', JSON.stringify(updatedProfile));
      setTutorProfile(updatedProfile);
      
      console.log('[TutorProfile] Sauvegarde réussie');
      alert('Profil mis à jour avec succès!');
    } catch (error) {
      console.error('[TutorProfile] Error updating profile:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  }

  function toggleSubject(subject: string) {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  }

  function toggleLevel(level: string) {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement du profil...</div>;
  }

  return (
    <Tabs defaultValue="info" className="space-y-6">
      <TabsList>
        <TabsTrigger value="info">Informations</TabsTrigger>
        <TabsTrigger value="availability">Disponibilités</TabsTrigger>
        <TabsTrigger value="password">Mot de passe</TabsTrigger>
      </TabsList>

      <TabsContent value="info">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mon profil tuteur</CardTitle>
              <CardDescription>
                Gérez vos informations visibles par les élèves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio">Présentation</Label>
                <Textarea
                  id="bio"
                  placeholder="Parlez de votre parcours, votre approche pédagogique..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Cette description sera visible par les élèves lors de leur recherche
                </p>
              </div>

              <div className="space-y-2">
                <Label>Matières enseignées</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AVAILABLE_SUBJECTS.map(subject => (
                    <label key={subject} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject)}
                        onChange={() => toggleSubject(subject)}
                        className="h-4 w-4"
                        style={{ accentColor: '#2E5CA8' }}
                      />
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Niveaux enseignés</Label>
                <div className="grid grid-cols-3 gap-3">
                  {AVAILABLE_LEVELS.map(level => (
                    <label key={level} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(level)}
                        onChange={() => toggleLevel(level)}
                        className="h-4 w-4"
                        style={{ accentColor: '#2E5CA8' }}
                      />
                      <span className="text-sm font-medium">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Profil actif</Label>
                  <p className="text-sm text-gray-500">
                    Votre profil sera {active ? 'visible' : 'masqué'} pour les élèves
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
              </div>

              <Button 
                onClick={handleSave} 
                disabled={saving} 
                className="w-full"
                style={{ backgroundColor: '#E74C3C', color: 'white' }}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </CardContent>
          </Card>

          {/* Profile Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du profil</CardTitle>
              <CardDescription>
                Voici comment les élèves verront votre profil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{profile.name}</h3>
                  <p className="text-sm text-gray-500">
                    {tutorProfile?.rating > 0 
                      ? `⭐ ${tutorProfile.rating.toFixed(1)} (${tutorProfile.reviewCount} avis)`
                      : 'Nouveau tuteur'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: active ? '#16A34A' : '#DC2626' }}>
                    {active ? '✓ Actif' : '✗ Inactif'}
                  </div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600">{bio || 'Aucune description'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Matières:</span>
                  <p className="text-gray-600 mt-1">
                    {selectedSubjects.length > 0 ? selectedSubjects.join(', ') : 'Non spécifié'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Niveaux:</span>
                  <p className="text-gray-600 mt-1">
                    {selectedLevels.length > 0 ? selectedLevels.join(', ') : 'Non spécifié'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="availability">
        <AvailabilityManager tutorId={userId} accessToken={accessToken} />
      </TabsContent>

      <TabsContent value="password">
        <PasswordChangeCard />
      </TabsContent>
    </Tabs>
  );
}

function PasswordChangeCard() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      setSavingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      setSavingPassword(false);
      return;
    }

    try {
      // Simulation de changement de mot de passe en mode mock
      alert('✅ Fonctionnalité non disponible en mode démonstration. Configurez Supabase pour activer cette fonction.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Erreur lors de la modification du mot de passe');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <Card className="max-w-2xl">
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
                required
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
              Minimum 6 caractères
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
  );
}