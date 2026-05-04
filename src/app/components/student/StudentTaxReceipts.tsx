import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import jsPDF from 'jspdf';

interface TaxReceiptData {
  year: number;
  totalExpenses: number;
  sessionsCount: number;
  generatedDate: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
}

export function StudentTaxReceipts({ 
  studentId, 
  studentName, 
  parentName, 
  parentEmail 
}: { 
  studentId: string; 
  studentName: string; 
  parentName: string;
  parentEmail: string;
}) {
  const [taxReceipts, setTaxReceipts] = useState<TaxReceiptData[]>([]);

  useEffect(() => {
    loadTaxReceipts();
  }, [studentId]);

  const loadTaxReceipts = () => {
    // Mock data - Dans un vrai système, on chargerait depuis localStorage ou API
    const mockReceipts: TaxReceiptData[] = [
      {
        year: 2025,
        totalExpenses: 3250.00,
        sessionsCount: 65,
        generatedDate: '2026-03-02',
        studentName: studentName,
        parentName: parentName,
        parentEmail: parentEmail,
      },
      {
        year: 2024,
        totalExpenses: 2800.00,
        sessionsCount: 56,
        generatedDate: '2025-03-02',
        studentName: studentName,
        parentName: parentName,
        parentEmail: parentEmail,
      },
    ];

    setTaxReceipts(mockReceipts);
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
    doc.text(`Parent/Tuteur légal: ${receipt.parentName}`, 20, 60);
    doc.text(`Élève: ${receipt.studentName}`, 20, 67);
    doc.text('Type: Élève / Parent', 20, 74);
    doc.text(`Email: ${receipt.parentEmail}`, 20, 81);
    
    // Période fiscale
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('PÉRIODE FISCALE', 20, 97);
    doc.line(20, 99, 190, 99);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Année fiscale: ${receipt.year}`, 20, 107);
    doc.text(`Date de génération: ${new Date(receipt.generatedDate).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 114);
    
    // Résumé financier
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('RÉSUMÉ FINANCIER', 20, 130);
    doc.line(20, 132, 190, 132);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Type de dépense: Services éducatifs de tutorat', 20, 140);
    doc.text(`Nombre de sessions payées: ${receipt.sessionsCount}`, 20, 147);
    doc.text(`Montant total des dépenses: ${receipt.totalExpenses.toFixed(2)}$ CAD`, 20, 154);
    
    // Note importante pour élèves/parents
    doc.setFontSize(16);
    doc.setTextColor(231, 76, 60);
    doc.text(`TOTAL DÉPENSES: ${receipt.totalExpenses.toFixed(2)}$ CAD`, 20, 170);
    
    doc.setFontSize(9);
    doc.setTextColor(127, 140, 141);
    doc.text('Note: Les frais de tutorat peuvent être admissibles à des crédits d\'impôt pour frais de garde', 20, 187);
    doc.text('d\'enfants ou pour autres dépenses éducatives selon votre juridiction. Consultez votre', 20, 193);
    doc.text('fiscaliste ou comptable pour déterminer l\'admissibilité de ces dépenses.', 20, 199);
    
    // Information légale
    doc.setFontSize(9);
    doc.setTextColor(127, 140, 141);
    doc.text('Ce document constitue un relevé fiscal officiel émis par Tuto-Succès B&D.', 20, 217);
    doc.text('Conservez-le avec vos documents fiscaux.', 20, 223);
    
    // Envoi automatique le 2 mars
    doc.setFontSize(8);
    doc.setTextColor(46, 92, 168);
    doc.text('📅 Les relevés fiscaux sont automatiquement envoyés le 2 mars de chaque année.', 20, 237);
    
    // Pied de page
    doc.setDrawColor(224, 224, 224);
    doc.line(20, 250, 190, 250);
    doc.setFontSize(9);
    doc.setTextColor(127, 140, 141);
    doc.text('Tuto-Succès B&D', 105, 258, { align: 'center' });
    doc.text('Email: tutosuccesbd@gmail.com  |  Téléphone: 514-651-2401', 105, 264, { align: 'center' });
    doc.text('Merci de votre confiance pour l\'année fiscale ' + receipt.year, 105, 273, { align: 'center' });
    
    doc.save(`Releve_Fiscal_${receipt.year}_${receipt.studentName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: '#E74C3C' }} />
            Mes relevés fiscaux (Dépenses éducatives)
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Envoyés automatiquement par email le 2 mars de chaque année
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Alerte envoi automatique */}
          <Card style={{ backgroundColor: '#FEE2E2', borderColor: '#E74C3C', marginBottom: '1.5rem' }}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5" style={{ color: '#E74C3C' }} />
                <div>
                  <p className="font-semibold" style={{ color: '#2C3E50' }}>
                    Relevés fiscaux automatiques
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
                    Vos relevés fiscaux annuels sont automatiquement envoyés par email au parent/tuteur légal le 2 mars de chaque année.
                    Vous pouvez également les télécharger ci-dessous à tout moment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {taxReceipts.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#7F8C8D' }}>
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Aucun relevé fiscal disponible</p>
                <p className="text-sm mt-2">
                  Vos relevés fiscaux seront générés automatiquement en fin d'année fiscale.
                </p>
              </div>
            ) : (
              taxReceipts.map((receipt) => (
                <div
                  key={receipt.year}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg" style={{ color: '#2C3E50' }}>
                        Année fiscale {receipt.year}
                      </span>
                      <Badge
                        style={{
                          backgroundColor: '#FEE2E2',
                          color: '#E74C3C',
                          border: 'none',
                        }}
                      >
                        Dépenses éducatives
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                      <div>
                        <strong>Total dépenses:</strong>{' '}
                        <span className="font-semibold" style={{ color: '#E74C3C' }}>
                          {receipt.totalExpenses.toFixed(2)}$ CAD
                        </span>
                      </div>
                      <div>
                        <strong>Sessions suivies:</strong> {receipt.sessionsCount}
                      </div>
                      <div>
                        <strong>Élève:</strong> {receipt.studentName}
                      </div>
                      <div>
                        <strong>Parent:</strong> {receipt.parentName}
                      </div>
                      <div>
                        <strong>Date de génération:</strong> {new Date(receipt.generatedDate).toLocaleDateString('fr-CA')}
                      </div>
                      <div>
                        <strong>Envoyé à:</strong> {receipt.parentEmail}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateTaxReceiptPDF(receipt)}
                    style={{ borderColor: '#E74C3C', color: '#E74C3C' }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger PDF
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Information fiscale */}
          <Card style={{ backgroundColor: '#FEF3C7', borderColor: '#F59E0B', marginTop: '1.5rem' }}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 mt-0.5" style={{ color: '#F59E0B' }} />
                <div>
                  <p className="font-semibold mb-2" style={{ color: '#2C3E50' }}>
                    Information utile
                  </p>
                  <p className="text-sm" style={{ color: '#7F8C8D' }}>
                    Les frais de tutorat peuvent être admissibles à des crédits d'impôt pour frais de garde d'enfants
                    ou pour autres dépenses éducatives selon votre juridiction (provincial et fédéral).
                    Consultez un comptable ou fiscaliste pour déterminer l'admissibilité de ces dépenses
                    et optimiser vos déclarations de revenus.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}