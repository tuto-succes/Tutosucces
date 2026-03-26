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
  levels?: string[];
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

const schoolLevels = ['Primaire', 'Secondaire', 'CÉGEP'];

const subjectsByLevel: Record<string, string[]> = {
  Primaire: [
    'Mathématiques',
    'Sciences',
    'Français',
    'Anglais',
  ],
  Secondaire: [
    'Mathématiques',
    'Sciences',
    'Physique',
    'Chimie',
    'Français',
    'Anglais',
    'Histoire',
  ],
  'CÉGEP': [
    'Calcul I',
    'Calcul II',
    'Algèbre linéaire',
    'Chimie générale',
    'Chimie des solutions',
    'Chimie organique',
    'Physique mécanique',
    'Électricité et magnétisme',
    'Ondes et physique moderne',
    'Français',
    'Anglais',
    'Philosophie',
  ],
};

function getSubjectsForLevels(levels: string[]) {
  return Array.from(
    new Set(
      levels.flatMap(level => subjectsByLevel[level] || [])
    )
  );
}

function toggleSelection(values: string[], value: string) {
  return values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value];
}

export function EditUserDialog({ user, isOpen, onClose, onSave }: EditUserDialogProps) {
  const [formData, setFormData] = useState<User | null>(user ?? null);

  // Réinitialise le formulaire à chaque ouverture du dialog (user.id garantit le rechargement)
  useEffect(() => {
    if (user && isOpen) {
      setFormData({ ...user });
    }
  }, [user?.id, isOpen]);

  if (!formData || !isOpen) {
    return <Dialog open={false} onOpenChange={onClose} />;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formData) return;

    if (!formData.email) {
      alert('Veuillez remplir le champ email.');
      return;
    }

    const dataToSave: User = {
      ...formData,
      name: formData.firstName && formData.lastName
        ? `${formData.firstName} ${formData.lastName}`
        : formData.name,
    };

    onSave(dataToSave);
    onClose();
  }

  const isStudent = formData.role === 'student';
  const isTutor = formData.role === 'tutor';
  const studentSubjects = formData.schoolLevel ? subjectsByLevel[formData.schoolLevel] || [] : [];
  const tutorLevels = formData.levels || [];
  const tutorSubjects = getSubjectsForLevels(tutorLevels);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: '#2C3E50' }}>
            Modifier {isStudent ? "l'élève" : 'le tuteur'} : {formData.name}
          </DialogTitle>
          <DialogDescription>
            Les modifications seront synchronisées avec le compte de l&apos;utilisateur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-4 rounded-lg p-4" style={{ backgroundColor: '#F8F9FA' }}>
            <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
              Informations personnelles
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
                  placeholder="Prénom"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
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
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                placeholder="(514) 555-1234"
              />
            </div>
          </div>

          {isStudent && (
            <div className="space-y-4 rounded-lg p-4" style={{ backgroundColor: '#E3F2FD' }}>
              <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
                Informations élève
              </h3>

              <div>
                <Label htmlFor="schoolLevel">Niveau scolaire</Label>
                <select
                  id="schoolLevel"
                  value={formData.schoolLevel || ''}
                  onChange={(event) => setFormData({
                    ...formData,
                    schoolLevel: event.target.value,
                    subjects: [],
                  })}
                  className="w-full rounded-md border px-3 py-2"
                  style={{ borderColor: '#E0E0E0' }}
                >
                  <option value="">Sélectionnez un niveau</option>
                  {schoolLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Matières</Label>
                {studentSubjects.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Sélectionnez d&apos;abord un niveau scolaire.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {studentSubjects.map(subject => {
                      const selected = (formData.subjects || []).includes(subject);
                      return (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            subjects: toggleSelection(formData.subjects || [], subject),
                          })}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            selected
                              ? 'border-[#2E5CA8] bg-[#2E5CA8] text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-[#2E5CA8]'
                          }`}
                        >
                          {subject}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {isTutor && (
            <div className="space-y-4 rounded-lg p-4" style={{ backgroundColor: '#E3F2FD' }}>
              <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
                Informations tuteur
              </h3>

              <div>
                <Label>Niveaux enseignés</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {schoolLevels.map(level => {
                    const selected = tutorLevels.includes(level);
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          levels: toggleSelection(tutorLevels, level),
                          subjects: [],
                        })}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${
                          selected
                            ? 'border-[#10b981] bg-[#10b981] text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-[#10b981]'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label>Matières enseignées</Label>
                {tutorSubjects.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Sélectionnez d&apos;abord un ou plusieurs niveaux.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tutorSubjects.map(subject => {
                      const selected = (formData.subjects || []).includes(subject);
                      return (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            subjects: toggleSelection(formData.subjects || [], subject),
                          })}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            selected
                              ? 'border-[#2E5CA8] bg-[#2E5CA8] text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-[#2E5CA8]'
                          }`}
                        >
                          {subject}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(event) => setFormData({ ...formData, bio: event.target.value })}
                  placeholder="Expérience, qualifications..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="hourlyRate">Taux horaire ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate || ''}
                    onChange={(event) => setFormData({ ...formData, hourlyRate: parseFloat(event.target.value) || undefined })}
                    placeholder="55"
                  />
                </div>

                <div>
                  <Label htmlFor="availability">Disponibilités</Label>
                  <Input
                    id="availability"
                    value={formData.availability || ''}
                    onChange={(event) => setFormData({ ...formData, availability: event.target.value })}
                    placeholder="Ex: Soirs et fins de semaine"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              style={{ backgroundColor: '#2E5CA8', color: 'white' }}
            >
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
