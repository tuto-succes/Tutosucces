import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import jsPDF from 'jspdf';

interface TaxReceiptData {
  year: number;
  totalRevenue: number;
  sessionsCount: number;
  generatedDate: string;
}

export function TutorTaxReceipts({ tutorId, tutorName, tutorEmail }: { tutorId: string; tutorName: string; tutorEmail: string }) {
  const [taxReceipts, setTaxReceipts] = useState<TaxReceiptData[]>([]);

  useEffect(() => {
    loadTaxReceipts();
  }, [tutorId]);

  const loadTaxReceipts = () => {
    // Mock data - Dans un vrai système, on chargerait depuis localStorage ou API
    const mockReceipts: TaxReceiptData[] = [
      {
        year: 2025,
        totalRevenue: 8750.00,
        sessionsCount: 175,
        generatedDate: '2026-03-02',
      },
      {
        year: 2024,
        totalRevenue: 6420.00,
        sessionsCount: 128,
        generatedDate: '2025-03-02',
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
    
    // Informations du tuteur
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('DESTINATAIRE', 20, 50);
    doc.line(20, 52, 190, 52);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Nom: ${tutorName}`, 20, 60);
    doc.text('Type: Tuteur', 20, 67);
    doc.text(`Email: ${tutorEmail}`, 20, 74);
    
    // Période fiscale
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('PÉRIODE FISCALE', 20, 90);
    doc.line(20, 92, 190, 92);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Année fiscale: ${receipt.year}`, 20, 100);
    doc.text(`Date de génération: ${new Date(receipt.generatedDate).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 107);
    
    // Résumé financier
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('RÉSUMÉ FINANCIER', 20, 123);
    doc.line(20, 125, 190, 125);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Type de revenu: Revenus de services de tutorat', 20, 133);
    doc.text(`Nombre de sessions données: ${receipt.sessionsCount}`, 20, 140);
    doc.text(`Montant total des revenus: ${receipt.totalRevenue.toFixed(2)}$ CAD`, 20, 147);
    
    // Note importante pour tuteurs
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(`TOTAL REVENUS: ${receipt.totalRevenue.toFixed(2)}$ CAD`, 20, 163);
    
    doc.setFontSize(9);
    doc.setTextColor(127, 140, 141);
    doc.text('Note: Ces revenus doivent être déclarés dans votre déclaration de revenus. En tant que', 20, 180);
    doc.text('travailleur autonome, vous pourriez être admissible à déduire certaines dépenses liées', 20, 186);
    doc.text('à votre activité de tutorat. Consultez un fiscaliste pour plus d\'informations.', 20, 192);
    
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
    
    doc.save(`Releve_Fiscal_${receipt.year}_${tutorName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: '#10b981' }} />
            Mes relevés fiscaux (Revenus)
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Envoyés automatiquement par email le 2 mars de chaque année
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Alerte envoi automatique */}
          <Card style={{ backgroundColor: '#D1FAE5', borderColor: '#10b981', marginBottom: '1.5rem' }}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5" style={{ color: '#10b981' }} />
                <div>
                  <p className="font-semibold" style={{ color: '#2C3E50' }}>
                    Relevés fiscaux automatiques
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
                    Vos relevés fiscaux annuels sont automatiquement envoyés par email le 2 mars de chaque année.
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
                          backgroundColor: '#D1FAE5',
                          color: '#10b981',
                          border: 'none',
                        }}
                      >
                        Revenus de tutorat
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                      <div>
                        <strong>Total revenus:</strong>{' '}
                        <span className="font-semibold" style={{ color: '#10b981' }}>
                          {receipt.totalRevenue.toFixed(2)}$ CAD
                        </span>
                      </div>
                      <div>
                        <strong>Sessions données:</strong> {receipt.sessionsCount}
                      </div>
                      <div>
                        <strong>Date de génération:</strong> {new Date(receipt.generatedDate).toLocaleDateString('fr-CA')}
                      </div>
                      <div>
                        <strong>Envoyé par email:</strong> {new Date(receipt.generatedDate).toLocaleDateString('fr-CA')}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateTaxReceiptPDF(receipt)}
                    style={{ borderColor: '#10b981', color: '#10b981' }}
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
                <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: '#F59E0B' }} />
                <div>
                  <p className="font-semibold mb-2" style={{ color: '#2C3E50' }}>
                    Information importante
                  </p>
                  <p className="text-sm" style={{ color: '#7F8C8D' }}>
                    Ces revenus doivent être déclarés dans votre déclaration de revenus annuelle.
                    En tant que travailleur autonome, vous pourriez être admissible à déduire certaines dépenses
                    professionnelles liées à votre activité de tutorat (matériel, Internet, espace de travail, etc.).
                    Consultez un comptable ou fiscaliste pour optimiser votre déclaration.
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