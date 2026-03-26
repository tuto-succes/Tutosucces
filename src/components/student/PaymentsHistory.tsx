import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertTriangle, Wallet, ReceiptText, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../app/core/supabase.client';
import { getPaymentDeadlineInfo } from '../../utils/paymentDeadline';
import { ensureInvoiceForCompletedSession, fetchInvoicesByIds, fetchInvoiceBySessionId, markInvoicePaidForSession, type SiteInvoice } from '../../utils/invoiceHelpers';
import { InvoiceDialog } from './InvoiceDialog';

interface PaymentsHistoryProps {
  userId: string;
  accessToken?: string;
}

function getDeadlineBadge(sessionDate: string | null, paymentStatus: string | null) {
  const info = getPaymentDeadlineInfo(sessionDate, paymentStatus);

  if (info.status === 'late') {
    return { label: info.label, color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: 'alert' as const };
  }

  if (info.status === 'due_today') {
    return { label: info.label, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: 'alert' as const };
  }

  if (info.status === 'paid') {
    return { label: 'Payé', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: 'paid' as const };
  }

  if (!sessionDate) {
    return { label: 'À payer', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: 'clock' as const };
  }

  return { label: info.label, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: 'clock' as const };
}

export function PaymentsHistory({ userId }: PaymentsHistoryProps) {
  const [tab, setTab] = useState<'unpaid' | 'history'>('unpaid');
  const [unpaidSessions, setUnpaidSessions] = useState<any[]>([]);
  const [paidSessions, setPaidSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<SiteInvoice | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  async function fetchSessions() {
    setLoading(true);

    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('id, student_id, subject, session_date, start_time, end_time, duration_minutes, total_price, payment_status, completed_at, tutor_id')
      .eq('student_id', userId)
      .eq('status', 'completed')
      .order('session_date', { ascending: false });

    const sessions = sessionsData || [];
    const tutorIds = [...new Set(sessions.map((session: any) => session.tutor_id))];

    const { data: tutors } = tutorIds.length > 0
      ? await supabase.from('profiles').select('id, name').in('id', tutorIds)
      : { data: [] };

    const tutorMap: Record<string, string> = {};
    (tutors || []).forEach((tutor: any) => {
      tutorMap[tutor.id] = tutor.name;
    });

    const sessionIds = sessions.map((session: any) => session.id);
    const { data: payments } = sessionIds.length > 0
      ? await supabase.from('payments').select('session_id, invoice_id').in('session_id', sessionIds)
      : { data: [] };

    const invoiceIds = [...new Set((payments || []).map((payment: any) => payment.invoice_id).filter(Boolean))];
    const invoices = await fetchInvoicesByIds(invoiceIds);
    const invoiceMap = new Map(invoices.map(invoice => [invoice.invoiceId, invoice]));
    const paymentMap = new Map((payments || []).map((payment: any) => [payment.session_id, payment.invoice_id]));

    const enrichedSessions = sessions.map((session: any) => {
      const invoiceId = paymentMap.get(session.id);
      const invoice = invoiceId ? invoiceMap.get(invoiceId) || null : null;

      return {
        ...session,
        tutor_name: tutorMap[session.tutor_id] || 'Tuteur',
        invoice,
      };
    });

    setUnpaidSessions(enrichedSessions.filter((session: any) => session.payment_status !== 'paid'));
    setPaidSessions(enrichedSessions.filter((session: any) => session.payment_status === 'paid'));
    setLoading(false);
  }

  async function handlePay(session: any) {
    setPaying(session.id);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const paidAt = new Date().toISOString();

    const { error } = await supabase
      .from('sessions')
      .update({ payment_status: 'paid' })
      .eq('id', session.id);

    if (!error) {
      await markInvoicePaidForSession(session.id, 'Stripe', paidAt);
      await fetchSessions();
    }

    setPaying(null);
  }

  async function handleViewInvoice(session: any) {
    let invoice = session.invoice || await fetchInvoiceBySessionId(session.id);

    if (!invoice) {
      await ensureInvoiceForCompletedSession({
        id: session.id,
        student_id: session.student_id || userId,
        tutor_id: session.tutor_id,
        subject: session.subject,
        session_date: session.session_date,
        duration_minutes: session.duration_minutes,
        total_price: session.total_price,
        completed_at: session.completed_at,
      });

      if (session.payment_status === 'paid') {
        await markInvoicePaidForSession(session.id, 'Stripe', session.completed_at || new Date().toISOString());
      }

      invoice = await fetchInvoiceBySessionId(session.id);
      await fetchSessions();
    }

    if (!invoice) {
      alert("Aucune facture n'est encore disponible pour cette séance.");
      return;
    }

    setSelectedInvoice(invoice);
    setIsInvoiceOpen(true);
  }

  function formatDate(date: string) {
    return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });
  }

  const totalUnpaid = unpaidSessions.reduce((sum, session) => sum + (session.total_price || 0), 0);
  const totalPaid = paidSessions.reduce((sum, session) => sum + (session.total_price || 0), 0);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">Paiements</h2>
            <p className="mt-1 text-sm text-slate-500">
              Suivez vos séances à payer, consultez vos factures et conservez votre historique.
            </p>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">À payer</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{totalUnpaid.toFixed(2)} $</p>
                  <p className="mt-2 text-sm text-amber-700">
                    {unpaidSessions.length} séance{unpaidSessions.length !== 1 ? 's' : ''} en attente
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-3 text-amber-600 shadow-sm">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Total payé</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{totalPaid.toFixed(2)} $</p>
                  <p className="mt-2 text-sm text-emerald-700">
                    {paidSessions.length} séance{paidSessions.length !== 1 ? 's' : ''} réglée{paidSessions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-3 text-emerald-600 shadow-sm">
                  <ReceiptText className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1">
              {(['unpaid', 'history'] as const).map(currentTab => (
                <button
                  key={currentTab}
                  onClick={() => setTab(currentTab)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    tab === currentTab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {currentTab === 'unpaid'
                    ? <>À payer {unpaidSessions.length > 0 && <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-xs text-white">{unpaidSessions.length}</span>}</>
                    : 'Historique'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 pt-5">
            {tab === 'unpaid' && (
              <div className="space-y-4">
                {unpaidSessions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="text-lg font-semibold text-slate-800">Aucun paiement en attente</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Tout est à jour pour le moment. Les nouvelles séances terminées apparaîtront ici.
                    </p>
                  </div>
                ) : unpaidSessions.map(session => {
                  const badge = getDeadlineBadge(session.session_date, session.payment_status);
                  const isPaying = paying === session.id;

                  return (
                    <div key={session.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-semibold text-slate-900">{session.subject}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${badge.bg} ${badge.color}`}>
                              {badge.icon === 'alert' ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              {badge.label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {formatDate(session.session_date)} · {session.tutor_name} · {session.duration_minutes} min
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xl font-bold text-slate-900">{(session.total_price || 0).toFixed(2)} $</span>
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            size="sm"
                            onClick={() => handleViewInvoice(session)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Voir la facture
                          </Button>
                          <Button
                            onClick={() => handlePay(session)}
                            disabled={isPaying}
                            className="rounded-xl bg-[#2E5CA8] px-4 text-white hover:bg-[#254b8b]"
                            size="sm"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            {isPaying ? 'Traitement...' : 'Payer'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'history' && (
              <div className="space-y-4">
                {paidSessions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
                      <ReceiptText className="h-8 w-8 text-slate-500" />
                    </div>
                    <p className="text-lg font-semibold text-slate-800">Aucun paiement effectué</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Vos paiements confirmés apparaîtront dans cet historique.
                    </p>
                  </div>
                ) : paidSessions.map(session => (
                  <div key={session.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-semibold text-slate-900">{session.subject}</span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Payé via Stripe
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {formatDate(session.session_date)} · {session.tutor_name} · {session.duration_minutes} min
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xl font-bold text-slate-900">{(session.total_price || 0).toFixed(2)} $</span>
                        <Button variant="outline" className="rounded-xl" size="sm" onClick={() => handleViewInvoice(session)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Voir le reçu
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <InvoiceDialog
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        invoice={selectedInvoice}
      />
    </>
  );
}
