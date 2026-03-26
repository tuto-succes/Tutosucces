import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText, Download, Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../app/core/supabase.client';

interface Invoice {
  id: string;
  invoiceId: string;
  clientName: string;
  studentName: string;
  invoiceDate: string;
  dueDate: string | null;
  paymentStatus: string;
  subtotal: number;
  totalDue: number;
  lineItems: any[];
}

export function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('invoice_date', { ascending: false });

    if (error) {
      console.error('Erreur chargement factures:', error);
    } else {
      setInvoices((data || []).map(mapInvoice));
    }
    setLoading(false);
  };

  function mapInvoice(row: any): Invoice {
    return {
      id: row.id,
      invoiceId: row.invoice_id,
      clientName: row.client_name || '',
      studentName: row.student_name || '',
      invoiceDate: row.invoice_date,
      dueDate: row.due_date || null,
      paymentStatus: row.payment_status || 'À payer',
      subtotal: Number(row.subtotal ?? 0),
      totalDue: Number(row.total_due ?? 0),
      lineItems: row.line_items ?? [],
    };
  }

  const markAsPaid = async (invoiceId: string) => {
    const { error } = await supabase
      .from('invoices')
      .update({ payment_status: 'Payé' })
      .eq('invoice_id', invoiceId);

    if (!error) {
      setInvoices(prev =>
        prev.map(inv => inv.invoiceId === invoiceId ? { ...inv, paymentStatus: 'Payé' } : inv)
      );
      if (selectedInvoice?.invoiceId === invoiceId) {
        setSelectedInvoice(s => s ? { ...s, paymentStatus: 'Payé' } : s);
      }
    }
  };

  const downloadInvoice = (invoice: Invoice) => {
    const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('fr-CA');

    let text = `
═══════════════════════════════════════════════════════════
                    TUTO-SUCCÈS B&D
                  FACTURE DE TUTORAT
═══════════════════════════════════════════════════════════

Numéro de facture: ${invoice.invoiceId}
Date: ${invoiceDate}

Client: ${invoice.clientName}
Élève: ${invoice.studentName}

-----------------------------------------------------------
DÉTAIL DES SESSIONS
-----------------------------------------------------------
`;

    (invoice.lineItems || []).forEach((item: any, index: number) => {
      text += `
${index + 1}. ${item.date ? new Date(item.date).toLocaleDateString('fr-CA') : ''}
   Élève: ${item.studentName || ''}
   Matière: ${item.subject || ''}
   Durée: ${item.durationHours || 0}h @ ${item.rate || 0}$/h
   Montant: ${Number(item.total || 0).toFixed(2)}$
`;
    });

    text += `
-----------------------------------------------------------
RÉCAPITULATIF
-----------------------------------------------------------
Sous-total: ${invoice.subtotal.toFixed(2)}$

MONTANT TOTAL: ${invoice.totalDue.toFixed(2)}$
-----------------------------------------------------------

Statut: ${invoice.paymentStatus}

═══════════════════════════════════════════════════════════
Contact: tutosuccesbd@gmail.com | 514-651-2401
═══════════════════════════════════════════════════════════
`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const isPaid = (status: string) => status === 'Payé';
  const isLate = (inv: Invoice) =>
    !isPaid(inv.paymentStatus) && !!inv.dueDate && new Date(inv.dueDate) < new Date();

  const totalPending = invoices
    .filter(inv => !isPaid(inv.paymentStatus))
    .reduce((sum, inv) => sum + inv.totalDue, 0);

  const totalPaid = invoices
    .filter(inv => isPaid(inv.paymentStatus))
    .reduce((sum, inv) => sum + inv.totalDue, 0);

  const getStatusBadge = (invoice: Invoice) => {
    if (isPaid(invoice.paymentStatus)) {
      return (
        <Badge style={{ backgroundColor: '#D1FAE5', color: '#10b981' }}>
          Payé
        </Badge>
      );
    }
    if (isLate(invoice)) {
      return (
        <Badge style={{ backgroundColor: '#FEE2E2', color: '#E74C3C' }}>
          En retard
        </Badge>
      );
    }
    return (
      <Badge style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
        {invoice.paymentStatus}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p style={{ color: '#7F8C8D' }}>Chargement des factures...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
            Facturation
          </h2>
          <p style={{ color: '#7F8C8D' }}>
            Gérez les factures des élèves et suivez les paiements
          </p>
        </div>
        <Button
          onClick={loadInvoices}
          variant="outline"
          style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
        >
          Actualiser
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                <Clock className="h-6 w-6" style={{ color: '#E74C3C' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>En attente</p>
                <p className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                  {totalPending.toFixed(2)}$
                </p>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>
                  {invoices.filter(inv => !isPaid(inv.paymentStatus)).length} facture(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                <CheckCircle className="h-6 w-6" style={{ color: '#10b981' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>Payé</p>
                <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                  {totalPaid.toFixed(2)}$
                </p>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>
                  {invoices.filter(inv => isPaid(inv.paymentStatus)).length} facture(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                <AlertTriangle className="h-6 w-6" style={{ color: '#D97706' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>En retard</p>
                <p className="text-2xl font-bold" style={{ color: '#D97706' }}>
                  {invoices.filter(isLate).length}
                </p>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>facture(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: '#7F8C8D' }} />
            <p className="text-lg" style={{ color: '#7F8C8D' }}>
              Aucune facture pour le moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            {invoices.map((invoice) => (
              <Card
                key={invoice.id}
                className={`cursor-pointer transition-all ${
                  selectedInvoice?.id === invoice.id
                    ? 'ring-2 ring-blue-500'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedInvoice(invoice)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
                        {invoice.clientName || invoice.studentName}
                      </h3>
                      <p className="text-xs" style={{ color: '#7F8C8D' }}>
                        {invoice.invoiceId}
                      </p>
                    </div>
                    {getStatusBadge(invoice)}
                  </div>
                  <p className="text-sm mb-1" style={{ color: '#7F8C8D' }}>
                    {formatDate(invoice.invoiceDate)}
                  </p>
                  {invoice.dueDate && (
                    <p className="text-xs mb-2" style={{ color: isLate(invoice) ? '#E74C3C' : '#7F8C8D' }}>
                      Échéance: {formatDate(invoice.dueDate)}
                    </p>
                  )}
                  <p className="text-lg font-bold" style={{ color: '#E74C3C' }}>
                    {invoice.totalDue.toFixed(2)}$
                  </p>
                  <p className="text-xs" style={{ color: '#7F8C8D' }}>
                    {invoice.lineItems.length} session(s)
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="md:col-span-2">
            {selectedInvoice ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle style={{ color: '#2C3E50' }}>
                        Facture {selectedInvoice.invoiceId}
                      </CardTitle>
                      <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
                        Émise le {formatDate(selectedInvoice.invoiceDate)}
                      </p>
                    </div>
                    {getStatusBadge(selectedInvoice)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2" style={{ color: '#2C3E50' }}>Client</h3>
                    <p style={{ color: '#2C3E50' }}>{selectedInvoice.clientName}</p>
                    {selectedInvoice.studentName && selectedInvoice.studentName !== selectedInvoice.clientName && (
                      <p className="text-sm" style={{ color: '#7F8C8D' }}>
                        Élève: {selectedInvoice.studentName}
                      </p>
                    )}
                    {selectedInvoice.dueDate && (
                      <p className="text-sm mt-1" style={{ color: isLate(selectedInvoice) ? '#E74C3C' : '#7F8C8D' }}>
                        Échéance: {formatDate(selectedInvoice.dueDate)}
                        {isLate(selectedInvoice) && ' — EN RETARD'}
                      </p>
                    )}
                  </div>

                  {selectedInvoice.lineItems.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ color: '#2C3E50' }}>
                        Détail des sessions ({selectedInvoice.lineItems.length})
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedInvoice.lineItems.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border"
                            style={{ borderColor: '#E0E0E0' }}
                          >
                            <div className="flex-1">
                              <p className="font-medium" style={{ color: '#2C3E50' }}>
                                {item.subject} — {item.studentName}
                              </p>
                              <p className="text-sm" style={{ color: '#7F8C8D' }}>
                                {item.date ? new Date(item.date).toLocaleDateString('fr-CA') : ''} • {item.durationHours || 0}h @ {item.rate || 0}$/h
                              </p>
                            </div>
                            <p className="font-semibold" style={{ color: '#E74C3C' }}>
                              {Number(item.total || 0).toFixed(2)}$
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ color: '#7F8C8D' }}>Sous-total:</span>
                      <span className="font-semibold" style={{ color: '#2C3E50' }}>
                        {selectedInvoice.subtotal.toFixed(2)}$
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-bold" style={{ color: '#2C3E50' }}>
                        MONTANT TOTAL:
                      </span>
                      <span className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                        {selectedInvoice.totalDue.toFixed(2)}$
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => downloadInvoice(selectedInvoice)}
                      variant="outline"
                      className="flex-1"
                      style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                    {!isPaid(selectedInvoice.paymentStatus) && (
                      <Button
                        onClick={() => markAsPaid(selectedInvoice.invoiceId)}
                        className="flex-1"
                        style={{ backgroundColor: '#10b981', color: 'white' }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marquer comme payé
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: '#7F8C8D' }} />
                  <p className="text-lg" style={{ color: '#7F8C8D' }}>
                    Sélectionnez une facture pour voir les détails
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
