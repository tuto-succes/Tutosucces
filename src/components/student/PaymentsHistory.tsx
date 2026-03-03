import { useState, useEffect } from 'react';
import { CreditCard, Calendar, DollarSign, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { getMockPayments } from '../../utils/mockData';
import { InvoiceDialog } from './InvoiceDialog';

interface PaymentsHistoryProps {
  userId: string;
  accessToken: string;
}

export function PaymentsHistory({ userId, accessToken }: PaymentsHistoryProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const data = await getMockPayments(userId);
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) {
    return <div className="text-center py-8">Chargement des paiements...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total dépensé</CardDescription>
            <CardTitle className="text-3xl">{totalSpent.toFixed(2)} $</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Sur {payments.length} transaction{payments.length > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ce mois-ci</CardDescription>
            <CardTitle className="text-3xl">
              {payments
                .filter(p => {
                  const date = new Date(p.date);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                })
                .reduce((sum, p) => sum + (p.amount || 0), 0)
                .toFixed(2)} $
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Transactions du mois en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Moyenne par séance</CardDescription>
            <CardTitle className="text-3xl">
              {payments.length > 0 ? (totalSpent / payments.length).toFixed(2) : '0.00'} $
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Coût moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
          <CardDescription>Toutes vos transactions</CardDescription>
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
                  <TableHead>Séance ID</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.sessionId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <span className="capitalize">{payment.method || 'Carte'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {payment.status === 'completed' ? 'Payé' : payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {payment.amount.toFixed(2)} $
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedPayment(payment); setShowInvoice(true); }}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Dialog */}
      {showInvoice && selectedPayment && (
        <InvoiceDialog
          isOpen={showInvoice}
          payment={selectedPayment}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}