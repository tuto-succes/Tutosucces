import { useState, useEffect } from 'react';
import { FileText, Download, Eye, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { projectId } from '../../utils/supabase/info';
import { supabase } from '../../utils/supabase/client';
import { authenticatedGet } from '../../utils/auth-fetch';

interface Invoice {
  id: string;
  invoiceId: string;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: 'À payer' | 'Partiellement payé' | 'Payé';
  clientName: string;
  clientEmail: string;
  studentName: string;
  subtotal: number;
  discountAmount: number;
  taxAmountGST: number;
  taxAmountQST: number;
  totalDue: number;
  lineItems: Array<{
    date: string;
    studentName: string;
    subject: string;
    durationHours: number;
    rate: number;
    total: number;
  }>;
  paymentLinkUrl?: string;
}

interface InvoicesPanelProps {
  userId: string;
  accessToken: string;
  role: 'student' | 'tutor';
}

export function InvoicesPanel({ userId, accessToken, role }: InvoicesPanelProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [userId]);

  async function loadInvoices() {
    setLoading(true);
    try {
      // Charger les factures mock
      const { getMockInvoices } = await import('../../utils/mockData');
      const allInvoices = await getMockInvoices(userId);
      // Filtrer par studentId si c'est un élève
      const filteredInvoices = allInvoices.filter((inv: any) => inv.studentId === userId);
      setInvoices(filteredInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const config: Record<string, { variant: any; color: string }> = {
      'À payer': { variant: 'destructive', color: '#E74C3C' },
      'Partiellement payé': { variant: 'default', color: '#F39C12' },
      'Payé': { variant: 'secondary', color: '#16A34A' }
    };

    const { variant, color } = config[status] || config['À payer'];
    return <Badge variant={variant} style={{ backgroundColor: color, color: 'white' }}>{status}</Badge>;
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des factures...</div>;
  }

  if (selectedInvoice) {
    return <InvoiceDetail invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} role={role} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
            Mes factures
          </CardTitle>
          <CardDescription>
            {role === 'student' 
              ? 'Consultez et payez vos factures de tutorat'
              : 'Consultez les factures émises pour vos services'
            }
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
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg" style={{ color: '#2C3E50' }}>
                            {invoice.invoiceId}
                          </h3>
                          {getStatusBadge(invoice.paymentStatus)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Date d'émission :</span>
                            <span className="ml-2 font-medium">
                              {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Date d'échéance :</span>
                            <span className="ml-2 font-medium">
                              {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Élève :</span>
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

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInvoice(invoice)}
                          style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                        
                        {role === 'student' && invoice.paymentStatus !== 'Payé' && invoice.paymentLinkUrl && (
                          <Button
                            size="sm"
                            style={{ backgroundColor: '#16A34A', color: 'white' }}
                            onClick={() => window.open(invoice.paymentLinkUrl, '_blank')}
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
  );
}

function InvoiceDetail({ invoice, onClose, role }: { invoice: Invoice; onClose: () => void; role: string }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>Facture {invoice.invoiceId}</h2>
        <Button onClick={onClose} variant="outline">Retour</Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl font-bold" style={{ color: '#E74C3C' }}>Tuto-Succès</span>
              <span className="text-3xl font-bold" style={{ color: '#2E5CA8' }}>B&D</span>
            </div>
            <h3 className="text-xl font-semibold" style={{ color: '#2C3E50' }}>
              Facture de services de tutorat
            </h3>
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold" style={{ color: '#2C3E50' }}>Tuto-Succès B&D</h4>
              <p className="text-sm text-gray-600">En Ligne</p>
              <p className="text-sm text-gray-600">Téléphone : 514-651-2401</p>
              <p className="text-sm text-gray-600">Courriel : tutosuccesbd@gmail.com</p>
              <p className="text-sm text-gray-600">Numéro d'entreprise : 514-651-2401</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold" style={{ color: '#2C3E50' }}>Informations de la facture</h4>
              <p className="text-sm"><strong>Numéro :</strong> {invoice.invoiceId}</p>
              <p className="text-sm"><strong>Date d'émission :</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
              <p className="text-sm"><strong>Date d'échéance :</strong> {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
              <p className="text-sm"><strong>Statut :</strong> {invoice.paymentStatus}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2" style={{ color: '#2C3E50' }}>Informations du client</h4>
            <div className="text-sm space-y-1">
              <p><strong>Nom du parent / responsable :</strong> {invoice.clientName}</p>
              <p><strong>Courriel :</strong> {invoice.clientEmail}</p>
              <p><strong>Élève(s) concerné(s) :</strong> {invoice.studentName}</p>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: '#2C3E50' }}>Détails des séances</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Élève</th>
                    <th className="text-left p-2">Matière</th>
                    <th className="text-right p-2">Durée (h)</th>
                    <th className="text-right p-2">Tarif horaire</th>
                    <th className="text-right p-2">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                      <td className="p-2">{item.studentName}</td>
                      <td className="p-2">{item.subject}</td>
                      <td className="text-right p-2">{item.durationHours}</td>
                      <td className="text-right p-2">{item.rate.toFixed(2)} $</td>
                      <td className="text-right p-2 font-medium">{item.total.toFixed(2)} $</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="space-y-2 max-w-md ml-auto">
              <div className="flex justify-between text-sm">
                <span>Sous-total :</span>
                <span className="font-medium">{invoice.subtotal.toFixed(2)} $</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Rabais :</span>
                  <span className="font-medium">-{invoice.discountAmount.toFixed(2)} $</span>
                </div>
              )}
              {invoice.taxAmountGST > 0 && (
                <div className="flex justify-between text-sm">
                  <span>TPS (5%) :</span>
                  <span className="font-medium">{invoice.taxAmountGST.toFixed(2)} $</span>
                </div>
              )}
              {invoice.taxAmountQST > 0 && (
                <div className="flex justify-between text-sm">
                  <span>TVQ (9.975%) :</span>
                  <span className="font-medium">{invoice.taxAmountQST.toFixed(2)} $</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2" style={{ color: '#2E5CA8' }}>
                <span>Total à payer :</span>
                <span>{invoice.totalDue.toFixed(2)} $</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold mb-2" style={{ color: '#2C3E50' }}>Modes de paiement</h4>
            <p className="text-sm mb-3">Le paiement peut être effectué de la manière suivante :</p>
            <ul className="text-sm space-y-1 mb-4">
              <li>• Carte de crédit : Visa ou Mastercard</li>
              <li>• Interac : tutosuccesbd@gmail.com</li>
            </ul>
            
            {role === 'student' && invoice.paymentStatus !== 'Payé' && invoice.paymentLinkUrl && (
              <Button
                className="w-full"
                style={{ backgroundColor: '#16A34A', color: 'white' }}
                onClick={() => window.open(invoice.paymentLinkUrl, '_blank')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payer maintenant
              </Button>
            )}
          </div>

          {/* Terms */}
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Conditions de paiement :</strong> Merci d'effectuer le paiement au plus tard le{' '}
              {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}.
            </p>
            <p>
              Pour toute question concernant cette facture ou les séances de tutorat, vous pouvez nous joindre à{' '}
              tutosuccesbd@gmail.com ou au 514-651-2401.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center border-t pt-4">
            <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>
              Merci de votre confiance envers Tuto-Succès B&D
            </p>
            <p className="text-xs text-gray-500 mt-1">
              L'effort, la persévérance et l'encadrement mènent à la réussite.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}