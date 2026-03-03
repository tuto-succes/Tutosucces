import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Save, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: 'student' | 'tutor';
  schoolLevel?: string;
  subjects?: string[];
  preferredSchedule?: string;
  hoursPerWeek?: string;
  bio?: string;
  hourlyRate?: number;
  availability?: string;
  [key: string]: any;
}

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export function EditUserDialog({ user, isOpen, onClose, onSave }: EditUserDialogProps) {
  const [formData, setFormData] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      // Copier l'utilisateur pour l'édition
      setFormData({ ...user });
    }
  }, [user]);

  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.phone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Mettre à jour le nom complet si firstName/lastName ont changé
    if (formData.firstName && formData.lastName) {
      formData.name = `${formData.firstName} ${formData.lastName}`;
    }

    // Sauvegarder les modifications
    onSave(formData);
    onClose();
  };

  const isStudent = formData.role === 'student';
  const isTutor = formData.role === 'tutor';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: '#2C3E50' }}>
            Modifier {isStudent ? 'l\'élève' : 'le tuteur'} : {formData.name}
          </DialogTitle>
          <DialogDescription>
            Les modifications seront synchronisées avec le compte de l'utilisateur
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Informations de base */}
          <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
            <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
              Informations personnelles
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Prénom"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Nom"
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
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(514) 555-1234"
                required
              />
            </div>
          </div>

          {/* Informations spécifiques élève */}
          {isStudent && (
            <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#E3F2FD' }}>
              <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
                Informations élève
              </h3>

              <div>
                <Label htmlFor="schoolLevel">Niveau scolaire</Label>
                <select
                  id="schoolLevel"
                  value={formData.schoolLevel || ''}
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
                  value={formData.subjects?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="Ex: Mathématiques, Français"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hoursPerWeek">Heures par semaine</Label>
                  <Input
                    id="hoursPerWeek"
                    value={formData.hoursPerWeek || ''}
                    onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                    placeholder="Ex: 2-3 heures"
                  />
                </div>

                <div>
                  <Label htmlFor="preferredSchedule">Horaires préférés</Label>
                  <Input
                    id="preferredSchedule"
                    value={formData.preferredSchedule || ''}
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
                <Label htmlFor="tutorSubjects">Matières enseignées (séparées par des virgules)</Label>
                <Input
                  id="tutorSubjects"
                  value={formData.subjects?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="Ex: Mathématiques, Physique"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Expérience, qualifications..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Taux horaire ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate || ''}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                    placeholder="55"
                  />
                </div>

                <div>
                  <Label htmlFor="availability">Disponibilités</Label>
                  <Input
                    id="availability"
                    value={formData.availability || ''}
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
              onClick={onClose}
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
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
