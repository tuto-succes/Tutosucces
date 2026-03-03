import { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, Star, TrendingUp, Award, Target, Calendar, BookOpen, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { getMockSessions, getMockTutorProfile } from '../../utils/mockData';

interface TutorStatsProps {
  userId: string;
  accessToken: string;
}

export function TutorStats({ userId, accessToken }: TutorStatsProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [tutorProfile, setTutorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      // Utiliser les données mock
      const allSessions = await getMockSessions();
      const tutorSessions = allSessions.filter(s => s.tutorId === userId);
      setSessions(tutorSessions);
      
      const profile = await getMockTutorProfile(userId);
      setTutorProfile(profile);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des statistiques...</div>;
  }

  // Calculer les statistiques
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const pendingSessions = sessions.filter(s => s.status === 'pending');
  const confirmedSessions = sessions.filter(s => s.status === 'confirmed');
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');

  const totalHours = completedSessions.reduce((sum, s) => sum + (s.duration || 1.5), 0);
  const uniqueStudents = new Set(completedSessions.map(s => s.studentId)).size;
  
  const acceptanceRate = sessions.length > 0 
    ? ((sessions.length - cancelledSessions.length) / sessions.length) * 100 
    : 0;

  // Données pour le graphique de distribution par statut
  const statusData = [
    { name: 'Terminées', value: completedSessions.length, color: '#10b981' },
    { name: 'Confirmées', value: confirmedSessions.length, color: '#2E5CA8' },
    { name: 'En attente', value: pendingSessions.length, color: '#F39C12' },
    { name: 'Annulées', value: cancelledSessions.length, color: '#E74C3C' },
  ].filter(d => d.value > 0);

  // Données pour le graphique des séances par matière
  const subjectData: Record<string, number> = {};
  completedSessions.forEach(s => {
    subjectData[s.subject] = (subjectData[s.subject] || 0) + 1;
  });
  const topSubjects = Object.entries(subjectData)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Données pour l'évolution des séances par semaine
  const weeklyData: Record<string, number> = {};
  completedSessions.forEach(s => {
    const date = new Date(s.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().split('T')[0];
    weeklyData[key] = (weeklyData[key] || 0) + 1;
  });
  const weeklyChartData = Object.entries(weeklyData)
    .map(([week, count]) => ({ 
      week: new Date(week).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }), 
      sessions: count 
    }))
    .slice(-8);

  // Données pour la distribution des heures
  const hourlyData: Record<string, number> = {};
  completedSessions.forEach(s => {
    const hour = new Date(s.date).getHours();
    const timeSlot = `${hour}h-${hour + 1}h`;
    hourlyData[timeSlot] = (hourlyData[timeSlot] || 0) + 1;
  });
  const hourlyChartData = Object.entries(hourlyData)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time));

  // Calculer le taux de progression (commentaires/bilans remplis)
  const sessionsWithComments = completedSessions.filter(s => s.tutorComment).length;
  const commentCompletionRate = completedSessions.length > 0 
    ? (sessionsWithComments / completedSessions.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* En-tête avec résumé */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
          Statistiques de performance
        </h2>
        <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
          Analyse détaillée de votre activité et de vos résultats
        </p>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Séances données
            </CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#2E5CA8' }}>
              {completedSessions.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: '#7F8C8D' }}>
              Sur {sessions.length} total
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: '#10b981' }}>
              <TrendingUp className="h-3 w-3" />
              {sessions.length > 0 ? ((completedSessions.length / sessions.length) * 100).toFixed(0) : 0}% de réussite
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Élèves uniques
            </CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#E74C3C' }}>
              {uniqueStudents}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: '#7F8C8D' }}>
              Élèves différents
            </p>
            <div className="mt-2 text-xs" style={{ color: '#7F8C8D' }}>
              {(completedSessions.length / (uniqueStudents || 1)).toFixed(1)} séances/élève
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Heures enseignées
            </CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#2C3E50' }}>
              {totalHours}h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: '#7F8C8D' }}>
              Temps total d'enseignement
            </p>
            <div className="mt-2 text-xs" style={{ color: '#7F8C8D' }}>
              Moy. {(totalHours / (completedSessions.length || 1)).toFixed(1)}h/séance
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Note moyenne
            </CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#F39C12' }}>
              {tutorProfile?.rating?.toFixed(1) || '5.0'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3 w-3"
                  fill={star <= (tutorProfile?.rating || 5) ? '#F39C12' : 'none'}
                  style={{ color: '#F39C12' }}
                />
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: '#7F8C8D' }}>
              {tutorProfile?.reviewCount || 12} avis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Indicateurs de performance */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: '#2E5CA8' }} />
              Taux d'acceptation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#2E5CA8' }}>
              {acceptanceRate.toFixed(1)}%
            </div>
            <div className="mt-2 space-y-1 text-sm" style={{ color: '#7F8C8D' }}>
              <div>✓ {sessions.length - cancelledSessions.length} acceptées</div>
              <div>✗ {cancelledSessions.length} refusées</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" style={{ color: '#E74C3C' }} />
              Suivi pédagogique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#E74C3C' }}>
              {commentCompletionRate.toFixed(0)}%
            </div>
            <div className="mt-2 text-sm" style={{ color: '#7F8C8D' }}>
              {sessionsWithComments} séances avec commentaire
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all" 
                  style={{ 
                    width: `${commentCompletionRate}%`,
                    backgroundColor: '#E74C3C'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4" style={{ color: '#F39C12' }} />
              Disponibilité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <Badge style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }}>
                Actif
              </Badge>
            </div>
            <div className="text-sm" style={{ color: '#7F8C8D' }}>
              {pendingSessions.length} demande{pendingSessions.length > 1 ? 's' : ''} en attente
            </div>
            <div className="text-sm" style={{ color: '#7F8C8D' }}>
              {confirmedSessions.length} séance{confirmedSessions.length > 1 ? 's' : ''} à venir
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques d'analyse */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Évolution des séances par semaine */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color: '#2E5CA8' }} />
              Évolution hebdomadaire
            </CardTitle>
            <CardDescription>
              Nombre de séances complétées par semaine
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyChartData.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#7F8C8D' }}>
                Pas encore de données
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" style={{ fontSize: '12px' }} />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#2E5CA8" 
                    strokeWidth={2}
                    dot={{ fill: '#2E5CA8', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Répartition par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" style={{ color: '#E74C3C' }} />
              Répartition des séances
            </CardTitle>
            <CardDescription>
              Distribution par statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#7F8C8D' }}>
                Aucune séance
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top 5 matières enseignées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" style={{ color: '#2E5CA8' }} />
              Matières enseignées
            </CardTitle>
            <CardDescription>
              Vos 5 matières les plus demandées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topSubjects.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#7F8C8D' }}>
                Pas encore de données
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topSubjects} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="subject" type="category" width={100} style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2E5CA8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Plages horaires préférées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" style={{ color: '#E74C3C' }} />
              Plages horaires
            </CardTitle>
            <CardDescription>
              Distribution de vos séances par heure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hourlyChartData.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#7F8C8D' }}>
                Pas encore de données
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" style={{ fontSize: '11px' }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#E74C3C" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tableau de bord d'activité */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de l'activité récente</CardTitle>
          <CardDescription>Vue d'ensemble de votre performance ce mois-ci</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" style={{ color: '#2E5CA8' }} />
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Heures ce mois</span>
                </div>
                <span className="text-xl font-bold" style={{ color: '#2E5CA8' }}>
                  {totalHours}h
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: '#E74C3C' }} />
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Nouveaux élèves</span>
                </div>
                <span className="text-xl font-bold" style={{ color: '#E74C3C' }}>
                  {uniqueStudents}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" style={{ color: '#F39C12' }} />
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Satisfaction</span>
                </div>
                <span className="text-xl font-bold" style={{ color: '#F39C12' }}>
                  {tutorProfile?.rating?.toFixed(1) || '5.0'}/5
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" style={{ color: '#10b981' }} />
                  <span className="font-medium" style={{ color: '#2C3E50' }}>Taux de réussite</span>
                </div>
                <span className="text-xl font-bold" style={{ color: '#10b981' }}>
                  {acceptanceRate.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
