import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, CheckCircle, DollarSign, FileText, User, BookOpen, Video } from 'lucide-react';
import { mockSessions, type Session } from '../utils/mockData';

interface TutorStats {
  tutorId: string;
  tutorName: string;
  completedSessions: Session[];
  upcomingSessions: Session[];
  totalHours: number;
  totalAmount: number;
  hourlyRate: number;
}

export function AdminSchedulePage() {
  const [selectedWeek, setSelectedWeek] = useState<'current' | 'last'>('current');
  const [tutorStats, setTutorStats] = useState<TutorStats[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    calculateTutorStats();
  }, [allSessions, selectedWeek]);

  const loadSessions = () => {
    // Charger les sessions depuis localStorage ou utiliser les données mock
    const storedSessions = localStorage.getItem('sessions');
    const sessions = storedSessions ? JSON.parse(storedSessions) : mockSessions;
    setAllSessions(sessions);
  };

  const getWeekRange = (isLastWeek: boolean = false) => {
    const now = new Date();
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Lundi de cette semaine
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff + (isLastWeek ? -7 : 0));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  };

  const calculateTutorStats = () => {
    const { monday, sunday } = getWeekRange(selectedWeek === 'last');
    
    const weekSessions = allSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= monday && sessionDate <= sunday;
    });

    const tutorMap = new Map<string, TutorStats>();

    weekSessions.forEach(session => {
      if (!tutorMap.has(session.tutorId)) {
        tutorMap.set(session.tutorId, {
          tutorId: session.tutorId,
          tutorName: session.tutorName,
          completedSessions: [],
          upcomingSessions: [],
          totalHours: 0,
          totalAmount: 0,
          hourlyRate: 55, // Taux par défaut, peut être personnalisé par tuteur
        });
      }

      const stats = tutorMap.get(session.tutorId)!;
      
      if (session.status === 'completed') {
        stats.completedSessions.push(session);
        stats.totalHours += session.duration;
        stats.totalAmount += session.duration * stats.hourlyRate;
      } else if (session.status === 'scheduled') {
        stats.upcomingSessions.push(session);
      }
    });

    setTutorStats(Array.from(tutorMap.values()));
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const generateInvoice = (tutor: TutorStats) => {
    const { monday, sunday } = getWeekRange(selectedWeek === 'last');
    
    const invoice = {
      invoiceNumber: `INV-${tutor.tutorId}-${Date.now()}`,
      tutorName: tutor.tutorName,
      tutorId: tutor.tutorId,
      weekStart: monday.toISOString(),
      weekEnd: sunday.toISOString(),
      sessions: tutor.completedSessions.map(s => ({
        date: s.date,
        time: s.time,
        duration: s.duration,
        student: s.studentName,
        subject: s.subject,
        amount: s.duration * tutor.hourlyRate
      })),
      totalHours: tutor.totalHours,
      hourlyRate: tutor.hourlyRate,
      totalAmount: tutor.totalAmount,
      generatedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Sauvegarder la facture
    const invoices = JSON.parse(localStorage.getItem('tutorInvoices') || '[]');
    invoices.push(invoice);
    localStorage.setItem('tutorInvoices', JSON.stringify(invoices));

    // Générer le contenu de la facture pour l'email
    const weekStart = monday.toLocaleDateString('fr-CA');
    const weekEnd = sunday.toLocaleDateString('fr-CA');
    
    const emailBody = `Bonjour ${tutor.tutorName},

Voici votre facture pour la semaine du ${weekStart} au ${weekEnd}.

Numéro de facture: ${invoice.invoiceNumber}
Période: ${weekStart} - ${weekEnd}

DÉTAIL DES SESSIONS:
${invoice.sessions.map((s, i) => `
${i + 1}. ${new Date(s.date).toLocaleDateString('fr-CA')} à ${s.time}
   Élève: ${s.student}
   Matière: ${s.subject}
   Durée: ${s.duration}h @ ${tutor.hourlyRate}$/h
   Montant: ${s.amount.toFixed(2)}$`).join('\n')}

RÉCAPITULATIF:
Nombre de sessions: ${invoice.sessions.length}
Heures totales: ${tutor.totalHours.toFixed(1)}h
Taux horaire: ${tutor.hourlyRate.toFixed(2)}$/h

MONTANT TOTAL: ${tutor.totalAmount.toFixed(2)}$

Le paiement sera effectué dans les prochains jours.

Merci de votre excellent travail !

Cordialement,
L'équipe Tuto-Succès B&D
tutosuccesbd@gmail.com
514-651-2401`;

    // Trouver l'email du tuteur
    const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const tutorUser = users.find((u: any) => u.id === tutor.tutorId);
    const tutorEmail = tutorUser?.email || '';

    // Ouvrir le client email avec le contenu pré-rempli
    const subject = encodeURIComponent(`Facture ${invoice.invoiceNumber} - Tuto-Succès B&D`);
    const body = encodeURIComponent(emailBody);
    window.location.href = `mailto:${tutorEmail}?subject=${subject}&body=${body}`;

    alert(`Facture générée pour ${tutor.tutorName}\nMontant total: ${tutor.totalAmount.toFixed(2)}$\n\nUn email va être envoyé au tuteur.`);
  };

  const { monday, sunday } = getWeekRange(selectedWeek === 'last');
  const totalWeeklyAmount = tutorStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
  const totalWeeklyHours = tutorStats.reduce((sum, stat) => sum + stat.totalHours, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
          Calendrier et Facturation
        </h2>
        <p style={{ color: '#7F8C8D' }}>
          Gérez les sessions de tutorat et générez les factures hebdomadaires
        </p>
      </div>

      {/* Sélecteur de semaine */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                variant={selectedWeek === 'current' ? 'default' : 'outline'}
                onClick={() => setSelectedWeek('current')}
                style={selectedWeek === 'current' ? { backgroundColor: '#2E5CA8', color: 'white' } : {}}
              >
                Semaine actuelle
              </Button>
              <Button
                variant={selectedWeek === 'last' ? 'default' : 'outline'}
                onClick={() => setSelectedWeek('last')}
                style={selectedWeek === 'last' ? { backgroundColor: '#2E5CA8', color: 'white' } : {}}
              >
                Semaine dernière
              </Button>
            </div>
            <div className="text-right">
              <p className="text-sm" style={{ color: '#7F8C8D' }}>
                {monday.toLocaleDateString('fr-CA')} - {sunday.toLocaleDateString('fr-CA')}
              </p>
            </div>
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
                  {tutorStats.reduce((sum, stat) => sum + stat.completedSessions.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des tuteurs et sessions */}
      {tutorStats.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: '#7F8C8D' }} />
            <p className="text-lg" style={{ color: '#7F8C8D' }}>
              Aucune session pour cette semaine
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {tutorStats.map((tutor) => (
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
                    <CardDescription className="mt-2">
                      {tutor.completedSessions.length} session(s) complétée(s) • {tutor.upcomingSessions.length} à venir
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                      {tutor.totalAmount.toFixed(2)}$
                    </p>
                    <p className="text-sm" style={{ color: '#7F8C8D' }}>
                      {tutor.totalHours.toFixed(1)} heures @ {tutor.hourlyRate}$/h
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sessions complétées */}
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
                                  {session.subject} - {session.studentName}
                                </p>
                                <p className="text-sm" style={{ color: '#7F8C8D' }}>
                                  {formatDate(session.date)} à {formatTime(session.time)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold" style={{ color: '#E74C3C' }}>
                              {(session.duration * tutor.hourlyRate).toFixed(2)}$
                            </p>
                            <p className="text-sm" style={{ color: '#7F8C8D' }}>
                              {session.duration}h
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sessions à venir */}
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
                                {session.subject} - {session.studentName}
                              </p>
                              <p className="text-sm" style={{ color: '#7F8C8D' }}>
                                {formatDate(session.date)} à {formatTime(session.time)}
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

                {/* Actions */}
                {tutor.completedSessions.length > 0 && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => generateInvoice(tutor)}
                      className="flex-1"
                      style={{ backgroundColor: '#E74C3C', color: 'white' }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Générer la facture ({tutor.totalAmount.toFixed(2)}$)
                    </Button>
                    <Button
                      variant="outline"
                      style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                      onClick={() => {
                        alert('Intégration Stripe à venir pour le paiement automatique');
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Marquer comme payé
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