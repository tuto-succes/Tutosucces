import { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, TrendingUp, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { getMockUsers, getMockSessions } from '../../utils/mockData';

export function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTutors: 0,
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const users = await getMockUsers();
      const allSessions: any[] = [];

      // Récupérer toutes les séances
      for (const user of users) {
        if (user.role === 'student') {
          const sessions = await getMockSessions(user.id, 'student');
          allSessions.push(...sessions);
        }
      }

      const students = users.filter(u => u.role === 'student');
      const tutors = users.filter(u => u.role === 'tutor');
      const completedSessions = allSessions.filter(s => s.status === 'completed');
      const upcomingSessions = allSessions.filter(s => s.status === 'scheduled');

      // Calculer le revenu total (40$ par séance)
      const totalRevenue = completedSessions.length * 40;
      
      // Calculer le revenu du mois en cours
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = completedSessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
      }).length * 40;

      setStats({
        totalUsers: users.length,
        totalStudents: students.length,
        totalTutors: tutors.length,
        totalSessions: allSessions.length,
        completedSessions: completedSessions.length,
        upcomingSessions: upcomingSessions.length,
        totalRevenue,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des statistiques...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: '#2C3E50' }}>
          Vue d'ensemble de la plateforme
        </h3>
        <p className="text-sm" style={{ color: '#7F8C8D' }}>
          Statistiques globales et indicateurs clés de performance
        </p>
      </div>

      {/* Statistiques utilisateurs */}
      <div>
        <h4 className="text-lg font-semibold mb-4" style={{ color: '#2C3E50' }}>
          Utilisateurs
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total utilisateurs</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#2E5CA8' }}>
                {stats.totalUsers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <Users className="h-4 w-4" />
                Utilisateurs actifs
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Élèves</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#E74C3C' }}>
                {stats.totalStudents}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <Users className="h-4 w-4" />
                Élèves inscrits
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tuteurs</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#10b981' }}>
                {stats.totalTutors}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <GraduationCap className="h-4 w-4" />
                Tuteurs actifs
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistiques séances */}
      <div>
        <h4 className="text-lg font-semibold mb-4" style={{ color: '#2C3E50' }}>
          Séances
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total séances</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#2C3E50' }}>
                {stats.totalSessions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <Calendar className="h-4 w-4" />
                Toutes les séances
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Séances complétées</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#10b981' }}>
                {stats.completedSessions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <FileText className="h-4 w-4" />
                Séances terminées
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Séances à venir</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#F39C12' }}>
                {stats.upcomingSessions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <Calendar className="h-4 w-4" />
                Séances programmées
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistiques financières */}
      <div>
        <h4 className="text-lg font-semibold mb-4" style={{ color: '#2C3E50' }}>
          Finances
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Revenu total</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#10b981' }}>
                {stats.totalRevenue.toFixed(2)} $
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <DollarSign className="h-4 w-4" />
                Depuis le lancement
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Revenu ce mois</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#2E5CA8' }}>
                {stats.monthlyRevenue.toFixed(2)} $
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <TrendingUp className="h-4 w-4" />
                {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
