import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { UserPlus, X, Save } from 'lucide-react';

interface CreateAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: any) => void;
}

export function CreateAccountDialog({ isOpen, onClose, onSave }: CreateAccountDialogProps) {
  const [accountType, setAccountType] = useState<'student' | 'tutor'>('student');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    // Élève
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    schoolLevel: '',
    subjects: '',
    hoursPerWeek: '',
    preferredSchedule: '',
    // Tuteur
    bio: '',
    hourlyRate: '',
    availability: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      alert('Veuillez remplir tous les champs obligatoires (*, prénom, nom, email, téléphone, mot de passe)');
      return;
    }

    if (accountType === 'student' && (!formData.parentName || !formData.parentEmail)) {
      alert('Veuillez remplir les informations du parent/tuteur légal');
      return;
    }

    const newAccount = {
      id: `${accountType}-${Date.now()}`,
      name: `${formData.firstName} ${formData.lastName}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: accountType,
      createdAt: new Date().toISOString(),
    };

    if (accountType === 'student') {
      Object.assign(newAccount, {
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
        schoolLevel: formData.schoolLevel,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
        hoursPerWeek: formData.hoursPerWeek,
        preferredSchedule: formData.preferredSchedule,
      });
    } else {
      Object.assign(newAccount, {
        bio: formData.bio,
        hourlyRate: parseFloat(formData.hourlyRate) || 50,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
        availability: formData.availability,
      });
    }

    onSave(newAccount);
    resetForm();
    onClose();
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
      subjects: '',
      hoursPerWeek: '',
      preferredSchedule: '',
      bio: '',
      hourlyRate: '',
      availability: '',
    });
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
              onClick={() => setAccountType('student')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                accountType === 'student' 
                  ? 'text-white shadow-md' 
                  : 'bg-white border-2'
              }`}
              style={accountType === 'student' ? { backgroundColor: '#E74C3C' } : { borderColor: '#E0E0E0', color: '#7F8C8D' }}
            >
              Compte Élève
            </button>
            <button
              type="button"
              onClick={() => setAccountType('tutor')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                accountType === 'tutor' 
                  ? 'text-white shadow-md' 
                  : 'bg-white border-2'
              }`}
              style={accountType === 'tutor' ? { backgroundColor: '#10b981' } : { borderColor: '#E0E0E0', color: '#7F8C8D' }}
            >
              Compte Tuteur
            </button>
          </div>

          {/* Informations personnelles */}
          <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
            <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
              Informations personnelles *
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Jean"
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Tremblay"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jean.tremblay@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(514) 555-1234"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mot de passe initial"
                required
              />
              <p className="text-xs mt-1" style={{ color: '#7F8C8D' }}>
                L'utilisateur pourra le changer plus tard
              </p>
            </div>
          </div>

          {/* Informations spécifiques élève */}
          {accountType === 'student' && (
            <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
              <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
                Informations parent/tuteur légal *
              </h3>

              <div>
                <Label htmlFor="parentName">Nom du parent *</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="Marie Tremblay"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentEmail">Email du parent *</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder="parent@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="parentPhone">Téléphone du parent</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="(514) 555-5678"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="schoolLevel">Niveau scolaire</Label>
                <select
                  id="schoolLevel"
                  value={formData.schoolLevel}
                  onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  style={{ borderColor: '#E0E0E0' }}
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="Primaire">Primaire</option>
                  <option value="Secondaire">Secondaire</option>
                  <option value="CÉGEP">CÉGEP</option>
                </select>
              </div>

              <div>
                <Label htmlFor="subjects">Matières (séparées par des virgules)</Label>
                <Input
                  id="subjects"
                  value={formData.subjects}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                  placeholder="Ex: Mathématiques, Français"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hoursPerWeek">Heures par semaine</Label>
                  <Input
                    id="hoursPerWeek"
                    value={formData.hoursPerWeek}
                    onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                    placeholder="Ex: 2-3 heures"
                  />
                </div>

                <div>
                  <Label htmlFor="preferredSchedule">Horaires préférés</Label>
                  <Input
                    id="preferredSchedule"
                    value={formData.preferredSchedule}
                    onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                    placeholder="Ex: Soirs de semaine"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Informations spécifiques tuteur */}
          {accountType === 'tutor' && (
            <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
              <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
                Informations professionnelles
              </h3>

              <div>
                <Label htmlFor="tutorSubjects">Matières enseignées (séparées par des virgules)</Label>
                <Input
                  id="tutorSubjects"
                  value={formData.subjects}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                  placeholder="Ex: Mathématiques, Physique, Chimie"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biographie / Expérience</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Parlez de votre expérience, qualifications, approche pédagogique..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Taux horaire ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="50"
                  />
                </div>

                <div>
                  <Label htmlFor="availability">Disponibilités</Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="Ex: Soirs et weekends"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              style={{ backgroundColor: '#2E5CA8', color: 'white' }}
            >
              <Save className="h-4 w-4 mr-2" />
              Créer le compte
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
