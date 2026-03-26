import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Receipt, Search, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import jsPDF from 'jspdf';
import { supabase } from '../../app/core/supabase.client';
import { getPaymentDeadlineInfo } from '../../utils/paymentDeadline';

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
  status: 'completed' | 'pending' | 'late';
  invoiceNumber: string;
}

export function AdminFinances() {
  const [payments, setPayments] = useState<ParentPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<ParentPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'late'>('all');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    latePayments: 0,
  });

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
    calculateStats();
  }, [payments, searchTerm, filterStatus]);

  async function loadPayments() {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, student_id, tutor_id, subject, session_date, start_time, duration_minutes, total_price, payment_status, completed_at, status')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des paiements admin:', error);
      return;
    }

    const studentIds = [...new Set((sessions || []).map((s: any) => s.student_id))];
    const tutorIds = [...new Set((sessions || []).map((s: any) => s.tutor_id))];
    const profileIds = [...new Set([...studentIds, ...tutorIds])];

    const { data: profiles } = profileIds.length > 0
      ? await supabase.from('profiles').select('id, name, email, phone').in('id', profileIds)
      : { data: [] };

    const { data: paymentRows } = await supabase
      .from('payments')
      .select('session_id, payment_date, method, status');

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });

    const paymentMap: Record<string, any> = {};
    (paymentRows || []).forEach((p: any) => {
      if (p.session_id) paymentMap[p.session_id] = p;
    });

    const mapped: ParentPayment[] = (sessions || []).map((session: any) => {
      const studentProfile = profileMap[session.student_id] || {};
      const tutorProfile = profileMap[session.tutor_id] || {};
      const paymentRow = paymentMap[session.id];
      const deadline = getPaymentDeadlineInfo(session.session_date, session.payment_status);

      let status: ParentPayment['status'] = 'pending';
      if (session.payment_status === 'paid') status = 'completed';
      else if (deadline.status === 'late') status = 'late';

      const duration = (session.duration_minutes || 0) / 60;
      const hourlyRate = duration > 0 ? Number(session.total_price) / duration : Number(session.total_price);
      const invoiceDateBase = session.completed_at || session.session_date;
      const invoiceDate = new Date(invoiceDateBase);
      const invoiceNumber = `PAY-${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${String(invoiceDate.getDate()).padStart(2, '0')}-${String(session.id).slice(0, 8).toUpperCase()}`;

      return {
        id: session.id,
        parentName: studentProfile.name || 'Parent',
        studentName: studentProfile.name || 'Élève',
        studentId: session.student_id,
        email: studentProfile.email || '',
        phone: studentProfile.phone || '',
        sessionDate: session.session_date,
        sessionTime: session.start_time,
        tutorName: tutorProfile.name || 'Tuteur',
        tutorId: session.tutor_id,
        subject: session.subject,
        duration,
        hourlyRate,
        amount: Number(session.total_price || 0),
        paymentDate: paymentRow?.payment_date || null,
        paymentMethod: paymentRow?.method || null,
        status,
        invoiceNumber,
      };
    });

    setPayments(mapped);
  }

  function filterPayments() {
    let filtered = payments;
    if (filterStatus !== 'all') filtered = filtered.filter(p => p.status === filterStatus);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.parentName.toLowerCase().includes(q) ||
        p.studentName.toLowerCase().includes(q) ||
        p.invoiceNumber.toLowerCase().includes(q) ||
        p.tutorName.toLowerCase().includes(q)
      );
    }
    setFilteredPayments(filtered);
  }

  function calculateStats() {
    const completed = payments.filter(p => p.status === 'completed');
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRevenue = completed
      .filter(p => { const d = new Date(p.paymentDate || ''); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
      .reduce((sum, p) => sum + p.amount, 0);

    const yearlyRevenue = completed
      .filter(p => new Date(p.paymentDate || '').getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.amount, 0);

    setStats({
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      completedPayments: completed.length,
      latePayments: payments.filter(p => p.status === 'late').length,
    });
  }

  function downloadReceipt(payment: ParentPayment) {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(46, 92, 168);
    doc.text('TUTO-SUCCES B&D', 105, 20, { align: 'center' });
    doc.setFontSize(14); doc.setTextColor(44, 62, 80);
    doc.text('RECU DE PAIEMENT', 105, 30, { align: 'center' });
    doc.setDrawColor(224, 224, 224); doc.line(20, 35, 190, 35);
    doc.setFontSize(10); doc.setTextColor(127, 140, 141);
    doc.text(`Numero de recu: ${payment.invoiceNumber}`, 20, 45);
    doc.text(`Date: ${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('fr-CA') : 'En attente'}`, 20, 52);
    doc.setFontSize(12); doc.setTextColor(44, 62, 80);
    doc.text('INFORMATION CLIENT', 20, 65); doc.line(20, 67, 190, 67);
    doc.setFontSize(10); doc.setTextColor(60, 60, 60);
    doc.text(`Parent/Tuteur legal: ${payment.parentName}`, 20, 75);
    doc.text(`Eleve: ${payment.studentName}`, 20, 82);
    doc.text(`Email: ${payment.email || '-'}`, 20, 89);
    doc.text(`Telephone: ${payment.phone || '-'}`, 20, 96);
    doc.setFontSize(12); doc.setTextColor(44, 62, 80);
    doc.text('DETAILS DE LA SEANCE', 20, 110); doc.line(20, 112, 190, 112);
    doc.setFontSize(10); doc.setTextColor(60, 60, 60);
    doc.text(`Date: ${new Date(`${payment.sessionDate}T12:00:00`).toLocaleDateString('fr-CA')}`, 20, 120);
    doc.text(`Heure: ${payment.sessionTime}`, 20, 127);
    doc.text(`Tuteur: ${payment.tutorName}`, 20, 134);
    doc.text(`Matiere: ${payment.subject}`, 20, 141);
    doc.text(`Duree: ${payment.duration}h`, 20, 148);
    doc.setFontSize(12); doc.setTextColor(44, 62, 80);
    doc.text('DETAILS DU PAIEMENT', 20, 162); doc.line(20, 164, 190, 164);
    doc.setFontSize(10); doc.setTextColor(60, 60, 60);
    doc.text(`Taux horaire: ${payment.hourlyRate.toFixed(2)}$/h`, 20, 172);
    doc.text(`Duree: ${payment.duration}h`, 20, 179);
    doc.text(`Mode: ${payment.paymentMethod || 'Stripe'}`, 20, 186);
    doc.setFontSize(16); doc.setTextColor(16, 185, 129);
    doc.text(`MONTANT TOTAL: ${payment.amount.toFixed(2)}$ CAD`, 20, 200);
    doc.setDrawColor(224, 224, 224); doc.line(20, 260, 190, 260);
    doc.setFontSize(9); doc.setTextColor(127, 140, 141);
    doc.text('Tuto-Succes B&D', 105, 268, { align: 'center' });
    doc.text('Email: tutosuccesbd@gmail.com  |  Tel: 514-651-2401', 105, 274, { align: 'center' });
    doc.save(`${payment.invoiceNumber}_${payment.studentName.replace(/\s+/g, '_')}.pdf`);
  }

  function downloadAllReceipts() {
    const completed = payments.filter(p => p.status === 'completed');
    if (completed.length === 0) { alert('Aucun paiement complété à exporter'); return; }
    const year = new Date().getFullYear();
    const text = `TUTO-SUCCES B&D\nRAPPORT ANNUEL ${year}\n\nDate: ${new Date().toLocaleDateString('fr-CA')}\nTotal paiements: ${completed.length}\nRevenu annuel: ${stats.yearlyRevenue.toFixed(2)}$ CAD\n\n${completed.map((p, i) => `${i + 1}. ${p.invoiceNumber}\n   Date: ${new Date(p.paymentDate || '').toLocaleDateString('fr-CA')}\n   Parent: ${p.parentName}\n   Élève: ${p.studentName}\n   Matière: ${p.subject}\n   Tuteur: ${p.tutorName}\n   Montant: ${p.amount.toFixed(2)}$`).join('\n\n')}\n\nTOTAL ${year}: ${stats.yearlyRevenue.toFixed(2)}$ CAD`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Rapport_Annuel_${year}_TutoSucces.txt`; a.click();
    window.URL.revokeObjectURL(url);
  }

  function formatDate(d: string) {
    return new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
  }

  function getStatusBadge(payment: ParentPayment) {
    if (payment.status === 'completed') return <Badge style={{ backgroundColor: '#D1FAE5', color: '#10b981', border: 'none' }}>Payé</Badge>;
    if (payment.status === 'late') return <Badge style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none' }}>Retard de paiement</Badge>;
    return <Badge style={{ backgroundColor: '#FEF3E2', color: '#F39C12', border: 'none' }}>En attente</Badge>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Paiements des élèves</h3>
          <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
            Revenus encaissés par Tuto-Succès B&D — les paiements des parents sont versés à la compagnie
          </p>
        </div>
        <Button onClick={downloadAllReceipts} style={{ backgroundColor: '#10b981', color: 'white' }}>
          <Download className="h-4 w-4 mr-2" />
          Rapport annuel {new Date().getFullYear()}
        </Button>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Revenu total</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#10b981' }}>{stats.totalRevenue.toFixed(2)}$</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <DollarSign className="h-4 w-4" />Paiements encaissés
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Année {new Date().getFullYear()}</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#2E5CA8' }}>{stats.yearlyRevenue.toFixed(2)}$</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <TrendingUp className="h-4 w-4" />Revenu annuel
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ce mois</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#E74C3C' }}>{stats.monthlyRevenue.toFixed(2)}$</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <Calendar className="h-4 w-4" />{new Date().toLocaleDateString('fr-FR', { month: 'long' })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>En attente</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#F39C12' }}>{stats.pendingPayments}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <Receipt className="h-4 w-4" />Paiements à recevoir
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>En retard</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#DC2626' }}>{stats.latePayments}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
              <AlertTriangle className="h-4 w-4" />Retards de paiement
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#7F8C8D' }} />
              <Input
                placeholder="Rechercher par parent, élève, tuteur ou numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'completed', 'pending', 'late'] as const).map(s => (
                <Button
                  key={s}
                  variant={filterStatus === s ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(s)}
                  style={filterStatus === s ? {
                    backgroundColor: s === 'all' ? '#2E5CA8' : s === 'completed' ? '#10b981' : s === 'pending' ? '#F39C12' : '#DC2626',
                    color: 'white'
                  } : {}}
                >
                  {s === 'all' ? 'Tous' : s === 'completed' ? 'Payés' : s === 'pending' ? 'En attente' : 'En retard'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" style={{ color: '#2E5CA8' }} />
            Paiements élèves ({filteredPayments.length})
          </CardTitle>
          <CardDescription>
            Toutes les séances terminées avec leur statut de paiement — versements reçus par la compagnie
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
              filteredPayments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium" style={{ color: '#2C3E50' }}>
                        {payment.parentName} ({payment.studentName})
                      </span>
                      <Badge variant="outline" style={{ borderColor: '#7F8C8D', color: '#7F8C8D' }}>
                        {payment.invoiceNumber}
                      </Badge>
                      {getStatusBadge(payment)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                      <div><strong>Séance :</strong> {new Date(`${payment.sessionDate}T12:00:00`).toLocaleDateString('fr-CA')} à {payment.sessionTime}</div>
                      <div><strong>Tuteur :</strong> {payment.tutorName}</div>
                      <div><strong>Matière :</strong> {payment.subject}</div>
                      <div><strong>Durée :</strong> {payment.duration}h @ {payment.hourlyRate.toFixed(2)}$/h</div>
                      {payment.paymentDate ? (
                        <div className="col-span-2"><strong>Payé le :</strong> {formatDate(payment.paymentDate)}{payment.paymentMethod ? ` — ${payment.paymentMethod}` : ''}</div>
                      ) : (
                        <div className="col-span-2"><strong>Statut :</strong> {payment.status === 'late' ? 'Retard de paiement' : 'Paiement en attente'}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <p className="text-2xl font-bold" style={{ color: payment.status === 'completed' ? '#10b981' : payment.status === 'late' ? '#DC2626' : '#F39C12' }}>
                      {payment.amount.toFixed(2)}$
                    </p>
                    {payment.status === 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => downloadReceipt(payment)} style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}>
                        <Download className="h-4 w-4 mr-2" />Reçu
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
