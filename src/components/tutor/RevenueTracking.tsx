import { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, Download, Eye, Clock, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { getMockPayrollRecords } from '../../utils/mockData';

interface RevenueTrackingProps {
  userId: string;
  accessToken: string;
}

export function RevenueTracking({ userId, accessToken }: RevenueTrackingProps) {
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    fetchPayrollRecords();
  }, []);

  async function fetchPayrollRecords() {
    try {
      const data = await getMockPayrollRecords(userId);
      setPayrollRecords(data);
    } catch (error) {
      console.error('Error fetching payroll records:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculer les statistiques
  const thisWeekRevenue = payrollRecords
    .filter(r => r.status === 'current')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const thisMonthRevenue = payrollRecords
    .filter(r => {
      const recordDate = new Date(r.periodEnd);
      const now = new Date();
      return recordDate.getMonth() === now.getMonth() && 
             recordDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const totalRevenue = payrollRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const totalHoursThisWeek = payrollRecords
    .filter(r => r.status === 'current')
    .reduce((sum, r) => sum + r.totalHours, 0);

  function downloadPayslip(record: any) {
    alert(`Téléchargement du relevé de paie pour la semaine du ${new Date(record.periodStart).toLocaleDateString('fr-FR')} au ${new Date(record.periodEnd).toLocaleDateString('fr-FR')}`);
    // En production, cela générerait un PDF
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des revenus...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
          Mes revenus
        </h2>
        <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
          Consultez vos relevés de paie et suivez vos revenus
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Semaine en cours</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#2E5CA8' }}>
              {thisWeekRevenue.toFixed(2)} $
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <Clock className="h-4 w-4" />
              {totalHoursThisWeek}h de cours
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ce mois</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#E74C3C' }}>
              {thisMonthRevenue.toFixed(2)} $
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <TrendingUp className="h-4 w-4" />
              En progression
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total versé</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#2C3E50' }}>
              {totalRevenue.toFixed(2)} $
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <CheckCircle className="h-4 w-4" />
              Paiements reçus
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Taux horaire moyen</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#2E5CA8' }}>
              35 $
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <DollarSign className="h-4 w-4" />
              Par heure
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relevés de paie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: '#2E5CA8' }} />
            Relevés de paie hebdomadaires
          </CardTitle>
          <CardDescription>
            Vos relevés sont générés chaque dimanche soir et le paiement est effectué le vendredi suivant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="current">En cours</TabsTrigger>
              <TabsTrigger value="pending">En attente</TabsTrigger>
              <TabsTrigger value="paid">Payés</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {payrollRecords.map((record) => (
                <PayrollRecordCard
                  key={record.id}
                  record={record}
                  onView={() => setSelectedRecord(record)}
                  onDownload={() => downloadPayslip(record)}
                />
              ))}
            </TabsContent>

            <TabsContent value="current" className="space-y-3">
              {payrollRecords
                .filter(r => r.status === 'current')
                .map((record) => (
                  <PayrollRecordCard
                    key={record.id}
                    record={record}
                    onView={() => setSelectedRecord(record)}
                    onDownload={() => downloadPayslip(record)}
                  />
                ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-3">
              {payrollRecords
                .filter(r => r.status === 'pending')
                .map((record) => (
                  <PayrollRecordCard
                    key={record.id}
                    record={record}
                    onView={() => setSelectedRecord(record)}
                    onDownload={() => downloadPayslip(record)}
                  />
                ))}
            </TabsContent>

            <TabsContent value="paid" className="space-y-3">
              {payrollRecords
                .filter(r => r.status === 'paid')
                .map((record) => (
                  <PayrollRecordCard
                    key={record.id}
                    record={record}
                    onView={() => setSelectedRecord(record)}
                    onDownload={() => downloadPayslip(record)}
                  />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogue de détails du relevé */}
      {selectedRecord && (
        <PayrollDetailDialog
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onDownload={() => downloadPayslip(selectedRecord)}
        />
      )}
    </div>
  );
}

// Composant pour afficher une carte de relevé de paie
function PayrollRecordCard({ record, onView, onDownload }: any) {
  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    current: { label: 'Semaine en cours', color: '#2E5CA8', bgColor: '#EBF4FF' },
    pending: { label: 'Paiement en attente', color: '#F39C12', bgColor: '#FEF3E2' },
    paid: { label: 'Payé', color: '#27AE60', bgColor: '#E8F8F0' }
  };

  const config = statusConfig[record.status] || statusConfig.pending;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" style={{ color: '#7F8C8D' }} />
              <div>
                <p className="font-semibold" style={{ color: '#2C3E50' }}>
                  Semaine du {new Date(record.periodStart).toLocaleDateString('fr-FR')} au {new Date(record.periodEnd).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>
                  Relevé #{record.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>Séances complétées</p>
                <p className="text-xl font-bold" style={{ color: '#2C3E50' }}>
                  {record.sessions.length}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>Heures totales</p>
                <p className="text-xl font-bold" style={{ color: '#2C3E50' }}>
                  {record.totalHours}h
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#7F8C8D' }}>Montant</p>
                <p className="text-2xl font-bold" style={{ color: '#2E5CA8' }}>
                  {record.totalAmount.toFixed(2)} $
                </p>
              </div>
            </div>

            <div>
              <Badge style={{ backgroundColor: config.bgColor, color: config.color, border: 'none' }}>
                {config.label}
              </Badge>
              {record.paymentDate && (
                <span className="ml-3 text-sm" style={{ color: '#7F8C8D' }}>
                  Payé le {new Date(record.paymentDate).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onView}>
              <Eye className="h-4 w-4 mr-2" />
              Détails
            </Button>
            {record.status !== 'current' && (
              <Button 
                size="sm" 
                onClick={onDownload}
                style={{ backgroundColor: '#E74C3C', color: 'white' }}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dialogue de détails du relevé
function PayrollDetailDialog({ record, onClose, onDownload }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
              Relevé de paie - Semaine du {new Date(record.periodStart).toLocaleDateString('fr-FR')}
            </h3>
            <p className="text-sm" style={{ color: '#7F8C8D' }}>
              Période : {new Date(record.periodStart).toLocaleDateString('fr-FR')} au {new Date(record.periodEnd).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Résumé */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm" style={{ color: '#7F8C8D' }}>Nombre de séances</p>
              <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                {record.sessions.length}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm" style={{ color: '#7F8C8D' }}>Heures totales</p>
              <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                {record.totalHours}h
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm" style={{ color: '#2E5CA8' }}>Montant total</p>
              <p className="text-2xl font-bold" style={{ color: '#2E5CA8' }}>
                {record.totalAmount.toFixed(2)} $
              </p>
            </div>
          </div>

          {/* Détails des séances */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: '#2C3E50' }}>
              Détail des séances
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: '#2C3E50' }}>Date</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: '#2C3E50' }}>Élève</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: '#2C3E50' }}>Matière</th>
                    <th className="text-right p-3 text-sm font-semibold" style={{ color: '#2C3E50' }}>Durée</th>
                    <th className="text-right p-3 text-sm font-semibold" style={{ color: '#2C3E50' }}>Taux</th>
                    <th className="text-right p-3 text-sm font-semibold" style={{ color: '#2C3E50' }}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {record.sessions.map((session: any, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 text-sm" style={{ color: '#2C3E50' }}>
                        {new Date(session.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3 text-sm" style={{ color: '#2C3E50' }}>
                        {session.studentName}
                      </td>
                      <td className="p-3 text-sm" style={{ color: '#2C3E50' }}>
                        {session.subject}
                      </td>
                      <td className="p-3 text-sm text-right" style={{ color: '#2C3E50' }}>
                        {session.duration}h
                      </td>
                      <td className="p-3 text-sm text-right" style={{ color: '#2C3E50' }}>
                        {session.rate} $
                      </td>
                      <td className="p-3 text-sm text-right font-semibold" style={{ color: '#2E5CA8' }}>
                        {session.amount.toFixed(2)} $
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2">
                  <tr>
                    <td colSpan={3} className="p-3 text-sm font-semibold" style={{ color: '#2C3E50' }}>
                      Total
                    </td>
                    <td className="p-3 text-sm text-right font-semibold" style={{ color: '#2C3E50' }}>
                      {record.totalHours}h
                    </td>
                    <td className="p-3"></td>
                    <td className="p-3 text-sm text-right font-bold" style={{ color: '#2E5CA8' }}>
                      {record.totalAmount.toFixed(2)} $
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Note de paiement */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm" style={{ color: '#2E5CA8' }}>
              <strong>Note :</strong> {record.status === 'current' 
                ? 'Ce relevé est pour la semaine en cours. Il sera finalisé dimanche soir.'
                : record.status === 'pending'
                ? 'Le paiement sera effectué le vendredi suivant la fin de la période.'
                : `Paiement effectué le ${new Date(record.paymentDate).toLocaleDateString('fr-FR')}.`
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            {record.status !== 'current' && (
              <Button 
                onClick={onDownload}
                style={{ backgroundColor: '#E74C3C', color: 'white' }}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le relevé
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
