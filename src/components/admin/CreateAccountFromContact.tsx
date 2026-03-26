/// <reference types="vite/client" />
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { UserPlus, Save } from 'lucide-react';
import { supabase } from '../../app/core/supabase.client';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-385c5805`;

interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  requestType?: string;
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
  const [accountType, setAccountType] = useState<'student' | 'tutor'>(
    contactMessage.requestType === 'tutor' ? 'tutor' : 'student'
  );

  const [formData, setFormData] = useState({
    firstName: contactMessage.firstName,
    lastName: contactMessage.lastName,
    email: contactMessage.email,
    phone: contactMessage.phone ?? '',
    password: '',
    confirmPassword: '',
    schoolLevel: contactMessage.schoolLevel || '',
    subjects: contactMessage.subjects?.join(', ') || '',
    preferredSchedule: contactMessage.preferredSchedule || '',
    hoursPerWeek: contactMessage.hoursPerWeek || '',
    tutorSubjects: contactMessage.subjects?.join(', ') || '',
    bio: '',
    hourlyRate: '55',
    availability: '',
    adminNotes: contactMessage.message,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const subjectsList = accountType === 'student'
        ? formData.subjects.split(',').map(s => s.trim()).filter(Boolean)
        : formData.tutorSubjects.split(',').map(s => s.trim()).filter(Boolean);

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
          phone: formData.phone || undefined,
          bio: accountType === 'tutor' ? formData.bio : undefined,
          rate: accountType === 'tutor' ? (parseFloat(formData.hourlyRate) || undefined) : undefined,
          subjects: subjectsList,
          student_level: accountType === 'student' ? formData.schoolLevel : undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erreur lors de la création du compte');

      // Marquer le message comme "compte créé"
      await supabase
        .from('contact_messages')
        .update({ status: 'account_created' })
        .eq('id', contactMessage.id);

      alert(`Compte ${accountType === 'tutor' ? 'tuteur' : 'élève'} créé avec succès !\n\nEmail : ${formData.email}\nMot de passe : ${formData.password}`);
      onAccountCreated();
      onClose();
    } catch (error: any) {
      console.error('Erreur création compte:', error);
      alert(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: '#2C3E50' }}>
            <UserPlus className="h-5 w-5" style={{ color: '#2E5CA8' }} />
            Créer un compte depuis le message de contact
          </DialogTitle>
          <DialogDescription>
            Les informations du message de contact sont pré-remplies. Complétez les détails manquants.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Type de compte */}
          <div className="flex gap-4 p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
            <button
              type="button"
              onClick={() => setAccountType('student')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${accountType === 'student' ? 'text-white shadow-md' : 'bg-white border-2'}`}
              style={accountType === 'student' ? { backgroundColor: '#E74C3C' } : { borderColor: '#E0E0E0', color: '#7F8C8D' }}
            >
              Compte Élève
            </button>
            <button
              type="button"
              onClick={() => setAccountType('tutor')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${accountType === 'tutor' ? 'text-white shadow-md' : 'bg-white border-2'}`}
              style={accountType === 'tutor' ? { backgroundColor: '#10b981' } : { borderColor: '#E0E0E0', color: '#7F8C8D' }}
            >
              Compte Tuteur
            </button>
          </div>

          {/* Informations personnelles */}
          <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
            <h3 className="font-semibold" style={{ color: '#2C3E50' }}>Informations personnelles</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(514) 555-1234" />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
            <h3 className="font-semibold" style={{ color: '#2C3E50' }}>Mot de passe du compte</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Mot de passe *</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Minimum 6 caractères" required />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmer *</Label>
                <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
              </div>
            </div>
          </div>

          {/* Informations élève */}
          {accountType === 'student' && (
            <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#E3F2FD' }}>
              <h3 className="font-semibold" style={{ color: '#2C3E50' }}>Informations élève</h3>

              <div>
                <Label htmlFor="schoolLevel">Niveau scolaire</Label>
                <select
                  id="schoolLevel"
                  value={formData.schoolLevel}
                  onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="Primaire">Primaire</option>
                  <option value="Secondaire">Secondaire</option>
                  <option value="CÉGEP">CÉGEP</option>
                </select>
              </div>

              <div>
                <Label htmlFor="subjects">Matières (séparées par des virgules)</Label>
                <Input id="subjects" value={formData.subjects} onChange={(e) => setFormData({ ...formData, subjects: e.target.value })} placeholder="Ex: Mathématiques, Français, Chimie" />
              </div>

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

          {/* Informations tuteur */}
          {accountType === 'tutor' && (
            <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#E3F2FD' }}>
              <h3 className="font-semibold" style={{ color: '#2C3E50' }}>Informations tuteur</h3>

              <div>
                <Label htmlFor="tutorSubjects">Matières enseignées (séparées par des virgules)</Label>
                <Input id="tutorSubjects" value={formData.tutorSubjects} onChange={(e) => setFormData({ ...formData, tutorSubjects: e.target.value })} placeholder="Ex: Mathématiques, Physique, Chimie" />
              </div>

              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Expérience, qualifications, approche pédagogique..." rows={4} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Taux horaire ($)</Label>
                  <Input id="hourlyRate" type="number" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })} placeholder="55" />
                </div>
                <div>
                  <Label htmlFor="availability">Disponibilités</Label>
                  <Input id="availability" value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} placeholder="Ex: Soirs et weekends" />
                </div>
              </div>
            </div>
          )}

          {/* Notes admin */}
          <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#F3F4F6' }}>
            <h3 className="font-semibold" style={{ color: '#2C3E50' }}>Notes administratives</h3>
            <div>
              <Label htmlFor="adminNotes">Message original</Label>
              <Textarea id="adminNotes" value={formData.adminNotes} onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })} rows={4} />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1" style={{ backgroundColor: '#10b981', color: 'white' }} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Création en cours...' : 'Créer le compte'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
