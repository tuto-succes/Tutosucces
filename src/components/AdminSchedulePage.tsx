import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, CheckCircle, DollarSign, User, BookOpen, Video, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { supabase } from '../app/core/supabase.client';

interface SessionRow {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  total_price: number;
  status: string;
  payment_status: string;
  completed_at: string | null;
  studentName: string;
}

interface TutorStats {
  tutorId: string;
  tutorName: string;
  tutorEmail: string;
  completedSessions: SessionRow[];
  upcomingSessions: SessionRow[];
  totalHours: number;
  totalAmount: number;
}

// Returns the Monday of the week containing the given date
function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const STORAGE_KEY = 'invoiced_tutors_by_week';

function getStoredInvoiced(weekKey: string): Set<string> {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return new Set(all[weekKey] ?? []);
  } catch {
    return new Set();
  }
}

function saveInvoiced(weekKey: string, ids: Set<string>) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    all[weekKey] = [...ids];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export function AdminSchedulePage() {
  // weekOffset: 0 = current week, -1 = last week, -2 = 2 weeks ago, +1 = next week, etc.
  const [weekOffset, setWeekOffset] = useState(0);
  const [tutorStats, setTutorStats] = useState<TutorStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoicedTutorIds, setInvoicedTutorIds] = useState<Set<string>>(new Set());

  const getWeekRange = (offset: number = 0) => {
    const now = new Date();
    const monday = getMondayOf(now);
    monday.setDate(monday.getDate() + offset * 7);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  };

  const weekKey = (offset: number) => {
    const { monday } = getWeekRange(offset);
    return monday.toISOString().split('T')[0];
  };

  useEffect(() => {
    setInvoicedTutorIds(getStoredInvoiced(weekKey(weekOffset)));
    loadSessions();
  }, [weekOffset]);

  const loadSessions = async () => {
    setLoading(true);
    const { monday, sunday } = getWeekRange(weekOffset);
    const dateFrom = monday.toISOString().split('T')[0];
    const dateTo = sunday.toISOString().split('T')[0];

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, student_id, tutor_id, subject, session_date, start_time, duration_minutes, total_price, payment_status, completed_at, status')
      .gte('session_date', dateFrom)
      .lte('session_date', dateTo)
      .order('session_date', { ascending: true });

    if (error) {
      console.error('Erreur chargement sessions:', error);
      setLoading(false);
      return;
    }

    if (!sessions || sessions.length === 0) {
      setTutorStats([]);
      setLoading(false);
      return;
    }

    const tutorIds = [...new Set(sessions.map((s: any) => s.tutor_id))];
    const studentIds = [...new Set(sessions.map((s: any) => s.student_id))];
    const profileIds = [...new Set([...tutorIds, ...studentIds])];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', profileIds);

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });

    const tutorMap = new Map<string, TutorStats>();

    (sessions as any[]).forEach(session => {
      const tutorProfile = profileMap[session.tutor_id] || {};
      const studentProfile = profileMap[session.student_id] || {};
      const duration = (session.duration_minutes || 0) / 60;

      if (!tutorMap.has(session.tutor_id)) {
        tutorMap.set(session.tutor_id, {
          tutorId: session.tutor_id,
          tutorName: tutorProfile.name || 'Tuteur',
          tutorEmail: tutorProfile.email || '',
          completedSessions: [],
          upcomingSessions: [],
          totalHours: 0,
          totalAmount: 0,
        });
      }

      const TUTOR_RATE = 30; // Le tuteur reçoit toujours 30$/h

      const stats = tutorMap.get(session.tutor_id)!;
      const sessionWithName: SessionRow = { ...session, studentName: studentProfile.name || 'Élève' };

      if (session.status === 'completed') {
        stats.completedSessions.push(sessionWithName);
        stats.totalHours += duration;
        stats.totalAmount += duration * TUTOR_RATE; // Montant versé au tuteur
      } else {
        stats.upcomingSessions.push(sessionWithName);
      }
    });

    setTutorStats(Array.from(tutorMap.values()));
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const formatWeekLabel = () => {
    if (weekOffset === 0) return 'Semaine actuelle';
    if (weekOffset === -1) return 'Semaine dernière';
    if (weekOffset === 1) return 'Semaine prochaine';
    if (weekOffset < 0) return `Il y a ${Math.abs(weekOffset)} semaines`;
    return `Dans ${weekOffset} semaines`;
  };

  const generateInvoice = async (tutor: TutorStats) => {
    const { monday, sunday } = getWeekRange(weekOffset);
    const weekStart = monday.toLocaleDateString('fr-CA');
    const weekEnd = sunday.toLocaleDateString('fr-CA');
    const periodStart = monday.toISOString().split('T')[0];
    const periodEnd = sunday.toISOString().split('T')[0];

    const TUTOR_RATE = 30;
    const invoiceNumber = `INV-${tutor.tutorId.slice(0, 8).toUpperCase()}-${periodStart.replace(/-/g, '')}`;

    // 1. Sauvegarder dans tutor_payouts (status = 'paid' car c'est déjà versé)
    const { error } = await supabase.from('tutor_payouts').insert({
      tutor_id: tutor.tutorId,
      amount: tutor.totalAmount,
      period_start: periodStart,
      period_end: periodEnd,
      session_ids: tutor.completedSessions.map(s => s.id),
      status: 'paid',
      paid_at: new Date().toISOString(),
      notes: `Fiche ${invoiceNumber} — ${tutor.completedSessions.length} séance(s) · ${tutor.totalHours.toFixed(1)}h`,
    });

    if (error) {
      console.error('Erreur création fiche de paie:', error);
      alert(`Erreur: impossible de créer la fiche de paie — ${error.message}`);
      return;
    }

    // 2. Envoyer l'email
    const emailBody = `Bonjour ${tutor.tutorName},\n\nVoici votre fiche de paie pour la semaine du ${weekStart} au ${weekEnd}.\n\nNuméro: ${invoiceNumber}\nPériode: ${weekStart} — ${weekEnd}\nTaux horaire: ${TUTOR_RATE}$/h\n\nDÉTAIL DES SESSIONS:\n${
      tutor.completedSessions.map((s, i) => {
        const hours = ((s.duration_minutes || 0) / 60);
        const pay = (hours * TUTOR_RATE).toFixed(2);
        return `\n${i + 1}. ${new Date(s.session_date).toLocaleDateString('fr-CA')} à ${s.start_time}\n   Élève : ${s.studentName}\n   Matière : ${s.subject}\n   Durée : ${hours.toFixed(1)}h × ${TUTOR_RATE}$/h = ${pay}$`;
      }).join('\n')
    }\n\nRÉCAPITULATIF:\nNombre de sessions : ${tutor.completedSessions.length}\nHeures totales : ${tutor.totalHours.toFixed(1)}h\nTaux horaire : ${TUTOR_RATE}$/h\n\nMONTANT TOTAL : ${tutor.totalAmount.toFixed(2)}$\n\nMerci de votre excellent travail !\n\nCordialement,\nL'équipe Tuto-Succès B&D\ntutosuccesbd@gmail.com\n514-651-2401`;

    const subject = encodeURIComponent(`Fiche de paie ${invoiceNumber} — Semaine du ${weekStart} | Tuto-Succès B&D`);
    const body = encodeURIComponent(emailBody);
    window.location.href = `mailto:${tutor.tutorEmail}?subject=${subject}&body=${body}`;

    // 3. Retirer de la liste locale
    setInvoicedTutorIds(prev => {
      const next = new Set([...prev, tutor.tutorId]);
      saveInvoiced(weekKey(weekOffset), next);
      return next;
    });
  };

  const { monday, sunday } = getWeekRange(weekOffset);
  const visibleStats = tutorStats.filter(t => !invoicedTutorIds.has(t.tutorId));
  const totalWeeklyAmount = visibleStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
  const totalWeeklyHours = visibleStats.reduce((sum, stat) => sum + stat.totalHours, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
          Calendrier et Facturation
        </h2>
        <p style={{ color: '#7F8C8D' }}>
          Gérez les sessions de tutorat et envoyez les factures hebdomadaires aux tuteurs
        </p>
      </div>

      {/* Sélecteur de semaine */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset(w => w - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 text-center">
              <p className="font-semibold text-base" style={{ color: '#2C3E50' }}>
                {formatWeekLabel()}
              </p>
              <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
                {monday.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })} — {sunday.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset(w => w + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {weekOffset !== 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(0)}
                style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
              >
                Aujourd'hui
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques hebdomadaires */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#E8F4F8' }}>
                <Clock className="h-6 w-6" style={{ color: '#2E5CA8' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>Heures totales</p>
                <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                  {totalWeeklyHours.toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                <DollarSign className="h-6 w-6" style={{ color: '#E74C3C' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>Montant total</p>
                <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                  {totalWeeklyAmount.toFixed(2)}$
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                <CheckCircle className="h-6 w-6" style={{ color: '#10b981' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>Sessions complétées</p>
                <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                  {visibleStats.reduce((sum, stat) => sum + stat.completedSessions.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tuteurs facturés dans cette session */}
      {invoicedTutorIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
          <CheckCircle className="h-5 w-5" style={{ color: '#10b981' }} />
          <p className="text-sm font-medium" style={{ color: '#10b981' }}>
            {invoicedTutorIds.size} facture(s) envoyée(s) — les tuteurs concernés ont été retirés de la liste
          </p>
        </div>
      )}

      {/* Liste des tuteurs */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p style={{ color: '#7F8C8D' }}>Chargement des sessions...</p>
          </CardContent>
        </Card>
      ) : visibleStats.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: '#7F8C8D' }} />
            <p className="text-lg" style={{ color: '#7F8C8D' }}>
              {tutorStats.length > 0
                ? 'Toutes les factures de cette semaine ont été envoyées'
                : 'Aucune session pour cette semaine'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {visibleStats.map((tutor) => (
            <Card key={tutor.tutorId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle style={{ color: '#2C3E50' }}>
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        {tutor.tutorName}
                      </div>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {tutor.tutorEmail}
                    </CardDescription>
                    <CardDescription className="mt-1">
                      {tutor.completedSessions.length} session(s) complétée(s) • {tutor.upcomingSessions.length} à venir
                    </CardDescription>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                      {tutor.totalAmount.toFixed(2)}$ <span className="text-sm font-normal text-gray-500">versé tuteur</span>
                    </p>
                    <p className="text-sm" style={{ color: '#7F8C8D' }}>
                      {tutor.totalHours.toFixed(1)}h × 30$/h
                    </p>
                    <p className="text-xs text-green-600">
                      Encaissé élèves : {tutor.completedSessions.reduce((s, x) => s + (x.total_price || 0), 0).toFixed(2)}$
                    </p>
                    <p className="text-xs text-blue-600">
                      Marge compagnie : {(tutor.completedSessions.reduce((s, x) => s + (x.total_price || 0), 0) - tutor.totalAmount).toFixed(2)}$
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tutor.completedSessions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                      <CheckCircle className="h-4 w-4" style={{ color: '#10b981' }} />
                      Sessions complétées
                    </h4>
                    <div className="space-y-2">
                      {tutor.completedSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: '#F8F9FA' }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-4 w-4" style={{ color: '#2E5CA8' }} />
                              <div>
                                <p className="font-medium" style={{ color: '#2C3E50' }}>
                                  {session.subject} — {session.studentName}
                                </p>
                                <p className="text-sm" style={{ color: '#7F8C8D' }}>
                                  {formatDate(session.session_date)} à {session.start_time}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold" style={{ color: '#E74C3C' }}>
                              {Number(session.total_price || 0).toFixed(2)}$
                            </p>
                            <p className="text-sm" style={{ color: '#7F8C8D' }}>
                              {((session.duration_minutes || 0) / 60).toFixed(1)}h
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tutor.upcomingSessions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                      <Calendar className="h-4 w-4" style={{ color: '#2E5CA8' }} />
                      Sessions à venir
                    </h4>
                    <div className="space-y-2">
                      {tutor.upcomingSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          style={{ borderColor: '#E0E0E0' }}
                        >
                          <div className="flex items-center gap-3">
                            <Video className="h-4 w-4" style={{ color: '#2E5CA8' }} />
                            <div>
                              <p className="font-medium" style={{ color: '#2C3E50' }}>
                                {session.subject} — {session.studentName}
                              </p>
                              <p className="text-sm" style={{ color: '#7F8C8D' }}>
                                {formatDate(session.session_date)} à {session.start_time}
                              </p>
                            </div>
                          </div>
                          <Badge style={{ backgroundColor: '#2E5CA8', color: 'white' }}>
                            Planifiée
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tutor.completedSessions.length > 0 && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => generateInvoice(tutor)}
                      className="flex-1"
                      style={{ backgroundColor: '#E74C3C', color: 'white' }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer la fiche de paie du tuteur ({tutor.totalAmount.toFixed(2)}$)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
