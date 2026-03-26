import { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, TrendingUp, Calendar, FileText, Receipt, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../app/core/supabase.client';

interface AdminStatsState {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  pendingSessions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  unpaidSessions: number;
  progressReports: number;
  invoices: number;
}

const initialStats: AdminStatsState = {
  totalUsers: 0,
  totalStudents: 0,
  totalTutors: 0,
  totalSessions: 0,
  completedSessions: 0,
  upcomingSessions: 0,
  pendingSessions: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  unpaidSessions: 0,
  progressReports: 0,
  invoices: 0,
};

function isFutureOrToday(sessionDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(`${sessionDate}T12:00:00`);
  date.setHours(0, 0, 0, 0);

  return date.getTime() >= today.getTime();
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStatsState>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);

    try {
      const [
        profilesResult,
        sessionsResult,
        paymentsResult,
        reportsResult,
        invoicesResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id, role'),
        supabase.from('sessions').select('id, status, session_date, total_price, payment_status'),
        supabase.from('payments').select('amount, status, payment_date'),
        supabase.from('progress_reports').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('*', { count: 'exact', head: true }),
      ]);

      if (profilesResult.error) {
        throw profilesResult.error;
      }

      if (sessionsResult.error) {
        throw sessionsResult.error;
      }

      if (paymentsResult.error) {
        throw paymentsResult.error;
      }

      if (reportsResult.error) {
        throw reportsResult.error;
      }

      if (invoicesResult.error) {
        throw invoicesResult.error;
      }

      const profiles = profilesResult.data ?? [];
      const sessions = sessionsResult.data ?? [];
      const payments = paymentsResult.data ?? [];

      const students = profiles.filter(profile => profile.role === 'student');
      const tutors = profiles.filter(profile => profile.role === 'tutor');

      const completedSessions = sessions.filter(session => session.status === 'completed');
      const pendingSessions = sessions.filter(session => session.status === 'pending');
      const upcomingSessions = sessions.filter(
        session =>
          (session.status === 'pending' || session.status === 'confirmed') &&
          isFutureOrToday(session.session_date)
      );

      const unpaidSessions = completedSessions.filter(session => session.payment_status !== 'paid');
      const completedPayments = payments.filter(payment => payment.status === 'completed');

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const totalRevenue = completedPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

      const monthlyRevenue = completedPayments
        .filter(payment => {
          if (!payment.payment_date) {
            return false;
          }

          const paymentDate = new Date(payment.payment_date);
          return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      setStats({
        totalUsers: profiles.length,
        totalStudents: students.length,
        totalTutors: tutors.length,
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        upcomingSessions: upcomingSessions.length,
        pendingSessions: pendingSessions.length,
        totalRevenue,
        monthlyRevenue,
        unpaidSessions: unpaidSessions.length,
        progressReports: reportsResult.count ?? 0,
        invoices: invoicesResult.count ?? 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques admin :', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Chargement des statistiques...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-xl font-bold" style={{ color: '#2C3E50' }}>
          Vue d&apos;ensemble de la plateforme
        </h3>
        <p className="text-sm" style={{ color: '#7F8C8D' }}>
          Statistiques globales synchronisées avec les vraies données Supabase.
        </p>
      </div>

      <div>
        <h4 className="mb-4 text-lg font-semibold" style={{ color: '#2C3E50' }}>
          Utilisateurs
        </h4>
        <div className="grid gap-4 md:grid-cols-3">
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
                Comptes enregistrés
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
                Tuteurs enregistrés
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h4 className="mb-4 text-lg font-semibold" style={{ color: '#2C3E50' }}>
          Séances
        </h4>
        <div className="grid gap-4 md:grid-cols-4">
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
              <CardDescription>Séances terminées</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#10b981' }}>
                {stats.completedSessions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <FileText className="h-4 w-4" />
                Cours complétés
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
                En attente ou confirmées
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Demandes en attente</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#2E5CA8' }}>
                {stats.pendingSessions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <AlertTriangle className="h-4 w-4" />
                Réservations à traiter
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h4 className="mb-4 text-lg font-semibold" style={{ color: '#2C3E50' }}>
          Finances et documents
        </h4>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Revenu total encaissé</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#10b981' }}>
                {stats.totalRevenue.toFixed(2)} $
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <DollarSign className="h-4 w-4" />
                Paiements complétés
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Revenu du mois</CardDescription>
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

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Séances non payées</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#E67E22' }}>
                {stats.unpaidSessions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <Receipt className="h-4 w-4" />
                Paiements encore en attente
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Factures générées</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#8E44AD' }}>
                {stats.invoices}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <FileText className="h-4 w-4" />
                Historique des factures
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h4 className="mb-4 text-lg font-semibold" style={{ color: '#2C3E50' }}>
          Suivi pédagogique
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Bilans enregistrés</CardDescription>
              <CardTitle className="text-4xl" style={{ color: '#16A085' }}>
                {stats.progressReports}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                <FileText className="h-4 w-4" />
                Rapports de progression sauvegardés
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
