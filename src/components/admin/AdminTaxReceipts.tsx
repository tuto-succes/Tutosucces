import { useState, useEffect } from 'react';
import { FileText, Send, Calendar, Users, Download, Mail, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import jsPDF from 'jspdf';

interface TaxReceiptData {
  userId: string;
  name: string;
  email: string;
  role: 'student' | 'tutor';
  totalAmount: number;
  paymentsCount: number;
  year: number;
}

export function AdminTaxReceipts() {
  const [taxReceipts, setTaxReceipts] = useState<TaxReceiptData[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sendingStatus, setSendingStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadTaxReceipts();
  }, [selectedYear]);

  const loadTaxReceipts = () => {
    // Charger les paiements
    const payments = JSON.parse(localStorage.getItem('parentPayments') || '[]');
    const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');

    // Calculer les totaux pour chaque élève
    const studentReceipts: { [key: string]: TaxReceiptData } = {};
    
    payments
      .filter((p: any) => p.status === 'completed' && p.paymentDate)
      .forEach((p: any) => {
        const paymentYear = new Date(p.paymentDate).getFullYear();
        if (paymentYear !== selectedYear) return;

        if (!studentReceipts[p.studentId]) {
          const student = users.find((u: any) => u.id === p.studentId);
          if (student) {
            studentReceipts[p.studentId] = {
              userId: p.studentId,
              name: p.parentName || p.studentName,
              email: p.email,
              role: 'student',
              totalAmount: 0,
              paymentsCount: 0,
              year: selectedYear,
            };
          }
        }

        if (studentReceipts[p.studentId]) {
          studentReceipts[p.studentId].totalAmount += p.amount;
          studentReceipts[p.studentId].paymentsCount += 1;
        }
      });

    // Calculer les totaux pour chaque tuteur (revenus)
    const tutorReceipts: { [key: string]: TaxReceiptData } = {};
    
    payments
      .filter((p: any) => p.status === 'completed' && p.paymentDate)
      .forEach((p: any) => {
        const paymentYear = new Date(p.paymentDate).getFullYear();
        if (paymentYear !== selectedYear) return;

        if (!tutorReceipts[p.tutorId]) {
          const tutor = users.find((u: any) => u.id === p.tutorId);
          if (tutor) {
            tutorReceipts[p.tutorId] = {
              userId: p.tutorId,
              name: p.tutorName,
              email: tutor.email,
              role: 'tutor',
              totalAmount: 0,
              paymentsCount: 0,
              year: selectedYear,
            };
          }
        }

        if (tutorReceipts[p.tutorId]) {
          tutorReceipts[p.tutorId].totalAmount += p.amount;
          tutorReceipts[p.tutorId].paymentsCount += 1;
        }
      });

    const allReceipts = [
      ...Object.values(studentReceipts),
      ...Object.values(tutorReceipts),
    ].sort((a, b) => b.totalAmount - a.totalAmount);

    setTaxReceipts(allReceipts);
  };

  const generateTaxReceiptPDF = (receipt: TaxReceiptData) => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(46, 92, 168);
    doc.text('TUTO-SUCCÈS B&D', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text(`RELEVÉ FISCAL ${receipt.year}`, 105, 30, { align: 'center' });
    
    // Ligne de séparation
    doc.setDrawColor(224, 224, 224);
    doc.line(20, 35, 190, 35);
    
    // Informations du destinataire
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('DESTINATAIRE', 20, 50);
    doc.line(20, 52, 190, 52);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Nom: ${receipt.name}`, 20, 60);
    doc.text(`Type: ${receipt.role === 'student' ? 'Élève / Parent' : 'Tuteur'}`, 20, 67);
    doc.text(`Email: ${receipt.email}`, 20, 74);
    
    // Période fiscale
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('PÉRIODE FISCALE', 20, 90);
    doc.line(20, 92, 190, 92);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Année fiscale: ${receipt.year}`, 20, 100);
    doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 107);
    
    // Résumé financier
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('RÉSUMÉ FINANCIER', 20, 123);
    doc.line(20, 125, 190, 125);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    if (receipt.role === 'student') {
      doc.text('Type de dépense: Services éducatifs de tutorat', 20, 133);
      doc.text(`Nombre de sessions payées: ${receipt.paymentsCount}`, 20, 140);
      doc.text(`Montant total des dépenses: ${receipt.totalAmount.toFixed(2)}$ CAD`, 20, 147);
      
      // Note importante pour élèves
      doc.setFontSize(16);
      doc.setTextColor(231, 76, 60);
      doc.text(`TOTAL DÉPENSES: ${receipt.totalAmount.toFixed(2)}$ CAD`, 20, 163);
      
      doc.setFontSize(9);
      doc.setTextColor(127, 140, 141);
      doc.text('Note: Les frais de tutorat peuvent être admissibles à des crédits d\'impôt pour frais de garde', 20, 180);
      doc.text('d\'enfants ou pour autres dépenses éducatives selon votre juridiction. Consultez votre', 20, 186);
      doc.text('fiscaliste ou comptable pour déterminer l\'admissibilité de ces dépenses.', 20, 192);
    } else {
      doc.text('Type de revenu: Revenus de services de tutorat', 20, 133);
      doc.text(`Nombre de sessions données: ${receipt.paymentsCount}`, 20, 140);
      doc.text(`Montant total des revenus: ${receipt.totalAmount.toFixed(2)}$ CAD`, 20, 147);
      
      // Note importante pour tuteurs
      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129);
      doc.text(`TOTAL REVENUS: ${receipt.totalAmount.toFixed(2)}$ CAD`, 20, 163);
      
      doc.setFontSize(9);
      doc.setTextColor(127, 140, 141);
      doc.text('Note: Ces revenus doivent être déclarés dans votre déclaration de revenus. En tant que', 20, 180);
      doc.text('travailleur autonome, vous pourriez être admissible à déduire certaines dépenses liées', 20, 186);
      doc.text('à votre activité de tutorat. Consultez un fiscaliste pour plus d\'informations.', 20, 192);
    }
    
    // Information légale
    doc.setFontSize(9);
    doc.setTextColor(127, 140, 141);
    doc.text('Ce document constitue un relevé fiscal officiel émis par Tuto-Succès B&D.', 20, 210);
    doc.text('Conservez-le avec vos documents fiscaux.', 20, 216);
    
    // Envoi automatique le 2 mars
    doc.setFontSize(8);
    doc.setTextColor(46, 92, 168);
    doc.text('📅 Les relevés fiscaux sont automatiquement envoyés le 2 mars de chaque année.', 20, 230);
    
    // Pied de page
    doc.setDrawColor(224, 224, 224);
    doc.line(20, 250, 190, 250);
    doc.setFontSize(9);
    doc.setTextColor(127, 140, 141);
    doc.text('Tuto-Succès B&D', 105, 258, { align: 'center' });
    doc.text('Email: tutosuccesbd@gmail.com  |  Téléphone: 514-651-2401', 105, 264, { align: 'center' });
    doc.text('Merci de votre confiance pour l\'année fiscale ' + receipt.year, 105, 273, { align: 'center' });
    
    return doc;
  };

  const downloadReceipt = (receipt: TaxReceiptData) => {
    const doc = generateTaxReceiptPDF(receipt);
    doc.save(`Releve_Fiscal_${receipt.year}_${receipt.name.replace(/\s+/g, '_')}.pdf`);
  };

  const sendReceiptByEmail = (receipt: TaxReceiptData) => {
    setSendingStatus({ ...sendingStatus, [receipt.userId]: true });

    const subject = encodeURIComponent(`Relevé fiscal ${receipt.year} - Tuto-Succès B&D`);
    const body = encodeURIComponent(`Bonjour ${receipt.name},

Veuillez trouver ci-joint votre relevé fiscal pour l'année ${receipt.year}.

RÉSUMÉ:
${receipt.role === 'student' ? 'Type: Dépenses éducatives (tutorat)' : 'Type: Revenus de tutorat'}
Année fiscale: ${receipt.year}
${receipt.role === 'student' ? 'Montant total des dépenses' : 'Montant total des revenus'}: ${receipt.totalAmount.toFixed(2)}$ CAD
Nombre de sessions: ${receipt.paymentsCount}

Ce document est à conserver avec vos documents fiscaux et à présenter à votre comptable ou lors de votre déclaration de revenus.

${receipt.role === 'student' 
  ? 'Note: Les frais de tutorat peuvent être admissibles à des crédits d\'impôt pour frais de garde d\'enfants ou autres dépenses éducatives. Consultez votre fiscaliste pour l\'admissibilité.' 
  : 'Note: Ces revenus doivent être déclarés dans votre déclaration de revenus. Vous pourriez être admissible à déduire certaines dépenses professionnelles.'}

📅 RAPPEL: Les relevés fiscaux sont automatiquement envoyés le 2 mars de chaque année.

Pour télécharger votre relevé en PDF, veuillez vous connecter à votre compte sur notre plateforme.

Cordialement,
L'équipe Tuto-Succès B&D
tutosuccesbd@gmail.com
514-651-2401`);

    window.location.href = `mailto:${receipt.email}?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setSendingStatus({ ...sendingStatus, [receipt.userId]: false });
    }, 2000);
  };

  const sendAllReceipts = () => {
    if (confirm(`Êtes-vous sûr de vouloir envoyer les ${taxReceipts.length} relevés fiscaux ${selectedYear} par email ?\n\nCette action ouvrira plusieurs fenêtres d'email.`)) {
      taxReceipts.forEach((receipt, index) => {
        setTimeout(() => {
          sendReceiptByEmail(receipt);
        }, index * 500); // Délai entre chaque email
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
            Relevés d'impôts (T4A / Relevé 1)
          </h3>
          <p className="text-sm mt-1 flex items-center gap-2" style={{ color: '#7F8C8D' }}>
            <Calendar className="h-4 w-4" />
            Envoi automatique le 2 mars de chaque année fiscale
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-md"
            style={{ borderColor: '#E0E0E0', color: '#2C3E50' }}
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
          <Button
            onClick={sendAllReceipts}
            disabled={taxReceipts.length === 0}
            style={{ backgroundColor: '#2E5CA8', color: 'white' }}
          >
            <Send className="h-4 w-4 mr-2" />
            Envoyer tous les relevés ({taxReceipts.length})
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total des relevés</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#2E5CA8' }}>
              {taxReceipts.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <FileText className="h-4 w-4" />
              Relevés {selectedYear}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Élèves / Parents</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#E74C3C' }}>
              {taxReceipts.filter(r => r.role === 'student').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <Users className="h-4 w-4" />
              Dépenses éducatives
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tuteurs</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#10b981' }}>
              {taxReceipts.filter(r => r.role === 'tutor').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <Users className="h-4 w-4" />
              Revenus de tutorat
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerte envoi automatique */}
      <Card style={{ backgroundColor: '#E3F2FD', borderColor: '#2E5CA8' }}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5" style={{ color: '#2E5CA8' }} />
            <div>
              <p className="font-semibold" style={{ color: '#2C3E50' }}>
                Envoi automatique programmé pour le 2 mars {selectedYear + 1}
              </p>
              <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
                Tous les relevés fiscaux {selectedYear} seront automatiquement envoyés par email à tous les élèves et tuteurs.
                Vous pouvez également envoyer manuellement les relevés dès maintenant en utilisant les boutons ci-dessous.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des relevés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
            Relevés fiscaux {selectedYear} ({taxReceipts.length})
          </CardTitle>
          <CardDescription>
            Téléchargez ou envoyez les relevés fiscaux individuels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {taxReceipts.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#7F8C8D' }}>
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Aucun relevé fiscal pour {selectedYear}</p>
                <p className="text-sm mt-2">
                  Les relevés seront générés automatiquement dès qu'il y aura des paiements complétés.
                </p>
              </div>
            ) : (
              taxReceipts.map((receipt) => (
                <div
                  key={receipt.userId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium" style={{ color: '#2C3E50' }}>
                        {receipt.name}
                      </span>
                      <Badge
                        style={{
                          backgroundColor: receipt.role === 'student' ? '#FEE2E2' : '#D1FAE5',
                          color: receipt.role === 'student' ? '#E74C3C' : '#10b981',
                          border: 'none',
                        }}
                      >
                        {receipt.role === 'student' ? 'Élève / Parent' : 'Tuteur'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                      <div>
                        <strong>Email:</strong> {receipt.email}
                      </div>
                      <div>
                        <strong>Sessions:</strong> {receipt.paymentsCount}
                      </div>
                      <div>
                        <strong>{receipt.role === 'student' ? 'Total dépenses' : 'Total revenus'}:</strong>{' '}
                        <span className="font-semibold" style={{ color: receipt.role === 'student' ? '#E74C3C' : '#10b981' }}>
                          {receipt.totalAmount.toFixed(2)}$ CAD
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReceipt(receipt)}
                      style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendReceiptByEmail(receipt)}
                      disabled={sendingStatus[receipt.userId]}
                      style={{ borderColor: '#10b981', color: '#10b981' }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {sendingStatus[receipt.userId] ? 'Envoi...' : 'Envoyer'}
                    </Button>
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