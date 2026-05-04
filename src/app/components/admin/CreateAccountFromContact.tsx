import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { UserPlus, Save } from 'lucide-react';

interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  requestType: string;
  schoolLevel?: string;
  subjects?: string[];
  preferredSchedule?: string;
  hoursPerWeek?: string;
  message: string;
}

interface CreateAccountFromContactProps {
  contactMessage: ContactMessage;
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: () => void;
}

export function CreateAccountFromContact({ contactMessage, isOpen, onClose, onAccountCreated }: CreateAccountFromContactProps) {
  const isStudent = contactMessage.requestType === 'student';
  const isTutor = contactMessage.requestType === 'tutor';

  const [formData, setFormData] = useState({
    // Informations pré-remplies du message
    firstName: contactMessage.firstName,
    lastName: contactMessage.lastName,
    email: contactMessage.email,
    phone: contactMessage.phone,
    
    // Informations de connexion (à remplir par l'admin)
    password: '',
    confirmPassword: '',
    
    // Informations spécifiques élève
    schoolLevel: contactMessage.schoolLevel || '',
    subjects: contactMessage.subjects?.join(', ') || '',
    preferredSchedule: contactMessage.preferredSchedule || '',
    hoursPerWeek: contactMessage.hoursPerWeek || '',
    
    // Informations spécifiques tuteur
    tutorSubjects: contactMessage.subjects?.join(', ') || '',
    bio: '',
    hourlyRate: '55',
    availability: '',
    
    // Notes admin
    adminNotes: contactMessage.message
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Créer le compte
    const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const newUser = {
      id: `${isStudent ? 'student' : 'tutor'}-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: isStudent ? 'student' : 'tutor',
      created_at: new Date().toISOString(),
      createdFrom: 'contact',
      contactMessageId: contactMessage.id,
      
      ...(isStudent && {
        schoolLevel: formData.schoolLevel,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
        preferredSchedule: formData.preferredSchedule,
        hoursPerWeek: formData.hoursPerWeek,
      }),
      
      ...(isTutor && {
        subjects: formData.tutorSubjects.split(',').map(s => s.trim()).filter(s => s),
        bio: formData.bio,
        hourlyRate: parseFloat(formData.hourlyRate),
        availability: formData.availability,
        approved: true, // Approuvé par défaut puisque créé par l'admin
      }),
      
      adminNotes: formData.adminNotes
    };

    users.push(newUser);
    localStorage.setItem('mockUsers', JSON.stringify(users));

    // Mettre à jour le statut du message de contact
    const contacts = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const updatedContacts = contacts.map((c: ContactMessage) =>
      c.id === contactMessage.id
        ? { ...c, status: 'account_created', accountId: newUser.id }
        : c
    );
    localStorage.setItem('contactMessages', JSON.stringify(updatedContacts));

    alert(`Compte ${isStudent ? 'élève' : 'tuteur'} créé avec succès!\n\nEmail: ${formData.email}\nMot de passe: ${formData.password}\n\nCes informations ont été enregistrées.`);
    onAccountCreated();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: '#2C3E50' }}>
            <UserPlus className="h-5 w-5" style={{ color: '#2E5CA8' }} />
            Créer un compte {isStudent ? 'élève' : isTutor ? 'tuteur' : 'utilisateur'}
          </DialogTitle>
          <DialogDescription>
            Les informations du message de contact sont pré-remplies. Complétez les détails manquants.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Informations personnelles */}
          <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
            <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
              Informations personnelles
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
            <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
              Mot de passe du compte
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 caractères"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Informations spécifiques élève */}
          {isStudent && (
            <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#E3F2FD' }}>
              <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
                Informations élève
              </h3>

              <div>
                <Label htmlFor="schoolLevel">Niveau scolaire *</Label>
                <select
                  id="schoolLevel"
                  value={formData.schoolLevel}
                  onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
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
                  placeholder="Ex: Mathématiques, Français, Chimie"
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
          {isTutor && (
            <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#E3F2FD' }}>
              <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
                Informations tuteur
              </h3>

              <div>
                <Label htmlFor="tutorSubjects">Matières enseignées * (séparées par des virgules)</Label>
                <Input
                  id="tutorSubjects"
                  value={formData.tutorSubjects}
                  onChange={(e) => setFormData({ ...formData, tutorSubjects: e.target.value })}
                  placeholder="Ex: Mathématiques, Physique, Chimie"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Expérience, qualifications, approche pédagogique..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Taux horaire ($) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="55"
                    required
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

          {/* Notes admin */}
          <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#F3F4F6' }}>
            <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
              Notes administratives
            </h3>

            <div>
              <Label htmlFor="adminNotes">Notes (message original + notes supplémentaires)</Label>
              <Textarea
                id="adminNotes"
                value={formData.adminNotes}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              style={{ backgroundColor: '#10b981', color: 'white' }}
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
