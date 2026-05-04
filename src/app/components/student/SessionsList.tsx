import { useState, useEffect } from 'react';
import { Calendar, Clock, User, X, Check, MessageSquare, FileText, Video, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { QuickCommentDialog } from '../tutor/QuickCommentDialog';
import { ProgressReportForm } from '../tutor/ProgressReportForm';
import { getMockSessions } from '../../utils/mockData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';

interface SessionsListProps {
  userId: string;
  accessToken: string;
  role: 'student' | 'tutor';
  tutorName?: string;
}

export function SessionsList({ userId, accessToken, role, tutorName }: SessionsListProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [selectedSessionForComment, setSelectedSessionForComment] = useState<any>(null);
  const [pendingCompletionSession, setPendingCompletionSession] = useState<any>(null);
  const [showFirstSessionDialog, setShowFirstSessionDialog] = useState(false);
  const [showProgressReportForm, setShowProgressReportForm] = useState(false);
  const [sessionToComplete, setSessionToComplete] = useState<any>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      // Forcer le rechargement des données mock depuis le fichier
      // Si vous voulez les dernières données mock, décommentez la ligne suivante :
      // localStorage.removeItem('mockSessions');
      
      // Utilisation des données mock au lieu d'appels API
      const data = await getMockSessions(userId, role);
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }

  // Fonction pour recharger les données depuis le fichier mock
  function reloadMockData() {
    localStorage.removeItem('mockSessions');
    setLoading(true);
    fetchSessions();
  }

  // Fonction pour compter le nombre de séances terminées avec un élève spécifique
  function countCompletedSessionsWithStudent(studentId: string, currentSessionId: string): number {
    return sessions.filter(s => 
      s.studentId === studentId && 
      s.status === 'completed' && 
      s.id !== currentSessionId
    ).length;
  }

  // Fonction pour marquer une séance comme terminée
  async function handleMarkAsCompleted(session: any) {
    if (role !== 'tutor') return;

    const completedCount = countCompletedSessionsWithStudent(session.studentId, session.id);
    
    // Si c'est la première séance (aucune séance terminée avant), obliger à ajouter un commentaire
    if (completedCount === 0) {
      setSessionToComplete(session);
      setShowFirstSessionDialog(true);
      return;
    }

    // Si c'est la 3ème séance (2 séances terminées avant), suggérer le bilan complet
    if (completedCount === 2) {
      setSessionToComplete(session);
      setShowProgressReportForm(true);
      return;
    }

    // Sinon, marquer simplement comme terminée
    completeSessionWithoutComment(session.id);
  }

  // Compléter la séance sans commentaire obligatoire
  function completeSessionWithoutComment(sessionId: string) {
    const updatedSessions = sessions.map(s => 
      s.id === sessionId ? { ...s, status: 'completed' } : s
    );
    setSessions(updatedSessions);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('mockSessions', JSON.stringify(updatedSessions));
  }

  // Compléter la séance et ouvrir le dialogue de commentaire (pour 1ère séance)
  function completeAndAddComment(session: any) {
    const updatedSessions = sessions.map(s => 
      s.id === session.id ? { ...s, status: 'completed' } : s
    );
    setSessions(updatedSessions);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('mockSessions', JSON.stringify(updatedSessions));
    
    setShowFirstSessionDialog(false);
    // Important: passer la session mise à jour avec le statut completed
    const completedSession = updatedSessions.find(s => s.id === session.id);
    setSelectedSessionForComment(completedSession);
    setSessionToComplete(null);
  }

  // Sauvegarder le bilan de progression et marquer la séance comme terminée
  function handleSaveProgressReport(reportData: any) {
    // Sauvegarder le rapport
    const existingReports = JSON.parse(localStorage.getItem('progressReports') || '[]');
    existingReports.push(reportData);
    localStorage.setItem('progressReports', JSON.stringify(existingReports));
    
    // Marquer la séance comme terminée avec référence au rapport
    const updatedSessions = sessions.map(s => 
      s.id === sessionToComplete?.id ? { ...s, status: 'completed', progressReportId: reportData.id } : s
    );
    setSessions(updatedSessions);
    localStorage.setItem('mockSessions', JSON.stringify(updatedSessions));
    
    // Fermer le dialogue
    setShowProgressReportForm(false);
    setSessionToComplete(null);
    
    alert('Bilan de progression enregistré avec succès ! Vous pouvez le consulter dans l\'onglet \"Bilans\".');
  }

  async function updateSessionStatus(sessionId: string, status: string) {
    try {
      // Simulation de mise à jour
      const updatedSessions = sessions.map(s => 
        s.id === sessionId ? { ...s, status } : s
      );
      setSessions(updatedSessions);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('mockSessions', JSON.stringify(updatedSessions));
      
      alert('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Erreur lors de la mise à jour');
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { label: string; variant: any }> = {
      pending: { label: 'En attente', variant: 'default' },
      confirmed: { label: 'Confirmée', variant: 'default' },
      completed: { label: 'Terminée', variant: 'secondary' },
      cancelled: { label: 'Annulée', variant: 'destructive' }
    };

    const config = variants[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  const filteredSessions = filter === 'all' 
    ? sessions 
    : sessions.filter(s => s.status === filter);

  if (loading) {
    return <div className="text-center py-8">Chargement des séances...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Mes séances</CardTitle>
              <CardDescription>
                Gérez vos cours et réservations
              </CardDescription>
            </div>
            {/* Bouton temporaire pour recharger les données mock */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={reloadMockData}
              className="text-xs"
            >
              🔄 Recharger les données
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="pending">En attente</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmées</TabsTrigger>
              <TabsTrigger value="completed">Terminées</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune séance trouvée
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {new Date(session.date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{new Date(session.date).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {role === 'student' 
                                ? `Tuteur: ${session.tutor?.name || session.tutorId}` 
                                : `Élève: ${session.student?.name || session.studentId}`}
                            </span>
                          </div>

                          <div>
                            <span className="text-sm font-medium">Matière: </span>
                            <span className="text-sm text-gray-600">{session.subject}</span>
                          </div>

                          {session.notes && (
                            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                              <span className="font-medium">Notes: </span>
                              {session.notes}
                            </div>
                          )}

                          {session.tutorComment && (
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="h-4 w-4" style={{ color: '#2E5CA8' }} />
                                <span className="font-medium" style={{ color: '#2E5CA8' }}>Commentaire du tuteur :</span>
                              </div>
                              <p style={{ color: '#2C3E50' }}>{session.tutorComment}</p>
                            </div>
                          )}

                          {/* Lien Zoom pour les séances confirmées */}
                          {session.status === 'confirmed' && session.zoomLink && (
                            <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                              <div className="flex items-center gap-2 mb-2">
                                <Video className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-600">Lien de cours en ligne</span>
                              </div>
                              <a 
                                href={session.zoomLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Rejoindre la séance Zoom
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            {getStatusBadge(session.status)}
                            <span className="text-sm text-gray-500">
                              Durée: {session.duration}h
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {role === 'tutor' && session.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateSessionStatus(session.id, 'confirmed')}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateSessionStatus(session.id, 'cancelled')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Refuser
                              </Button>
                            </>
                          )}
                          
                          {session.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm('Êtes-vous sûr de vouloir annuler cette séance?')) {
                                  updateSessionStatus(session.id, 'cancelled');
                                }
                              }}
                            >
                              Annuler
                            </Button>
                          )}
                          
                          {role === 'tutor' && session.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsCompleted(session)}
                            >
                              Marquer comme terminée
                            </Button>
                          )}
                          
                          {role === 'tutor' && session.status === 'completed' && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedSessionForComment(session)}
                            >
                              {session.tutorComment ? 'Modifier le commentaire' : 'Ajouter un commentaire'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogue pour ajouter/modifier un commentaire */}
      {selectedSessionForComment && (
        <QuickCommentDialog
          session={selectedSessionForComment}
          onClose={() => setSelectedSessionForComment(null)}
          onSuccess={fetchSessions}
          accessToken={accessToken}
        />
      )}

      {/* Dialogue pour la première séance - commentaire OBLIGATOIRE */}
      {showFirstSessionDialog && sessionToComplete && (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" style={{ color: '#E74C3C' }} />
                Première séance avec cet élève
              </DialogTitle>
              <DialogDescription>
                C'est votre première séance avec cet élève. Vous devez obligatoirement ajouter un commentaire pour la marquer comme terminée.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert style={{ backgroundColor: '#FFF3CD', borderColor: '#FFE69C' }}>
                <AlertCircle className="h-4 w-4" style={{ color: '#664D03' }} />
                <AlertDescription style={{ color: '#664D03' }}>
                  Le commentaire est obligatoire pour la première séance afin d'établir une base de suivi pour l'élève et les parents.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => completeAndAddComment(sessionToComplete)}
                  style={{ backgroundColor: '#2E5CA8', color: 'white' }}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ajouter un commentaire maintenant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFirstSessionDialog(false);
                    setSessionToComplete(null);
                  }}
                  className="w-full"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Formulaire de bilan de progression pour la 3ème séance */}
      {showProgressReportForm && sessionToComplete && (
        <Dialog open={true} onOpenChange={() => setShowProgressReportForm(false)}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
                Bilan de progression - 3ème séance
              </DialogTitle>
              <DialogDescription>
                Remplissez le bilan complet pour la 3ème séance avec {sessionToComplete.studentName}
              </DialogDescription>
            </DialogHeader>
            {tutorName ? (
              <ProgressReportForm
                session={sessionToComplete}
                tutorName={tutorName}
                onSave={handleSaveProgressReport}
                onCancel={() => {
                  if (confirm('Voulez-vous vraiment annuler ? Les données non sauvegardées seront perdues.')) {
                    setShowProgressReportForm(false);
                    setSessionToComplete(null);
                  }
                }}
              />
            ) : (
              <div className="p-4 text-center" style={{ color: '#E74C3C' }}>
                Erreur: Le nom du tuteur n'est pas disponible. Veuillez vous reconnecter.
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}