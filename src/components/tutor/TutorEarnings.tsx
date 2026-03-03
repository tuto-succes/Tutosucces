import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, CheckCircle, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { projectId } from '../../utils/supabase/info';
import { authenticatedGet } from '../../utils/auth-fetch';

interface TutorEarningsProps {
  userId: string;
  accessToken: string;
}

export function TutorEarnings({ userId, accessToken }: TutorEarningsProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [paymentsRes, sessionsRes] = await Promise.all([
        authenticatedGet(
          `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/payments`
        ),
        authenticatedGet(
          `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/sessions`
        )
      ]);

      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des revenus...</div>;
  }

  const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const thisMonth = payments.filter(p => {
    const date = new Date(p.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + (p.amount || 0), 0);

  // Monthly data for chart
  const monthlyData: Record<string, number> = {};
  payments.forEach(p => {
    const date = new Date(p.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = (monthlyData[key] || 0) + p.amount;
  });

  const chartData = Object.entries(monthlyData)
    .map(([month, amount]) => ({ month, amount }))
    .slice(-6); // Last 6 months

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="paystubs">Talons de paie</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Revenus totaux
                </CardDescription>
                <CardTitle className="text-3xl" style={{ color: '#16A34A' }}>${totalEarnings.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {payments.length} paiement{payments.length > 1 ? 's' : ''} reçu{payments.length > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ce mois-ci
                </CardDescription>
                <CardTitle className="text-3xl" style={{ color: '#2E5CA8' }}>${thisMonth.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Revenus du mois en cours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Revenu moyen
                </CardDescription>
                <CardTitle className="text-3xl" style={{ color: '#2C3E50' }}>
                  ${payments.length > 0 ? (totalEarnings / payments.length).toFixed(2) : '0.00'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Par séance payée</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des revenus</CardTitle>
              <CardDescription>Revenus mensuels des 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Pas encore de données
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#2E5CA8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Paiements récents</CardTitle>
              <CardDescription>Vos dernières transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun paiement reçu
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.slice(0, 10).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">Séance #{payment.sessionId.slice(0, 8)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: '#16A34A' }}>+${payment.amount.toFixed(2)}</div>
                        <Badge variant="default" style={{ backgroundColor: '#16A34A' }}>Reçu</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="paystubs">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
              Talons de paie
            </CardTitle>
            <CardDescription>
              Téléchargez vos talons de paie mensuels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(monthlyData).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Aucun talon de paie disponible</p>
                <p className="text-sm mt-1">Les talons de paie apparaîtront ici dès que vous aurez reçu des paiements</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(monthlyData)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([month, amount]) => {
                    const [year, monthNum] = month.split('-');
                    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('fr-FR', { 
                      month: 'long', 
                      year: 'numeric' 
                    });

                    return (
                      <div key={month} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
                          <div>
                            <div className="font-semibold capitalize" style={{ color: '#2C3E50' }}>
                              {monthName}
                            </div>
                            <div className="text-sm" style={{ color: '#7F8C8D' }}>
                              Total: ${amount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}