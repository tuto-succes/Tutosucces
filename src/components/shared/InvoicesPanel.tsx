import { useState, useEffect } from 'react';
import { FileText, Eye, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { fetchStudentInvoices, type SiteInvoice } from '../../utils/invoiceHelpers';
import { InvoiceDialog } from '../student/InvoiceDialog';

interface InvoicesPanelProps {
  userId: string;
  accessToken: string;
  role: 'student' | 'tutor';
}

export function InvoicesPanel({ userId, role }: InvoicesPanelProps) {
  const [invoices, setInvoices] = useState<SiteInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<SiteInvoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [userId]);

  async function loadInvoices() {
    setLoading(true);
    try {
      const data = await fetchStudentInvoices(userId);
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const config: Record<string, { color: string }> = {
      'À payer': { color: '#E74C3C' },
      'Partiellement payé': { color: '#F39C12' },
      'Payé': { color: '#16A34A' },
      'En retard': { color: '#DC2626' },
    };

    const color = config[status]?.color || '#64748B';
    return <Badge style={{ backgroundColor: color, color: 'white' }}>{status}</Badge>;
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des factures...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
              Mes factures
            </CardTitle>
            <CardDescription>
              {role === 'student'
                ? 'Consultez vos factures et conservez vos recus directement dans votre compte.'
                : 'Consultez les factures emises pour vos services.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucune facture disponible</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map(invoice => (
                  <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg" style={{ color: '#2C3E50' }}>
                              {invoice.invoiceId}
                            </h3>
                            {getStatusBadge(invoice.paymentStatus)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Date d'emission :</span>
                              <span className="ml-2 font-medium">
                                {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Date d'echeance :</span>
                              <span className="ml-2 font-medium">
                                {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Eleve :</span>
                              <span className="ml-2 font-medium">{invoice.studentName}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Montant total :</span>
                              <span className="ml-2 font-bold text-lg" style={{ color: '#2E5CA8' }}>
                                {invoice.totalDue.toFixed(2)} $
                              </span>
                            </div>
                          </div>

                          {invoice.paymentStatus === 'À payer' && new Date(invoice.dueDate) < new Date() && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                              <AlertCircle className="h-4 w-4" />
                              <span>Paiement en retard</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedInvoice(invoice)}
                            style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>

                          {role === 'student' && invoice.paymentStatus !== 'Payé' && (
                            <Button
                              size="sm"
                              style={{ backgroundColor: '#16A34A', color: 'white' }}
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Payer
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <InvoiceDialog
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </>
  );
}
