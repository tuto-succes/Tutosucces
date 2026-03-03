import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, FileText, Download, Receipt, Search, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import jsPDF from 'jspdf';

interface ParentPayment {
  id: string;
  parentName: string;
  studentName: string;
  studentId: string;
  email: string;
  phone: string;
  sessionDate: string;
  sessionTime: string;
  tutorName: string;
  tutorId: string;
  subject: string;
  duration: number;
  hourlyRate: number;
  amount: number;
  paymentDate: string | null;
  paymentMethod: string | null;
  status: 'completed' | 'pending';
  invoiceNumber: string;
}

export function AdminFinances() {
  const [payments, setPayments] = useState<ParentPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<ParentPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedPayment, setSelectedPayment] = useState<ParentPayment | null>(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
  });

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
    calculateStats();
  }, [payments, searchTerm, filterStatus]);

  const loadPayments = () => {
    const stored = localStorage.getItem('parentPayments');
    if (stored) {
      const allPayments = JSON.parse(stored);
      // Trier par date de paiement (plus récent en premier)
      allPayments.sort((a: ParentPayment, b: ParentPayment) => {
        const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
        return dateB - dateA;
      });
      setPayments(allPayments);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filtrer par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tutorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  };

  const calculateStats = () => {
    const completed = payments.filter(p => p.status === 'completed');
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRevenue = completed
      .filter(p => {
        const date = new Date(p.paymentDate || '');
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const yearlyRevenue = completed
      .filter(p => {
        const date = new Date(p.paymentDate || '');
        return date.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    setStats({
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      completedPayments: completed.length,
    });
  };

  const downloadReceipt = (payment: ParentPayment) => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(46, 92, 168); // #2E5CA8
    doc.text('TUTO-SUCCÈS B&D', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80); // #2C3E50
    doc.text('REÇU DE PAIEMENT', 105, 30, { align: 'center' });
    
    // Ligne de séparation
    doc.setDrawColor(224, 224, 224);
    doc.line(20, 35, 190, 35);
    
    // Numéro de reçu et date
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141); // #7F8C8D
    doc.text(`Numéro de reçu: ${payment.invoiceNumber}`, 20, 45);
    const paymentDateStr = payment.paymentDate 
      ? new Date(payment.paymentDate).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'En attente';
    doc.text(`Date de paiement: ${paymentDateStr}`, 20, 52);
    
    // Information client
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('INFORMATION CLIENT', 20, 65);
    doc.setDrawColor(224, 224, 224);
    doc.line(20, 67, 190, 67);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Parent/Tuteur légal: ${payment.parentName}`, 20, 75);
    doc.text(`Élève: ${payment.studentName}`, 20, 82);
    doc.text(`Email: ${payment.email}`, 20, 89);
    doc.text(`Téléphone: ${payment.phone}`, 20, 96);
    
    // Détails de la session
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('DÉTAILS DE LA SESSION', 20, 110);
    doc.setDrawColor(224, 224, 224);
    doc.line(20, 112, 190, 112);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const sessionDateStr = new Date(payment.sessionDate).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Date de la session: ${sessionDateStr}`, 20, 120);
    doc.text(`Heure: ${payment.sessionTime}`, 20, 127);
    doc.text(`Tuteur: ${payment.tutorName}`, 20, 134);
    doc.text(`Matière: ${payment.subject}`, 20, 141);
    doc.text(`Durée: ${payment.duration}h`, 20, 148);
    
    // Détails du paiement
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('DÉTAILS DU PAIEMENT', 20, 162);
    doc.setDrawColor(224, 224, 224);
    doc.line(20, 164, 190, 164);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Taux horaire: ${payment.hourlyRate.toFixed(2)}$/h`, 20, 172);
    doc.text(`Durée: ${payment.duration}h`, 20, 179);
    if (payment.paymentMethod) {
      doc.text(`Mode de paiement: ${payment.paymentMethod}`, 20, 186);
    }
    
    // Montant total
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129); // #10b981
    const totalY = payment.paymentMethod ? 200 : 193;
    doc.text(`MONTANT TOTAL: ${payment.amount.toFixed(2)}$ CAD`, 20, totalY);
    
    // Note fiscale
    doc.setFontSize(9);
    doc.setTextColor(127, 140, 141);
    const noteY = totalY + 15;
    doc.text('Ce reçu peut être utilisé pour vos déclarations de revenus.', 20, noteY);
    doc.text('Conservez-le pour vos dossiers.', 20, noteY + 6);
    doc.text('Les services de tutorat éducatif peuvent être admissibles à des crédits d\'impôt', 20, noteY + 16);
    doc.text('selon votre juridiction. Consultez un fiscaliste pour plus d\'informations.', 20, noteY + 22);
    
    // Pied de page
    doc.setDrawColor(224, 224, 224);
    doc.line(20, 260, 190, 260);
    doc.setFontSize(9);
    doc.setTextColor(127, 140, 141);
    doc.text('Tuto-Succès B&D', 105, 268, { align: 'center' });
    doc.text('Email: tutosuccesbd@gmail.com  |  Téléphone: 514-651-2401', 105, 274, { align: 'center' });
    doc.text('Merci d\'avoir choisi Tuto-Succès B&D pour l\'éducation de votre enfant !', 105, 283, { align: 'center' });
    
    // Sauvegarder le PDF
    doc.save(`${payment.invoiceNumber}_${payment.studentName.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadAllReceipts = () => {
    const completedPayments = payments.filter(p => p.status === 'completed');
    
    if (completedPayments.length === 0) {
      alert('Aucun paiement complété à exporter');
      return;
    }

    const year = new Date().getFullYear();
    const reportText = `
═══════════════════════════════════════════════════════════
                    TUTO-SUCCÈS B&D
          RAPPORT ANNUEL DES PAIEMENTS - ${year}
═══════════════════════════════════════════════════════════

Date de génération: ${new Date().toLocaleDateString('fr-CA')}

Ce rapport contient tous les paiements reçus pour l'année ${year}.
Document destiné aux relevés d'impôts.

-----------------------------------------------------------
RÉCAPITULATIF
-----------------------------------------------------------
Nombre total de paiements: ${completedPayments.length}
Revenu total de l'année: ${stats.yearlyRevenue.toFixed(2)}$ CAD

-----------------------------------------------------------
DÉTAIL DES PAIEMENTS
-----------------------------------------------------------
${completedPayments.map((p, i) => `
${i + 1}. ${p.invoiceNumber}
   Date: ${new Date(p.paymentDate || '').toLocaleDateString('fr-CA')}
   Parent: ${p.parentName}
   Élève: ${p.studentName}
   Matière: ${p.subject}
   Tuteur: ${p.tutorName}
   Montant: ${p.amount.toFixed(2)}$`).join('\n')}

-----------------------------------------------------------
TOTAL ANNÉE ${year}: ${stats.yearlyRevenue.toFixed(2)}$ CAD
-----------------------------------------------------------

═══════════════════════════════════════════════════════════
Tuto-Succès B&D
Email: tutosuccesbd@gmail.com
Téléphone: 514-651-2401
═══════════════════════════════════════════════════════════
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rapport_Annuel_${year}_TutoSucces.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    alert(`Rapport annuel ${year} téléchargé\n${completedPayments.length} paiements\nTotal: ${stats.yearlyRevenue.toFixed(2)}$`);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
            Paiements des parents
          </h3>
          <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
            Tous les reçus de paiement pour les relevés d'impôts
          </p>
        </div>
        <Button 
          onClick={downloadAllReceipts}
          style={{ backgroundColor: '#10b981', color: 'white' }}
        >
          <Download className="h-4 w-4 mr-2" />
          Rapport annuel {new Date().getFullYear()}
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Revenu total</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#10b981' }}>
              {stats.totalRevenue.toFixed(2)}$
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <DollarSign className="h-4 w-4" />
              Tous les paiements
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Année {new Date().getFullYear()}</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#2E5CA8' }}>
              {stats.yearlyRevenue.toFixed(2)}$
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <TrendingUp className="h-4 w-4" />
              Pour les relevés fiscaux
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ce mois</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#E74C3C' }}>
              {stats.monthlyRevenue.toFixed(2)}$
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Paiements</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#2C3E50' }}>
              {stats.completedPayments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <Receipt className="h-4 w-4" />
              Reçus disponibles
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#7F8C8D' }} />
              <Input
                placeholder="Rechercher par parent, élève, tuteur ou numéro de reçu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                style={filterStatus === 'all' ? { backgroundColor: '#2E5CA8', color: 'white' } : {}}
              >
                Tous
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
                style={filterStatus === 'completed' ? { backgroundColor: '#10b981', color: 'white' } : {}}
              >
                Payés
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                style={filterStatus === 'pending' ? { backgroundColor: '#F39C12', color: 'white' } : {}}
              >
                En attente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" style={{ color: '#2E5CA8' }} />
            Reçus de paiement ({filteredPayments.length})
          </CardTitle>
          <CardDescription>
            Téléchargez les reçus individuels pour les parents ou le rapport annuel pour les impôts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#7F8C8D' }}>
                <Receipt className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Aucun paiement trouvé</p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium" style={{ color: '#2C3E50' }}>
                        {payment.parentName} ({payment.studentName})
                      </span>
                      <Badge variant="outline" style={{ borderColor: '#7F8C8D', color: '#7F8C8D' }}>
                        {payment.invoiceNumber}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                      <div>
                        <strong>Session:</strong> {new Date(payment.sessionDate).toLocaleDateString('fr-CA')} à {payment.sessionTime}
                      </div>
                      <div>
                        <strong>Tuteur:</strong> {payment.tutorName}
                      </div>
                      <div>
                        <strong>Matière:</strong> {payment.subject}
                      </div>
                      <div>
                        <strong>Durée:</strong> {payment.duration}h @ {payment.hourlyRate}$/h
                      </div>
                      {payment.paymentDate && (
                        <div className="col-span-2">
                          <strong>Payé le:</strong> {formatDate(payment.paymentDate)}
                          {payment.paymentMethod && ` - ${payment.paymentMethod}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                        {payment.amount.toFixed(2)}$
                      </p>
                      <Badge
                        style={{
                          backgroundColor: payment.status === 'completed' ? '#D1FAE5' : '#FEF3E2',
                          color: payment.status === 'completed' ? '#10b981' : '#F39C12',
                          border: 'none',
                        }}
                      >
                        {payment.status === 'completed' ? 'Payé' : 'En attente'}
                      </Badge>
                    </div>
                    {payment.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReceipt(payment)}
                        style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Reçu
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}