import { Download, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
  sessions?: any[];
}

export function InvoiceDialog({ isOpen, onClose, payment, sessions = [] }: InvoiceDialogProps) {
  // Informations de la compagnie
  const companyInfo = {
    name: "Tuto-Succès B&D",
    address: "En Ligne",
    phone: "514-651-2401",
    email: "tutosuccesbd@gmail.com",
    website: "www.tutosuccesbd.com",
    registrationNumber: "514-651-2401"
  };

  // Génération du numéro de facture
  const invoiceId = payment?.invoiceId || `TS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
  const invoiceDate = payment?.date ? new Date(payment.date) : new Date();
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 7); // 7 jours après émission

  // Calcul des totaux (pour l'instant sans taxes)
  const subtotal = payment?.amount || 0;
  const discountAmount = 0;
  const taxRateGST = 0; // TPS - à configurer si inscrit
  const taxRateQST = 0; // TVQ - à configurer si inscrit
  const taxAmountGST = subtotal * taxRateGST;
  const taxAmountQST = subtotal * taxRateQST;
  const totalDue = subtotal - discountAmount + taxAmountGST + taxAmountQST;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Facture de services de tutorat</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Facture détaillée pour vos séances de tutorat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6 bg-white" id="invoice-content">
          {/* En-tête avec logo/nom de la compagnie */}
          <div className="text-center border-b pb-4">
            <h1 className="text-3xl font-bold" style={{ color: '#E74C3C' }}>
              {companyInfo.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">Facture de services de tutorat</p>
          </div>

          {/* Informations compagnie et facture */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-sm mb-2" style={{ color: '#2E5CA8' }}>
                Informations Tuto-Succès B&D
              </h3>
              <div className="text-sm space-y-1 text-gray-700">
                <p>{companyInfo.name}</p>
                <p>{companyInfo.address}</p>
                <p>Téléphone : {companyInfo.phone}</p>
                <p>Courriel : {companyInfo.email}</p>
                <p>Site web : {companyInfo.website}</p>
                <p>Numéro d'entreprise : {companyInfo.registrationNumber}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2" style={{ color: '#2E5CA8' }}>
                Informations de la facture
              </h3>
              <div className="text-sm space-y-1 text-gray-700">
                <p><span className="font-medium">Numéro de facture :</span> {invoiceId}</p>
                <p><span className="font-medium">Date d'émission :</span> {invoiceDate.toLocaleDateString('fr-FR')}</p>
                <p><span className="font-medium">Date d'échéance :</span> {dueDate.toLocaleDateString('fr-FR')}</p>
                <p>
                  <span className="font-medium">Statut :</span>{' '}
                  <span className={payment?.status === 'completed' ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                    {payment?.status === 'completed' ? 'Payé' : 'À payer'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Informations client */}
          <div>
            <h3 className="font-semibold text-sm mb-2" style={{ color: '#2E5CA8' }}>
              Informations du client
            </h3>
            <div className="text-sm space-y-1 text-gray-700 bg-gray-50 p-3 rounded">
              <p><span className="font-medium">Nom du parent / responsable :</span> {payment?.clientName || 'À compléter'}</p>
              <p><span className="font-medium">Adresse :</span> {payment?.clientAddress || 'À compléter'}</p>
              <p><span className="font-medium">Courriel :</span> {payment?.clientEmail || 'À compléter'}</p>
              <p><span className="font-medium">Élève(s) concerné(s) :</span> {payment?.studentName || 'À compléter'}</p>
            </div>
          </div>

          {/* Détails des séances */}
          <div>
            <h3 className="font-semibold text-sm mb-2" style={{ color: '#2E5CA8' }}>
              Détails des séances
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Élève</th>
                    <th className="text-left p-3 font-medium">Matière</th>
                    <th className="text-right p-3 font-medium">Durée (h)</th>
                    <th className="text-right p-3 font-medium">Tarif horaire</th>
                    <th className="text-right p-3 font-medium">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.length > 0 ? (
                    sessions.map((session, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-3">{new Date(session.date).toLocaleDateString('fr-FR')}</td>
                        <td className="p-3">{session.student?.name || 'Élève'}</td>
                        <td className="p-3">{session.subject}</td>
                        <td className="text-right p-3">{session.duration}</td>
                        <td className="text-right p-3">{session.rate || 50} $</td>
                        <td className="text-right p-3">{((session.rate || 50) * session.duration).toFixed(2)} $</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t">
                      <td className="p-3">{invoiceDate.toLocaleDateString('fr-FR')}</td>
                      <td className="p-3">{payment?.studentName || 'Élève'}</td>
                      <td className="p-3">{payment?.subject || 'Tutorat'}</td>
                      <td className="text-right p-3">{payment?.duration || 2}</td>
                      <td className="text-right p-3">{payment?.rate || 50} $</td>
                      <td className="text-right p-3">{payment?.amount?.toFixed(2) || '0.00'} $</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total :</span>
                <span>{subtotal.toFixed(2)} $ CAD</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Rabais :</span>
                  <span>-{discountAmount.toFixed(2)} $</span>
                </div>
              )}
              {taxAmountGST > 0 && (
                <div className="flex justify-between text-sm">
                  <span>TPS ({(taxRateGST * 100).toFixed(1)}%) :</span>
                  <span>{taxAmountGST.toFixed(2)} $</span>
                </div>
              )}
              {taxAmountQST > 0 && (
                <div className="flex justify-between text-sm">
                  <span>TVQ ({(taxRateQST * 100).toFixed(1)}%) :</span>
                  <span>{taxAmountQST.toFixed(2)} $</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total à payer :</span>
                <span style={{ color: '#E74C3C' }}>{totalDue.toFixed(2)} $ CAD</span>
              </div>
            </div>
          </div>

          {/* Modes de paiement */}
          <div>
            <h3 className="font-semibold text-sm mb-2" style={{ color: '#2E5CA8' }}>
              Modes de paiement
            </h3>
            <div className="text-sm text-gray-700 space-y-2 bg-blue-50 p-3 rounded">
              <p>Le paiement peut être effectué de la manière suivante :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Carte de crédit : Visa ou Mastercard</li>
                <li>Interac (virement ou débit) : {companyInfo.email}</li>
              </ul>
              {payment?.status !== 'completed' && (
                <div className="mt-3">
                  <Button 
                    className="w-full" 
                    style={{ backgroundColor: '#2E5CA8' }}
                    onClick={() => alert('Redirection vers le système de paiement (à configurer)')}
                  >
                    Payer maintenant
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Conditions de paiement */}
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <span className="font-medium">Conditions de paiement :</span><br />
              Merci d'effectuer le paiement au plus tard le {dueDate.toLocaleDateString('fr-FR')}.
            </p>
            <p>
              Pour toute question concernant cette facture ou les séances de tutorat, vous pouvez nous joindre à{' '}
              <a href={`mailto:${companyInfo.email}`} className="text-blue-600 hover:underline">
                {companyInfo.email}
              </a>
              {' '}ou au {companyInfo.phone}.
            </p>
          </div>

          {/* Message de remerciement */}
          <div className="text-center border-t pt-4 mt-6">
            <p className="font-semibold" style={{ color: '#2C3E50' }}>
              Merci de votre confiance envers Tuto-Succès B&D.
            </p>
            <p className="text-sm text-gray-600 italic mt-1">
              L'effort, la persévérance et l'encadrement mènent à la réussite.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={handlePrint} style={{ backgroundColor: '#2E5CA8' }}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger / Imprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}