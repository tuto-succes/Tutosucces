import { useState, useEffect } from 'react';
import { FileText, Calendar, User, Star, TrendingUp, ChevronDown, ChevronUp, Smile, Meh, Frown, AlertCircle, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { getMockSessions } from '../../utils/mockData';

interface ProgressReportsProps {
  userId: string;
  accessToken: string;
}

export function ProgressReports({ userId, accessToken }: ProgressReportsProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const allSessions = await getMockSessions(userId, 'student');
      // Filtrer uniquement les séances complétées avec des bilans
      const sessionsWithReports = allSessions.filter(
        s => s.status === 'completed' && s.tutorComment
      );
      setSessions(sessionsWithReports);
    } catch (error) {
      console.error('Error fetching progress reports:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des bilans...</div>;
  }

  // Grouper les bilans par tuteur
  const reportsByTutor: Record<string, any[]> = {};
  sessions.forEach(session => {
    if (!reportsByTutor[session.tutorName]) {
      reportsByTutor[session.tutorName] = [];
    }
    reportsByTutor[session.tutorName].push(session);
  });

  // Calculer les statistiques globales
  const totalReports = sessions.length;
  const averageRating = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.length
    : 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
          Mes bilans de progression
        </h2>
        <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
          Consultez les bilans rédigés par vos tuteurs après chaque séance
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de bilans</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#2E5CA8' }}>
              {totalReports}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <FileText className="h-4 w-4" />
              Bilans reçus
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Évaluation moyenne</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#F39C12' }}>
              {averageRating.toFixed(1)}/5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-4 w-4"
                  fill={star <= averageRating ? '#F39C12' : 'none'}
                  style={{ color: '#F39C12' }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tuteurs actifs</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#E74C3C' }}>
              {Object.keys(reportsByTutor).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <User className="h-4 w-4" />
              Tuteurs différents
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des bilans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
            Bilans de progression
          </CardTitle>
          <CardDescription>
            Historique de vos bilans par tuteur et par séance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#7F8C8D' }}>
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Aucun bilan disponible</p>
              <p className="text-sm mt-2">
                Les bilans apparaîtront ici après vos séances complétées
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Grouper par tuteur */}
              {Object.entries(reportsByTutor).map(([tutorName, tutorSessions]) => (
                <div key={tutorName} className="border rounded-lg overflow-hidden">
                  {/* En-tête du groupe */}
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" 
                             style={{ backgroundColor: '#2E5CA8' }}>
                          {tutorName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#2C3E50' }}>
                            {tutorName}
                          </p>
                          <p className="text-sm" style={{ color: '#7F8C8D' }}>
                            {tutorSessions.length} bilan{tutorSessions.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Badge style={{ backgroundColor: '#EBF4FF', color: '#2E5CA8', border: 'none' }}>
                        {tutorSessions[0].subject}
                      </Badge>
                    </div>
                  </div>

                  {/* Liste des bilans du tuteur */}
                  <div className="divide-y">
                    {tutorSessions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((session) => (
                        <ReportCard
                          key={session.id}
                          session={session}
                          isExpanded={expandedReport === session.id}
                          onToggle={() => setExpandedReport(expandedReport === session.id ? null : session.id)}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Composant pour afficher une carte de bilan
function ReportCard({ session, isExpanded, onToggle }: any) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 3.5) return '#F39C12';
    return '#E74C3C';
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'excellent': 
        return <Smile className="h-3.5 w-3.5" />;
      case 'good': 
        return <Smile className="h-3.5 w-3.5" />;
      case 'neutral': 
        return <Meh className="h-3.5 w-3.5" />;
      case 'challenging': 
        return <AlertCircle className="h-3.5 w-3.5" />;
      default: 
        return <Smile className="h-3.5 w-3.5" />;
    }
  };

  const getMoodLabel = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Bien';
      case 'neutral': return 'Neutre';
      case 'challenging': return 'Difficile';
      default: return 'Bien';
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      {/* En-tête du bilan */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-4 w-4" style={{ color: '#7F8C8D' }} />
            <span className="font-medium" style={{ color: '#2C3E50' }}>
              {new Date(session.date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}>
              {session.subject}
            </Badge>
            {session.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" fill={getRatingColor(session.rating)} style={{ color: getRatingColor(session.rating) }} />
                <span className="font-semibold" style={{ color: getRatingColor(session.rating) }}>
                  {session.rating}/5
                </span>
              </div>
            )}
            {session.sessionMood && (
              <Badge className="flex items-center gap-1.5" style={{ backgroundColor: '#FEF3E2', color: '#F39C12', border: 'none' }}>
                {getMoodIcon(session.sessionMood)}
                <span>{getMoodLabel(session.sessionMood)}</span>
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          style={{ color: '#2E5CA8' }}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Masquer
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Détails
            </>
          )}
        </Button>
      </div>

      {/* Aperçu du commentaire */}
      {!isExpanded && session.tutorComment && (
        <p className="text-sm line-clamp-2" style={{ color: '#7F8C8D' }}>
          {session.tutorComment}
        </p>
      )}

      {/* Détails complets */}
      {isExpanded && (
        <div className="mt-4 space-y-4 pt-4 border-t">
          {/* Commentaire du tuteur */}
          {session.tutorComment && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#2C3E50' }}>
                <FileText className="h-4 w-4" />
                Commentaire du tuteur
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#2C3E50' }}>
                  {session.tutorComment}
                </p>
              </div>
            </div>
          )}

          {/* Points forts */}
          {session.strengths && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#10b981' }}>
                <TrendingUp className="h-4 w-4" />
                Points forts
              </h4>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm" style={{ color: '#2C3E50' }}>
                  {session.strengths}
                </p>
              </div>
            </div>
          )}

          {/* Points à améliorer */}
          {session.improvements && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#F39C12' }}>
                <Star className="h-4 w-4" />
                Points à améliorer
              </h4>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm" style={{ color: '#2C3E50' }}>
                  {session.improvements}
                </p>
              </div>
            </div>
          )}

          {/* Devoirs assignés */}
          {session.homework && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#2E5CA8' }}>
                <BookOpen className="h-4 w-4" />
                Devoirs assignés
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm" style={{ color: '#2C3E50' }}>
                  {session.homework}
                </p>
              </div>
            </div>
          )}

          {/* Informations supplémentaires */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium" style={{ color: '#7F8C8D' }}>Durée de la séance</p>
              <p className="text-sm font-semibold" style={{ color: '#2C3E50' }}>
                {session.duration || 1.5}h
              </p>
            </div>
            {session.nextSessionGoals && (
              <div>
                <p className="text-sm font-medium" style={{ color: '#7F8C8D' }}>Objectifs prochaine séance</p>
                <p className="text-sm font-semibold" style={{ color: '#2C3E50' }}>
                  {session.nextSessionGoals}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}