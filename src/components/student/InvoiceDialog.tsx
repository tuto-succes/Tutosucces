import { Download, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import type { SiteInvoice } from '../../utils/invoiceHelpers';

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SiteInvoice | null;
}

const companyInfo = {
  name: 'Tuto-Succès B&D',
  address: 'En ligne',
  phone: '514-651-2401',
  email: 'tutosuccesbd@gmail.com',
  website: 'www.tutosuccesbd.com',
  registrationNumber: '514-651-2401',
  paymentMethodsText: 'Visa, Mastercard ou Interac',
};

export function InvoiceDialog({ isOpen, onClose, invoice }: InvoiceDialogProps) {
  function handlePrint() {
    window.print();
  }

  if (!invoice) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Facture de services de tutorat</DialogTitle>
              <DialogDescription>
                Consultez votre facture détaillée et conservez-la pour vos dossiers.
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6" id="invoice-content">
          <div className="border-b border-slate-200 pb-5 text-center">
            <h1 className="text-3xl font-bold text-slate-900">{companyInfo.name}</h1>
            <p className="mt-1 text-sm text-slate-500">Facture de services de tutorat</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Informations Tuto-Succes B&D
              </h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p>{companyInfo.name}</p>
                <p>{companyInfo.address}</p>
                <p>Téléphone : {companyInfo.phone}</p>
                <p>Courriel : {companyInfo.email}</p>
                <p>Site web : {companyInfo.website}</p>
                <p>Numéro d'entreprise : {companyInfo.registrationNumber}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Informations de la facture
              </h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p><strong>Numéro de facture :</strong> {invoice.invoiceId}</p>
                <p><strong>Date d'émission :</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
                <p><strong>Date d'échéance :</strong> {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                <p><strong>Statut :</strong> {invoice.paymentStatus}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
              Informations du client
            </h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><strong>Nom du parent / responsable :</strong> {invoice.clientName}</p>
              <p><strong>Adresse :</strong> En ligne</p>
              <p><strong>Courriel :</strong> {invoice.clientEmail}</p>
              <p><strong>Élève(s) concerné(s) :</strong> {invoice.studentName}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
              Détails des séances
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Élève</th>
                    <th className="px-4 py-3 text-left font-medium">Matière</th>
                    <th className="px-4 py-3 text-right font-medium">Durée (h)</th>
                    <th className="px-4 py-3 text-right font-medium">Tarif horaire</th>
                    <th className="px-4 py-3 text-right font-medium">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, index) => (
                    <tr key={`${item.date}-${index}`} className="border-t border-slate-200">
                      <td className="px-4 py-3">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3">{item.studentName}</td>
                      <td className="px-4 py-3">{item.subject}</td>
                      <td className="px-4 py-3 text-right">{item.durationHours}</td>
                      <td className="px-4 py-3 text-right">{item.rate.toFixed(2)} $</td>
                      <td className="px-4 py-3 text-right font-medium">{item.total.toFixed(2)} $</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="ml-auto max-w-md space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Sous-total :</span>
                <span>{invoice.subtotal.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between">
                <span>Rabais :</span>
                <span>{invoice.discountAmount.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between">
                <span>TPS :</span>
                <span>{invoice.taxAmountGST.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between">
                <span>TVQ :</span>
                <span>{invoice.taxAmountQST.toFixed(2)} $</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>Total à payer :</span>
                <span>{invoice.totalDue.toFixed(2)} $</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
            <h3 className="mb-2 font-semibold text-slate-900">Modes de paiement</h3>
            <p>{companyInfo.paymentMethodsText}</p>
            <p className="mt-2">Interac : {companyInfo.email}</p>
            {invoice.paymentLinkUrl ? (
              <p className="mt-3 text-slate-600">
                Un lien de paiement Stripe sera utilise ici plus tard : {invoice.paymentLinkUrl}
              </p>
            ) : (
              <p className="mt-3 text-slate-600">
                Le lien de paiement Stripe pourra être ajouté plus tard sans changer le format de la facture.
              </p>
            )}
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <strong>Conditions de paiement :</strong> Merci d'effectuer le paiement au plus tard le{' '}
              {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}.
            </p>
            <p>
              Pour toute question concernant cette facture ou les séances de tutorat, vous pouvez nous joindre à {companyInfo.email} ou au {companyInfo.phone}.
            </p>
          </div>

          <div className="border-t border-slate-200 pt-4 text-center">
            <p className="font-medium text-slate-900">Merci de votre confiance envers Tuto-Succès B&D.</p>
            <p className="mt-1 text-sm text-slate-500">
              L'effort, la persévérance et l'encadrement mènent à la réussite.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <Button onClick={handlePrint} className="bg-[#2E5CA8] text-white hover:bg-[#254b8b]">
            <Download className="mr-2 h-4 w-4" />
            Télécharger / Imprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
