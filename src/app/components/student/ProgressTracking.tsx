import { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { getMockSessions } from '../../utils/mockData';
import { ProgressReportDialog } from './ProgressReportDialog';

interface ProgressTrackingProps {
  userId: string;
  accessToken: string;
}

export function ProgressTracking({ userId, accessToken }: ProgressTrackingProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      // Utilisation des données mock
      const data = await getMockSessions(userId, 'student');
      setSessions(data.filter((s: any) => s.status === 'completed'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des statistiques...</div>;
  }

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalHours = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  
  // Group by subject
  const subjectStats = completedSessions.reduce((acc: any, session) => {
    const subject = session.subject || 'Autre';
    if (!acc[subject]) {
      acc[subject] = { count: 0, hours: 0 };
    }
    acc[subject].count += 1;
    acc[subject].hours += session.duration || 0;
    return acc;
  }, {});

  const subjects = Object.entries(subjectStats).map(([name, stats]: any) => ({
    name,
    ...stats
  }));

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Séances complétées
            </CardDescription>
            <CardTitle className="text-3xl">{completedSessions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Sur {sessions.length} réservée{sessions.length > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Heures de cours
            </CardDescription>
            <CardTitle className="text-3xl">{totalHours}h</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Temps d'apprentissage total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Matières suivies
            </CardDescription>
            <CardTitle className="text-3xl">{subjects.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Domaines d'apprentissage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Taux de complétion
            </CardDescription>
            <CardTitle className="text-3xl">
              {sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0} 
              className="h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Subject Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Progression par matière</CardTitle>
          <CardDescription>
            Votre temps d'apprentissage réparti par matière
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune séance complétée pour le moment
            </div>
          ) : (
            <div className="space-y-6">
              {subjects
                .sort((a, b) => b.hours - a.hours)
                .map((subject) => (
                  <div key={subject.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{subject.name}</Badge>
                        <span className="text-sm text-gray-600">
                          {subject.count} séance{subject.count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{subject.hours}h</span>
                    </div>
                    <Progress 
                      value={(subject.hours / totalHours) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Séances récentes</CardTitle>
          <CardDescription>
            Vos derniers cours complétés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune séance complétée
            </div>
          ) : (
            <div className="space-y-4">
              {completedSessions
                .slice(0, 5)
                .map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{session.subject}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(session.date).toLocaleDateString('fr-FR')} • {session.duration}h
                      </div>
                    </div>
                    <Badge>Terminée</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Reports Section - Only shows after 3+ sessions with same tutor */}
      {(() => {
        // Group sessions by tutor and count
        const sessionsByTutor: Record<string, any[]> = {};
        completedSessions.forEach((session) => {
          const tutorId = session.tutorId;
          if (!sessionsByTutor[tutorId]) {
            sessionsByTutor[tutorId] = [];
          }
          sessionsByTutor[tutorId].push(session);
        });

        // Check if any tutor has 3+ sessions
        const hasEligibleReports = Object.values(sessionsByTutor).some(
          (sessions) => sessions.length >= 3
        );

        if (!hasEligibleReports) return null;

        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Rapports de progression
              </CardTitle>
              <CardDescription>
                Consultez vos rapports détaillés générés par vos tuteurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-900 mb-3">
                  Vous avez des rapports de progression disponibles! Ces rapports sont générés automatiquement après la 3ème séance avec un même tuteur.
                </p>
                <Button
                  onClick={() => setShowReportDialog(true)}
                  style={{ backgroundColor: '#2E5CA8' }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Voir mes rapports de progression
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Progress Report Dialog */}
      {showReportDialog && (
        <ProgressReportDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          sessions={completedSessions}
          userId={userId}
        />
      )}
    </div>
  );
}