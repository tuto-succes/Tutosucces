import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText, Download, DollarSign, Eye, CheckCircle, Clock } from 'lucide-react';

interface InvoiceSession {
  date: string;
  time: string;
  duration: number;
  student: string;
  subject: string;
  amount: number;
}

interface Invoice {
  invoiceNumber: string;
  tutorName: string;
  tutorId: string;
  weekStart: string;
  weekEnd: string;
  sessions: InvoiceSession[];
  totalHours: number;
  hourlyRate: number;
  totalAmount: number;
  generatedAt: string;
  status: 'pending' | 'paid';
  paidAt?: string;
}

export function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const stored = localStorage.getItem('tutorInvoices');
    if (stored) {
      const allInvoices = JSON.parse(stored);
      // Trier par date de génération (plus récent en premier)
      allInvoices.sort((a: Invoice, b: Invoice) => 
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
      setInvoices(allInvoices);
    }
  };

  const markAsPaid = (invoiceNumber: string) => {
    const updatedInvoices = invoices.map(inv =>
      inv.invoiceNumber === invoiceNumber
        ? { ...inv, status: 'paid' as const, paidAt: new Date().toISOString() }
        : inv
    );
    setInvoices(updatedInvoices);
    localStorage.setItem('tutorInvoices', JSON.stringify(updatedInvoices));
    
    if (selectedInvoice?.invoiceNumber === invoiceNumber) {
      setSelectedInvoice({ ...selectedInvoice, status: 'paid', paidAt: new Date().toISOString() });
    }
  };

  const downloadInvoice = (invoice: Invoice) => {
    // Générer un reçu de facture en format texte
    const weekStart = new Date(invoice.weekStart).toLocaleDateString('fr-CA');
    const weekEnd = new Date(invoice.weekEnd).toLocaleDateString('fr-CA');
    const generatedDate = new Date(invoice.generatedAt).toLocaleDateString('fr-CA');
    
    let invoiceText = `
═══════════════════════════════════════════════════════════
                    TUTO-SUCCÈS B&D
                  FACTURE DE TUTORAT
═══════════════════════════════════════════════════════════

Numéro de facture: ${invoice.invoiceNumber}
Date de génération: ${generatedDate}

Tuteur: ${invoice.tutorName}
Période: ${weekStart} - ${weekEnd}

-----------------------------------------------------------
DÉTAIL DES SESSIONS
-----------------------------------------------------------
`;

    invoice.sessions.forEach((session, index) => {
      const sessionDate = new Date(session.date).toLocaleDateString('fr-CA');
      invoiceText += `
${index + 1}. ${sessionDate} à ${session.time}
   Élève: ${session.student}
   Matière: ${session.subject}
   Durée: ${session.duration}h @ ${invoice.hourlyRate}$/h
   Montant: ${session.amount.toFixed(2)}$
`;
    });

    invoiceText += `
-----------------------------------------------------------
RÉCAPITULATIF
-----------------------------------------------------------
Nombre de sessions: ${invoice.sessions.length}
Heures totales: ${invoice.totalHours.toFixed(1)}h
Taux horaire: ${invoice.hourlyRate.toFixed(2)}$/h

MONTANT TOTAL: ${invoice.totalAmount.toFixed(2)}$
-----------------------------------------------------------

Statut: ${invoice.status === 'paid' ? 'PAYÉ' : 'EN ATTENTE'}
${invoice.paidAt ? `Date de paiement: ${new Date(invoice.paidAt).toLocaleDateString('fr-CA')}` : ''}

═══════════════════════════════════════════════════════════
Contact: tutosuccesbd@gmail.com | 514-651-2401
═══════════════════════════════════════════════════════════
`;

    // Télécharger le fichier
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}.txt`;
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

  const totalPending = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
          Factures des tuteurs
        </h2>
        <p style={{ color: '#7F8C8D' }}>
          Gérez les factures et les paiements des tuteurs
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                <Clock className="h-6 w-6" style={{ color: '#E74C3C' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>En attente de paiement</p>
                <p className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                  {totalPending.toFixed(2)}$
                </p>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>
                  {invoices.filter(inv => inv.status === 'pending').length} facture(s)
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
                  {invoices.filter(inv => inv.status === 'paid').length} facture(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des factures */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: '#7F8C8D' }} />
            <p className="text-lg" style={{ color: '#7F8C8D' }}>
              Aucune facture générée pour le moment
            </p>
            <p className="text-sm mt-2" style={{ color: '#7F8C8D' }}>
              Les factures apparaîtront ici après leur génération depuis le calendrier
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Liste */}
          <div className="md:col-span-1 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            {invoices.map((invoice) => (
              <Card
                key={invoice.invoiceNumber}
                className={`cursor-pointer transition-all ${
                  selectedInvoice?.invoiceNumber === invoice.invoiceNumber
                    ? 'ring-2 ring-blue-500'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedInvoice(invoice)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
                        {invoice.tutorName}
                      </h3>
                      <p className="text-xs" style={{ color: '#7F8C8D' }}>
                        {invoice.invoiceNumber}
                      </p>
                    </div>
                    <Badge
                      style={
                        invoice.status === 'paid'
                          ? { backgroundColor: '#D1FAE5', color: '#10b981' }
                          : { backgroundColor: '#FEE2E2', color: '#E74C3C' }
                      }
                    >
                      {invoice.status === 'paid' ? 'Payé' : 'En attente'}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2" style={{ color: '#7F8C8D' }}>
                    {new Date(invoice.weekStart).toLocaleDateString('fr-CA')} - {new Date(invoice.weekEnd).toLocaleDateString('fr-CA')}
                  </p>
                  <p className="text-lg font-bold" style={{ color: '#E74C3C' }}>
                    {invoice.totalAmount.toFixed(2)}$
                  </p>
                  <p className="text-xs" style={{ color: '#7F8C8D' }}>
                    {invoice.sessions.length} session(s) • {invoice.totalHours.toFixed(1)}h
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Détails */}
          <div className="md:col-span-2">
            {selectedInvoice ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle style={{ color: '#2C3E50' }}>
                        Facture {selectedInvoice.invoiceNumber}
                      </CardTitle>
                      <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
                        Générée le {formatDate(selectedInvoice.generatedAt)}
                      </p>
                    </div>
                    <Badge
                      className="text-base px-4 py-2"
                      style={
                        selectedInvoice.status === 'paid'
                          ? { backgroundColor: '#D1FAE5', color: '#10b981' }
                          : { backgroundColor: '#FEE2E2', color: '#E74C3C' }
                      }
                    >
                      {selectedInvoice.status === 'paid' ? 'Payé' : 'En attente'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Info tuteur */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2" style={{ color: '#2C3E50' }}>
                      Tuteur
                    </h3>
                    <p style={{ color: '#2C3E50' }}>{selectedInvoice.tutorName}</p>
                    <p className="text-sm" style={{ color: '#7F8C8D' }}>
                      Période: {new Date(selectedInvoice.weekStart).toLocaleDateString('fr-CA')} - {new Date(selectedInvoice.weekEnd).toLocaleDateString('fr-CA')}
                    </p>
                  </div>

                  {/* Sessions */}
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: '#2C3E50' }}>
                      Détail des sessions ({selectedInvoice.sessions.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedInvoice.sessions.map((session, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          style={{ borderColor: '#E0E0E0' }}
                        >
                          <div className="flex-1">
                            <p className="font-medium" style={{ color: '#2C3E50' }}>
                              {session.subject} - {session.student}
                            </p>
                            <p className="text-sm" style={{ color: '#7F8C8D' }}>
                              {new Date(session.date).toLocaleDateString('fr-CA')} à {session.time} • {session.duration}h
                            </p>
                          </div>
                          <p className="font-semibold" style={{ color: '#E74C3C' }}>
                            {session.amount.toFixed(2)}$
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ color: '#7F8C8D' }}>Heures totales:</span>
                      <span className="font-semibold" style={{ color: '#2C3E50' }}>
                        {selectedInvoice.totalHours.toFixed(1)}h
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ color: '#7F8C8D' }}>Taux horaire:</span>
                      <span className="font-semibold" style={{ color: '#2C3E50' }}>
                        {selectedInvoice.hourlyRate.toFixed(2)}$/h
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-bold" style={{ color: '#2C3E50' }}>
                        MONTANT TOTAL:
                      </span>
                      <span className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                        {selectedInvoice.totalAmount.toFixed(2)}$
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
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
                    {selectedInvoice.status === 'pending' && (
                      <Button
                        onClick={() => markAsPaid(selectedInvoice.invoiceNumber)}
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
