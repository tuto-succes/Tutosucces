import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { projectId } from '../../utils/supabase/info';
import { authenticatedGet } from '../../utils/auth-fetch';

interface AdminPaymentsProps {
  accessToken: string;
}

export function AdminPayments({ accessToken }: AdminPaymentsProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const response = await authenticatedGet(
        `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/payments`
      );

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des paiements...</div>;
  }

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const thisMonth = payments.filter(p => {
    const date = new Date(p.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = thisMonth.reduce((sum, p) => sum + (p.amount || 0), 0);

  const lastMonth = payments.filter(p => {
    const date = new Date(p.createdAt);
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
  });
  const lastMonthRevenue = lastMonth.reduce((sum, p) => sum + (p.amount || 0), 0);

  const growth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenus Totaux
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{totalRevenue.toFixed(2)} $ CAD</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {payments.length} transaction{payments.length > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ce mois-ci</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{thisMonthRevenue.toFixed(2)} $ CAD</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {thisMonth.length} paiement{thisMonth.length > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Croissance
            </CardDescription>
            <CardTitle className={`text-3xl ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">vs mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ticket moyen</CardDescription>
            <CardTitle className="text-3xl">
              {payments.length > 0 ? (totalRevenue / payments.length).toFixed(2) : '0.00'} $ CAD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Par transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Détails mensuels</CardTitle>
          <CardDescription>
            Comparaison des revenus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Mois en cours</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nombre de transactions</span>
                  <span className="font-semibold">{thisMonth.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenu total</span>
                  <span className="font-semibold text-green-600">{thisMonthRevenue.toFixed(2)} $ CAD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ticket moyen</span>
                  <span className="font-semibold">
                    {thisMonth.length > 0 ? (thisMonthRevenue / thisMonth.length).toFixed(2) : '0.00'} $ CAD
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Mois précédent</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nombre de transactions</span>
                  <span className="font-semibold">{lastMonth.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenu total</span>
                  <span className="font-semibold">{lastMonthRevenue.toFixed(2)} $ CAD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ticket moyen</span>
                  <span className="font-semibold">
                    {lastMonth.length > 0 ? (lastMonthRevenue / lastMonth.length).toFixed(2) : '0.00'} $ CAD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
          <CardDescription>
            Toutes les transactions de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun paiement enregistré
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Séance</TableHead>
                  <TableHead>Élève</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {payment.sessionId.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {payment.studentId.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="capitalize">{payment.method || 'Carte'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {payment.status === 'completed' ? 'Payé' : payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {payment.amount.toFixed(2)} $ CAD
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}