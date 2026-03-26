import { useState, useEffect } from 'react';
import { UserPlus, Check, X, Mail, Phone, GraduationCap, FileText, Clock, KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { getTutorApplications, updateTutorApplication } from '../../utils/supabase/database';
import { supabase } from '../../app/core/supabase.client';

interface TutorApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  levels: string[];
  experience: string;
  notes?: string | null;
  cv_url?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  accountExists?: boolean;
}

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-385c5805`;

function generateTemporaryPassword() {
  const randomPart = Math.random().toString(36).slice(-6).toUpperCase();
  return `Tuteur!${randomPart}`;
}

export function AdminTutorApplications() {
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState(generateTemporaryPassword());

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);

    try {
      const [applicationsData, profilesResult] = await Promise.all([
        getTutorApplications(),
        supabase.from('profiles').select('email, role').eq('role', 'tutor'),
      ]);

      const existingTutorEmails = new Set(
        (profilesResult.data || []).map((profile: any) => String(profile.email || '').toLowerCase())
      );

      const mapped = (applicationsData as TutorApplication[]).map(application => ({
        ...application,
        accountExists: existingTutorEmails.has(String(application.email || '').toLowerCase()),
      }));

      setApplications(mapped);
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures tuteur :', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredApplications = applications.filter(application =>
    filter === 'all' ? true : application.status === filter
  );

  const pendingCount = applications.filter(application => application.status === 'pending').length;

  async function handleApprove(applicationId: string) {
    try {
      await updateTutorApplication(applicationId, 'approved');
      await fetchApplications();
    } catch (error) {
      console.error("Erreur lors de l'approbation :", error);
      alert("Impossible d'approuver cette candidature.");
    }
  }

  async function handleReject(applicationId: string) {
    try {
      await updateTutorApplication(applicationId, 'rejected');
      await fetchApplications();
    } catch (error) {
      console.error('Erreur lors du rejet :', error);
      alert("Impossible de rejeter cette candidature.");
    }
  }

  function openCreateAccountDialog(application: TutorApplication) {
    setSelectedApplication(application);
    setTemporaryPassword(generateTemporaryPassword());
  }

  async function handleCreateTutorAccount() {
    if (!selectedApplication) {
      return;
    }

    setCreatingAccount(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${API_URL}/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${accessToken || anonKey}`,
        },
        body: JSON.stringify({
          email: selectedApplication.email,
          password: temporaryPassword,
          name: selectedApplication.name,
          role: 'tutor',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Impossible de créer le compte tuteur.');
      }

      const profileId = data?.user?.id;
      const profileUserId = data?.user?.user_id || data?.user?.id;

      if (profileId || profileUserId) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            phone: selectedApplication.phone || null,
            subjects: selectedApplication.subjects || [],
            levels: selectedApplication.levels || [],
            bio: selectedApplication.experience || null,
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${profileId || ''},user_id.eq.${profileUserId || ''}`);

        if (profileUpdateError) {
          throw new Error(`Compte créé, mais le profil tuteur n'a pas pu être complété: ${profileUpdateError.message}`);
        }
      }

      const existingNotes = selectedApplication.notes?.trim();
      const accountNote = `Compte tuteur créé le ${new Date().toLocaleDateString('fr-CA')} avec mot de passe temporaire généré par l'admin.`;

      await updateTutorApplication(
        selectedApplication.id,
        'approved',
        existingNotes ? `${existingNotes}\n${accountNote}` : accountNote
      );

      const createdName = selectedApplication.name;
      const createdEmail = selectedApplication.email;
      const createdPassword = temporaryPassword;

      setSelectedApplication(null);
      await fetchApplications();

      alert(
        `Compte créé pour ${createdName}\nEmail: ${createdEmail}\nMot de passe temporaire: ${createdPassword}`
      );
    } catch (error: any) {
      console.error('Erreur lors de la création du compte tuteur :', error);
      alert(error?.message || 'Impossible de créer le compte tuteur.');
    } finally {
      setCreatingAccount(false);
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Chargement des demandes...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
            Demandes de tutorat
          </h3>
          <p className="mt-1 text-sm" style={{ color: '#7F8C8D' }}>
            Gérez les candidatures envoyées depuis la page « Devenir un tuteur ».
          </p>
        </div>

        {pendingCount > 0 && (
          <Alert style={{ backgroundColor: '#FEF3E2', border: '1px solid #F39C12' }}>
            <Clock className="h-4 w-4" style={{ color: '#F39C12' }} />
            <AlertDescription style={{ color: '#F39C12' }}>
              <strong>{pendingCount}</strong> demande{pendingCount > 1 ? 's' : ''} en attente de traitement
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                style={filter === 'all' ? { backgroundColor: '#2E5CA8', color: 'white' } : {}}
              >
                Toutes ({applications.length})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                style={filter === 'pending' ? { backgroundColor: '#F39C12', color: 'white' } : {}}
              >
                En attente ({applications.filter(application => application.status === 'pending').length})
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
                style={filter === 'approved' ? { backgroundColor: '#10b981', color: 'white' } : {}}
              >
                Approuvées ({applications.filter(application => application.status === 'approved').length})
              </Button>
              <Button
                variant={filter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilter('rejected')}
                style={filter === 'rejected' ? { backgroundColor: '#E74C3C', color: 'white' } : {}}
              >
                Rejetées ({applications.filter(application => application.status === 'rejected').length})
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserPlus className="mx-auto mb-4 h-16 w-16 opacity-20" style={{ color: '#7F8C8D' }} />
                <p className="font-medium" style={{ color: '#2C3E50' }}>Aucune demande</p>
                <p className="mt-2 text-sm" style={{ color: '#7F8C8D' }}>
                  Les nouvelles candidatures apparaîtront ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map(application => (
              <Card key={application.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white"
                        style={{ backgroundColor: '#2E5CA8' }}
                      >
                        {application.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <CardTitle className="text-lg">{application.name}</CardTitle>
                          <Badge
                            style={{
                              backgroundColor:
                                application.status === 'pending'
                                  ? '#FEF3E2'
                                  : application.status === 'approved'
                                    ? '#D1FAE5'
                                    : '#FEE2E2',
                              color:
                                application.status === 'pending'
                                  ? '#F39C12'
                                  : application.status === 'approved'
                                    ? '#10b981'
                                    : '#E74C3C',
                              border: 'none',
                            }}
                          >
                            {application.status === 'pending'
                              ? 'En attente'
                              : application.status === 'approved'
                                ? 'Approuvée'
                                : 'Rejetée'}
                          </Badge>
                          {application.accountExists && (
                            <Badge variant="outline" style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}>
                              Compte créé
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          Demande reçue le{' '}
                          {new Date(application.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            style={{ backgroundColor: '#10b981', color: 'white' }}
                            onClick={() => handleApprove(application.id)}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            style={{ borderColor: '#E74C3C', color: '#E74C3C' }}
                            onClick={() => handleReject(application.id)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Rejeter
                          </Button>
                        </>
                      )}

                      {application.status === 'approved' && !application.accountExists && (
                        <Button
                          size="sm"
                          style={{ backgroundColor: '#2E5CA8', color: 'white' }}
                          onClick={() => openCreateAccountDialog(application)}
                        >
                          <KeyRound className="mr-1 h-4 w-4" />
                          Créer le compte
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                        <Mail className="h-4 w-4" />
                        {application.email}
                      </div>
                      {application.phone && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                          <Phone className="h-4 w-4" />
                          {application.phone}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                        <GraduationCap className="h-4 w-4" />
                        {application.levels.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium" style={{ color: '#2C3E50' }}>
                      Matières enseignées
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {application.subjects.map(subject => (
                        <Badge
                          key={subject}
                          variant="outline"
                          style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium" style={{ color: '#2C3E50' }}>
                      Présentation / expérience
                    </p>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-sm" style={{ color: '#7F8C8D' }}>
                        {application.experience}
                      </p>
                    </div>
                  </div>

                  {application.notes && (
                    <div>
                      <p className="mb-2 text-sm font-medium" style={{ color: '#2C3E50' }}>
                        Informations complémentaires
                      </p>
                      <div className="rounded-lg bg-blue-50 p-3">
                        <p className="whitespace-pre-line text-sm" style={{ color: '#7F8C8D' }}>
                          {application.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    {application.cv_url ? (
                      <a
                        href={application.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                        style={{ color: '#2E5CA8' }}
                      >
                        📄 Télécharger le CV
                      </a>
                    ) : (() => {
                      const cvMatch = application.notes?.match(/CV fourni: (.+)/);
                      const cvName = cvMatch?.[1];
                      return cvName ? (
                        <span className="italic text-orange-500">
                          CV soumis ({cvName}) — bucket Supabase Storage "cvs" non configuré
                        </span>
                      ) : (
                        <span>Aucun CV joint</span>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!selectedApplication} onOpenChange={(open: boolean) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer le compte tuteur</DialogTitle>
            <DialogDescription>
              Le compte sera créé à partir de cette candidature approuvée avec un mot de passe temporaire.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input value={selectedApplication.name} readOnly />
              </div>

              <div>
                <Label>Email</Label>
                <Input value={selectedApplication.email} readOnly />
              </div>

              <div>
                <Label>Téléphone</Label>
                <Input value={selectedApplication.phone || ''} readOnly />
              </div>

              <div>
                <Label htmlFor="temporaryPassword">Mot de passe temporaire</Label>
                <Input
                  id="temporaryPassword"
                  value={temporaryPassword}
                  onChange={(event) => setTemporaryPassword(event.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedApplication(null)}>
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  style={{ backgroundColor: '#2E5CA8', color: 'white' }}
                  onClick={handleCreateTutorAccount}
                  disabled={creatingAccount || !temporaryPassword.trim()}
                >
                  {creatingAccount ? 'Création...' : 'Créer le compte'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
