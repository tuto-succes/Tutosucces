/// <reference types="vite/client" />
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { UserPlus, X, Save } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-385c5805`;

const SUBJECTS_BY_LEVEL: Record<string, string[]> = {
  Primaire: ['Mathématiques', 'Sciences', 'Français', 'Anglais'],
  Secondaire: ['Mathématiques', 'Sciences', 'Physique', 'Chimie', 'Français', 'Anglais'],
  CÉGEP: [
    'Calcul I', 'Calcul II', 'Algèbre linéaire',
    'Chimie générale', 'Chimie des solutions', 'Chimie organique',
    'Physique mécanique', 'Électricité et magnétisme', 'Ondes et physique moderne',
    'Français', 'Anglais',
  ],
};

const TUTOR_LEVELS = ['Primaire', 'Secondaire', 'CÉGEP'];

interface InitialData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  accountType?: 'student' | 'tutor';
  schoolLevel?: string;
  subjects?: string[];
}

interface CreateAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: any) => void;
  initialData?: InitialData;
}

export function CreateAccountDialog({ isOpen, onClose, onSave, initialData }: CreateAccountDialogProps) {
  const [accountType, setAccountType] = useState<'student' | 'tutor'>(initialData?.accountType ?? 'student');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialData?.subjects ?? []);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName ?? '',
    lastName: initialData?.lastName ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    password: '',
    // Élève
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    schoolLevel: initialData?.schoolLevel ?? '',
    hoursPerWeek: '',
    preferredSchedule: '',
    // Tuteur
    bio: '',
    hourlyRate: '',
    availability: '',
  });
  const [loading, setLoading] = useState(false);

  function toggleSubject(subject: string) {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  }

  function toggleTutorLevel(level: string) {
    setSelectedLevels(prev => {
      const next = prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level];
      // Remove subjects that no longer belong to any selected level
      const allowedSubjects = next.flatMap(l => SUBJECTS_BY_LEVEL[l] ?? []);
      setSelectedSubjects(subs => subs.filter(s => allowedSubjects.includes(s)));
      return next;
    });
  }

  function handleSchoolLevelChange(level: string) {
    setFormData({ ...formData, schoolLevel: level });
    setSelectedSubjects([]);
  }

  const studentSubjects = formData.schoolLevel ? (SUBJECTS_BY_LEVEL[formData.schoolLevel] ?? []) : [];
  const tutorAvailableSubjects = selectedLevels.flatMap(l => SUBJECTS_BY_LEVEL[l] ?? [])
    .filter((s, i, arr) => arr.indexOf(s) === i); // deduplicate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      alert('Veuillez remplir tous les champs obligatoires (prénom, nom, email, téléphone, mot de passe)');
      return;
    }

    if (accountType === 'student' && (!formData.parentName || !formData.parentEmail)) {
      alert('Veuillez remplir les informations du parent/tuteur légal');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${API_URL}/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: fullName,
          role: accountType,
          phone: formData.phone,
          bio: accountType === 'tutor' ? formData.bio : undefined,
          rate: accountType === 'tutor' ? (parseFloat(formData.hourlyRate) || undefined) : undefined,
          subjects: selectedSubjects,
          levels: accountType === 'tutor' ? selectedLevels : undefined,
          student_level: accountType === 'student' ? formData.schoolLevel : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création du compte');
      }

      onSave(result.user);
      resetForm();
      onClose();
      alert(`Compte ${accountType === 'tutor' ? 'tuteur' : 'élève'} créé avec succès pour ${fullName}`);
    } catch (error: any) {
      console.error('Erreur création compte:', error);
      alert(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      schoolLevel: '',
      hoursPerWeek: '',
      preferredSchedule: '',
      bio: '',
      hourlyRate: '',
      availability: '',
    });
    setSelectedSubjects([]);
    setSelectedLevels([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: '#2C3E50' }}>
            <UserPlus className="inline h-5 w-5 mr-2" />
            Créer un nouveau compte
          </DialogTitle>
          <DialogDescription>
            Créez un compte élève ou tuteur avec toutes les informations nécessaires
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Type de compte */}
          <div className="flex gap-4 p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
            <button
              type="button"
              onClick={() => { setAccountType('student'); setSelectedSubjects([]); setSelectedLevels([]); }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${accountType === 'student' ? 'text-white shadow-md' : 'bg-white border-2'}`}
              style={accountType === 'student' ? { backgroundColor: '#E74C3C' } : { borderColor: '#E0E0E0', color: '#7F8C8D' }}
            >
              Compte Élève
            </button>
            <button
              type="button"
              onClick={() => { setAccountType('tutor'); setSelectedSubjects([]); setSelectedLevels([]); }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${accountType === 'tutor' ? 'text-white shadow-md' : 'bg-white border-2'}`}
              style={accountType === 'tutor' ? { backgroundColor: '#10b981' } : { borderColor: '#E0E0E0', color: '#7F8C8D' }}
            >
              Compte Tuteur
            </button>
          </div>

          {/* Informations personnelles */}
          <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
            <h3 className="font-semibold" style={{ color: '#2C3E50' }}>Informations personnelles *</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="Jean" required />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Tremblay" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="jean.tremblay@example.com" required />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(514) 555-1234" required />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input id="password" type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Mot de passe initial" required />
              <p className="text-xs mt-1" style={{ color: '#7F8C8D' }}>L'utilisateur pourra le changer plus tard</p>
            </div>
          </div>

          {/* Informations spécifiques élève */}
          {accountType === 'student' && (
            <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
              <h3 className="font-semibold" style={{ color: '#2C3E50' }}>Informations parent/tuteur légal *</h3>

              <div>
                <Label htmlFor="parentName">Nom du parent *</Label>
                <Input id="parentName" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} placeholder="Marie Tremblay" required />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentEmail">Email du parent *</Label>
                  <Input id="parentEmail" type="email" value={formData.parentEmail} onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })} placeholder="parent@example.com" required />
                </div>
                <div>
                  <Label htmlFor="parentPhone">Téléphone du parent</Label>
                  <Input id="parentPhone" type="tel" value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} placeholder="(514) 555-5678" />
                </div>
              </div>

              <div>
                <Label htmlFor="schoolLevel">Niveau scolaire</Label>
                <select
                  id="schoolLevel"
                  value={formData.schoolLevel}
                  onChange={(e) => handleSchoolLevelChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  style={{ borderColor: '#E0E0E0' }}
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="Primaire">Primaire</option>
                  <option value="Secondaire">Secondaire</option>
                  <option value="CÉGEP">CÉGEP</option>
                </select>
              </div>

              {studentSubjects.length > 0 && (
                <div>
                  <Label>Matières</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {studentSubjects.map(subject => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => toggleSubject(subject)}
                        className="px-3 py-1 rounded-full text-sm font-medium border transition-all"
                        style={
                          selectedSubjects.includes(subject)
                            ? { backgroundColor: '#E74C3C', color: 'white', borderColor: '#E74C3C' }
                            : { backgroundColor: 'white', color: '#7F8C8D', borderColor: '#E0E0E0' }
                        }
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hoursPerWeek">Heures par semaine</Label>
                  <Input id="hoursPerWeek" value={formData.hoursPerWeek} onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })} placeholder="Ex: 2-3 heures" />
                </div>
                <div>
                  <Label htmlFor="preferredSchedule">Horaires préférés</Label>
                  <Input id="preferredSchedule" value={formData.preferredSchedule} onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })} placeholder="Ex: Soirs de semaine" />
                </div>
              </div>
            </div>
          )}

          {/* Informations spécifiques tuteur */}
          {accountType === 'tutor' && (
            <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
              <h3 className="font-semibold" style={{ color: '#2C3E50' }}>Informations professionnelles</h3>

              <div>
                <Label>Niveaux enseignés</Label>
                <div className="flex gap-3 mt-2">
                  {TUTOR_LEVELS.map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => toggleTutorLevel(level)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                      style={
                        selectedLevels.includes(level)
                          ? { backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }
                          : { backgroundColor: 'white', color: '#7F8C8D', borderColor: '#E0E0E0' }
                      }
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {tutorAvailableSubjects.length > 0 && (
                <div>
                  <Label>Matières enseignées</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tutorAvailableSubjects.map(subject => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => toggleSubject(subject)}
                        className="px-3 py-1 rounded-full text-sm font-medium border transition-all"
                        style={
                          selectedSubjects.includes(subject)
                            ? { backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }
                            : { backgroundColor: 'white', color: '#7F8C8D', borderColor: '#E0E0E0' }
                        }
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="bio">Biographie / Expérience</Label>
                <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Parlez de votre expérience, qualifications, approche pédagogique..." rows={4} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Taux horaire ($)</Label>
                  <Input id="hourlyRate" type="number" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })} placeholder="50" />
                </div>
                <div>
                  <Label htmlFor="availability">Disponibilités</Label>
                  <Input id="availability" value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} placeholder="Ex: Soirs et weekends" />
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button type="submit" className="flex-1" style={{ backgroundColor: '#2E5CA8', color: 'white' }} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Création en cours...' : 'Créer le compte'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
