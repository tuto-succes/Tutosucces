import { useState, useEffect } from 'react';
import { Calendar, Clock, User, X, Check, MessageSquare, FileText, Video, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { QuickCommentDialog } from '../tutor/QuickCommentDialog';
import { ProgressReportForm } from '../tutor/ProgressReportForm';
import { getMockSessions } from '../../utils/mockData';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { supabase } from '../../app/core/supabase.client';
import { ensureInvoiceForCompletedSession } from '../../utils/invoiceHelpers';

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
  const [showProgressReportForm, setShowProgressReportForm] = useState(false);
  const [sessionToComplete, setSessionToComplete] = useState<any>(null);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    sessionDate: '',
    startTime: '',
    endTime: '',
    subject: '',
    notes: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSlots, setEditSlots] = useState<string[]>([]);
  const [loadingEditSlots, setLoadingEditSlots] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!editingSession || !editForm.sessionDate) {
      setEditSlots([]);
      return;
    }

    loadEditSlots(editingSession, editForm.sessionDate);
  }, [editingSession, editForm.sessionDate]);

  async function fetchSessions() {
    try {
      // Récupérer les séances depuis Supabase pour cet étudiant
      const query = supabase
        .from('sessions')
        .select(`
          id,
          subject,
          level,
          session_date,
          start_time,
          end_time,
          status,
          total_price,
          meeting_link,
          meeting_password,
          student_notes,
          tutor_notes,
          student_id,
          tutor_id,
          created_at,
          confirmed_at,
          completed_at,
          cancelled_at
        `)
        .order('session_date', { ascending: false });

      if (role === 'tutor') {
        query.eq('tutor_id', userId);
      } else {
        query.eq('student_id', userId);
      }

      const { data: dbSessions, error } = await query;

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      // Récupérer les noms des autres participants
      const otherIds = [...new Set((dbSessions || []).map((s: any) =>
        role === 'tutor' ? s.student_id : s.tutor_id
      ))];
      const { data: profiles } = otherIds.length > 0
        ? await supabase.from('profiles').select('id, name, email').in('id', otherIds)
        : { data: [] };
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });

      const sessionIds = (dbSessions || []).map((session: any) => session.id);
      const { data: sessionComments } = sessionIds.length > 0
        ? await supabase
            .from('session_comments')
            .select('session_id, author_id, author_role, comment')
            .in('session_id', sessionIds)
            .eq('author_role', 'tutor')
        : { data: [] };
      const tutorCommentMap: Record<string, string> = {};
      (sessionComments || []).forEach((commentRow: any) => {
        if (commentRow.session_id && !tutorCommentMap[commentRow.session_id]) {
          tutorCommentMap[commentRow.session_id] = commentRow.comment;
        }
      });

      // Convertir le format de la base de données au format UI
      const formattedSessions = (dbSessions || []).map((session: any) => {
        const otherId = role === 'tutor' ? session.student_id : session.tutor_id;
        const otherProfile = profileMap[otherId];
        return {
          id: session.id,
          studentId: session.student_id,
          tutorId: session.tutor_id,
          studentName: role === 'tutor' ? (otherProfile?.name || 'Élève') : 'Vous',
          tutor: {
            name: role === 'student' ? (otherProfile?.name || 'Tuteur') : tutorName,
            email: otherProfile?.email,
            id: session.tutor_id
          },
          tutorName: role === 'student' ? (otherProfile?.name || 'Tuteur') : tutorName,
          subject: session.subject,
          level: session.level,
          date: new Date(`${session.session_date}T${session.start_time}`),
          duration: Math.round((new Date(`2000-01-01T${session.end_time}`).getTime() - new Date(`2000-01-01T${session.start_time}`).getTime()) / (1000 * 60 * 60) * 10) / 10,
          status: session.status,
          notes: session.student_notes,
          tutorComment: tutorCommentMap[session.id] || session.tutor_notes,
          zoomLink: session.meeting_link,
          zoomPassword: session.meeting_password,
          price: session.total_price,
          createdAt: session.created_at
        };
      });

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Fallback aux données mock en cas d'erreur
      const data = await getMockSessions(userId, role);
      setSessions(data);
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
  function countCompletedSessionsWithStudent(studentId: string, tutorId: string, currentSessionId: string): number {
    return sessions.filter(s => 
      s.studentId === studentId && 
      s.tutorId === tutorId &&
      s.status === 'completed' && 
      s.id !== currentSessionId
    ).length;
  }

  function shouldRequireProgressReport(session: any): boolean {
    const completedCount = countCompletedSessionsWithStudent(session.studentId, session.tutorId, session.id);
    return completedCount >= 4;
  }

  function getSessionStart(session: any) {
    return new Date(session.date);
  }

  function hasSessionStarted(session: any) {
    return new Date() >= getSessionStart(session);
  }

  function canStudentManagePendingSession(session: any) {
    const msUntilSession = getSessionStart(session).getTime() - Date.now();
    return role === 'student' && session.status === 'pending' && msUntilSession > 24 * 60 * 60 * 1000;
  }

  function canStudentCancelConfirmedSession(session: any) {
    const msUntilSession = getSessionStart(session).getTime() - Date.now();
    return role === 'student' && session.status === 'confirmed' && msUntilSession > 24 * 60 * 60 * 1000;
  }

  function openEditSessionDialog(session: any) {
    const startDate = getSessionStart(session);
    const endDate = new Date(startDate.getTime() + session.duration * 60 * 60 * 1000);

    setEditingSession(session);
    setEditForm({
      sessionDate: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      subject: session.subject || '',
      notes: session.notes || '',
    });
  }

  function computeEndTimeFromDuration(startTime: string, durationHours: number) {
    const startDate = new Date(`2000-01-01T${startTime}`);
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
    return endDate.toTimeString().slice(0, 5);
  }

  function formatEditSlotLabel(startTime: string, durationHours: number) {
    const endTime = computeEndTimeFromDuration(startTime, durationHours);
    return `${startTime} - ${endTime}`;
  }

  async function loadEditSlots(session: any, sessionDate: string) {
    setLoadingEditSlots(true);

    const selectedDate = new Date(`${sessionDate}T12:00:00`);
    const dayOfWeek = selectedDate.getDay();

    const { data: availabilityRows, error } = await supabase
      .from('tutor_availability')
      .select('start_time, end_time')
      .eq('tutor_id', session.tutorId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    if (error) {
      console.error('Error loading tutor availability for edit:', error);
      setEditSlots([]);
      setLoadingEditSlots(false);
      return;
    }

    const durationMinutes = Math.round(session.duration * 60);
    const generatedSlots: string[] = [];

    (availabilityRows || []).forEach((slot: any) => {
      const [startHour, startMinute] = slot.start_time.split(':').map(Number);
      const [endHour, endMinute] = slot.end_time.split(':').map(Number);
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      let current = startTotalMinutes;
      while (current + durationMinutes <= endTotalMinutes) {
        const hours = String(Math.floor(current / 60)).padStart(2, '0');
        const minutes = String(current % 60).padStart(2, '0');
        generatedSlots.push(`${hours}:${minutes}`);
        current += 60;
      }
    });

    const uniqueSlots = Array.from(new Set(generatedSlots)).sort();
    setEditSlots(uniqueSlots);

    if (!uniqueSlots.includes(editForm.startTime)) {
      setEditForm((prev) => ({
        ...prev,
        startTime: '',
        endTime: '',
      }));
    }

    setLoadingEditSlots(false);
  }

  // Fonction pour marquer une séance comme terminée
  async function handleMarkAsCompleted(session: any) {
    if (role !== 'tutor') return;

    if (shouldRequireProgressReport(session)) {
      setSessionToComplete(session);
      setShowProgressReportForm(true);
      return;
    }

    setSessionToComplete(session);
    setSelectedSessionForComment({ ...session, completionRequired: true });
  }

  async function handleCompletionCommentSaved() {
    if (!sessionToComplete) {
      return;
    }

    await updateSessionStatus(sessionToComplete.id, 'completed');
    setSessionToComplete(null);
  }

  // Sauvegarder le bilan de progression et marquer la séance comme terminée
  async function handleSaveProgressReport(reportData: any) {
    if (!sessionToComplete) {
      return;
    }

    const sessionNumber = countCompletedSessionsWithStudent(sessionToComplete.studentId, sessionToComplete.tutorId, sessionToComplete.id) + 1;

    const { error } = await supabase
      .from('progress_reports')
      .insert({
        student_id: sessionToComplete.studentId,
        tutor_id: sessionToComplete.tutorId,
        session_id: sessionToComplete.id,
        subject: sessionToComplete.subject,
        session_number: sessionNumber,
        understanding_level: reportData.comprehensionLevel,
        participation_level: reportData.motivationLevel,
        homework_completion: reportData.organizationLevel,
        progress_since_last: reportData.autonomyLevel,
        strengths: reportData.strengths,
        areas_to_improve: reportData.areasToImprove,
        topics_covered: [reportData.objective1, reportData.objective2, reportData.objective3, reportData.progressDescription]
          .filter(Boolean)
          .join('\n\n'),
        homework_assigned: reportData.workPlan || null,
        next_session_goals: [reportData.strategy1, reportData.strategy2, reportData.strategy3]
          .filter(Boolean)
          .join('\n'),
        tutor_comments: [reportData.participationComment, reportData.parentHelp, reportData.finalComment]
          .filter(Boolean)
          .join('\n\n'),
      });

    if (error) {
      console.error('Error saving progress report:', error);
      alert('Le bilan n a pas pu etre enregistre.');
      return;
    }

    await updateSessionStatus(sessionToComplete.id, 'completed');

    setShowProgressReportForm(false);
    setSessionToComplete(null);

    alert('Bilan de progression enregistre avec succes. Vous pouvez maintenant le consulter dans l onglet Bilans.');
  }

  async function updateSessionStatus(sessionId: string, status: string) {
    const updates: Record<string, any> = { status };
    if (status === 'completed') {
      updates.payment_status = 'pending';
    }

    const { error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session:', error);
      alert('Erreur lors de la mise à jour');
      return;
    }

    // Recharger la session pour récupérer meeting_link généré par le trigger
    const { data: updated } = await supabase
      .from('sessions')
      .select('id, status, meeting_link, meeting_password, confirmed_at, completed_at, payment_status, student_id, tutor_id, total_price, duration_minutes, subject')
      .eq('id', sessionId)
      .single();

    if (updated) {
      if (status === 'completed') {
        try {
          await ensureInvoiceForCompletedSession(updated);
        } catch (invoiceError) {
          console.warn('Facture/paiement en attente non cree:', invoiceError);
        }
      }

      setSessions(prev => prev.map(s =>
        s.id === sessionId
          ? { ...s, status: updated.status, zoomLink: updated.meeting_link, zoomPassword: updated.meeting_password }
          : s
      ));
    }
  }

  async function saveSessionEdit() {
    if (!editingSession) {
      return;
    }

    if (!editForm.sessionDate || !editForm.startTime || !editForm.subject.trim()) {
      alert('Veuillez remplir la date, le créneau et la matière.');
      return;
    }

    setSavingEdit(true);

    const computedEndTime = computeEndTimeFromDuration(editForm.startTime, editingSession.duration);

    const { error } = await supabase
      .from('sessions')
      .update({
        session_date: editForm.sessionDate,
        start_time: editForm.startTime,
        end_time: computedEndTime,
        subject: editForm.subject.trim(),
        student_notes: editForm.notes.trim(),
      })
      .eq('id', editingSession.id);

    if (error) {
      console.error('Error updating pending session:', error);
      alert("La modification n'a pas pu être enregistrée. Vérifiez que le créneau est encore disponible.");
      setSavingEdit(false);
      return;
    }

    const startDate = new Date(`${editForm.sessionDate}T${editForm.startTime}`);
    const endDate = new Date(`${editForm.sessionDate}T${computedEndTime}`);

    await supabase.from('session_modifications').insert({
      session_id: editingSession.id,
      modified_by: userId,
      modification_type: 'reschedule',
      old_date: editingSession.date.toISOString().split('T')[0],
      old_start_time: editingSession.date.toTimeString().slice(0, 5),
      old_end_time: new Date(editingSession.date.getTime() + editingSession.duration * 60 * 60 * 1000).toTimeString().slice(0, 5),
      new_date: editForm.sessionDate,
      new_start_time: editForm.startTime,
      new_end_time: computedEndTime,
      reason: 'Modification par l élève avant 24h',
    });

    setSessions((prev) =>
      prev.map((session) =>
        session.id === editingSession.id
          ? {
              ...session,
              subject: editForm.subject.trim(),
              notes: editForm.notes.trim(),
              date: startDate,
              duration: Math.round(((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)) * 10) / 10,
            }
          : session
      )
    );

    setSavingEdit(false);
    setEditingSession(null);
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
                                ? `Tuteur: ${session.tutorName}`
                                : `Élève: ${session.studentName}`}
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

                          {/* Commentaire tuteur — uniquement sur les séances terminées */}
                          {session.status === 'completed' && (
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" style={{ color: '#2E5CA8' }} />
                                  <span className="font-medium" style={{ color: '#2E5CA8' }}>Commentaire du tuteur</span>
                                </div>
                                {role === 'tutor' && (
                                  <button
                                    onClick={() => setSelectedSessionForComment(session)}
                                    className="text-xs text-blue-500 hover:underline"
                                  >
                                    {session.tutorComment ? 'Modifier' : 'Ajouter'}
                                  </button>
                                )}
                              </div>
                              {session.tutorComment
                                ? <p style={{ color: '#2C3E50' }}>{session.tutorComment}</p>
                                : <p className="text-gray-400 italic">Aucun commentaire pour l'instant.</p>
                              }
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
                          
                          {role === 'student' && canStudentManagePendingSession(session) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditSessionDialog(session)}
                              >
                                Modifier
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm('Êtes-vous sûr de vouloir annuler cette séance ?')) {
                                    updateSessionStatus(session.id, 'cancelled');
                                  }
                                }}
                              >
                                Annuler
                              </Button>
                            </>
                          )}

                          {role === 'student' && session.status === 'pending' && !canStudentManagePendingSession(session) && (
                            <span className="text-xs text-gray-500">
                              Modification et annulation fermées à moins de 24h
                            </span>
                          )}

                          {canStudentCancelConfirmedSession(session) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm('Êtes-vous sûr de vouloir annuler cette séance ?')) {
                                  updateSessionStatus(session.id, 'cancelled');
                                }
                              }}
                            >
                              Annuler
                            </Button>
                          )}

                          {role === 'student' && session.status === 'confirmed' && !canStudentCancelConfirmedSession(session) && (
                            <span className="text-xs text-gray-500">
                              Annulation fermée à moins de 24h
                            </span>
                          )}

                          {role !== 'student' && session.status === 'confirmed' && (
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
                              disabled={!hasSessionStarted(session)}
                              title={!hasSessionStarted(session) ? 'Disponible seulement quand la séance a commencé' : undefined}
                            >
                              Marquer comme terminée
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
          onClose={() => {
            setSelectedSessionForComment(null);
            if (selectedSessionForComment.completionRequired) {
              setSessionToComplete(null);
            }
          }}
          onSuccess={fetchSessions}
          onSaved={selectedSessionForComment.completionRequired ? handleCompletionCommentSaved : undefined}
          completionRequired={Boolean(selectedSessionForComment.completionRequired)}
          accessToken={accessToken}
        />
      )}

      {editingSession && (
        <Dialog open={true} onOpenChange={() => !savingEdit && setEditingSession(null)}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Modifier la séance</DialogTitle>
              <DialogDescription>
                Vous pouvez modifier une séance en attente à plus de 24h, selon les disponibilités du tuteur.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
                  <input
                    type="date"
                    value={editForm.sessionDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, sessionDate: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Matière</label>
                  <input
                    type="text"
                    value={editForm.subject}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Créneau disponible</label>
                {loadingEditSlots && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    Chargement des créneaux...
                  </div>
                )}
                {!loadingEditSlots && !editForm.sessionDate && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    Choisissez une date pour voir les créneaux disponibles.
                  </div>
                )}
                {!loadingEditSlots && editForm.sessionDate && editSlots.length === 0 && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
                    Aucun créneau disponible pour cette date.
                  </div>
                )}
                {!loadingEditSlots && editSlots.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {editSlots.map((slot) => {
                      const active = editForm.startTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              startTime: slot,
                              endTime: computeEndTimeFromDuration(slot, editingSession.duration),
                            }))
                          }
                          className={[
                            'rounded-lg border px-3 py-3 text-sm font-medium transition-colors',
                            active
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50',
                          ].join(' ')}
                        >
                          {formatEditSlotLabel(slot, editingSession.duration)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Début choisi</label>
                  <div className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {editForm.startTime || 'Non choisi'}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Fin calculée</label>
                  <div className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {editForm.endTime || 'Non choisie'}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSession(null)} disabled={savingEdit}>
                Fermer
              </Button>
              <Button onClick={saveSessionEdit} disabled={savingEdit}>
                {savingEdit ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Formulaire de bilan de progression a partir de la 5eme seance */}
      {showProgressReportForm && sessionToComplete && (
        <Dialog open={true} onOpenChange={() => setShowProgressReportForm(false)}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
                Bilan de progression - 5eme seance
              </DialogTitle>
              <DialogDescription>
                Remplissez le bilan complet apres la 5eme seance avec {sessionToComplete.studentName}
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
