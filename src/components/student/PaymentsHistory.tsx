import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../app/core/supabase.client';

interface PaymentsHistoryProps {
  userId: string;
  accessToken?: string;
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let count = 0;
  while (count < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return result;
}

function getDeadlineInfo(completedAt: string | null) {
  if (!completedAt) return { label: 'À payer', color: 'text-gray-500', bg: 'bg-gray-50', icon: 'clock' };
  const due = addBusinessDays(new Date(completedAt), 3);
  const now = new Date();
  const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: `En retard (${Math.abs(daysLeft)}j)`, color: 'text-red-600', bg: 'bg-red-50', icon: 'alert' };
  if (daysLeft === 0) return { label: "Dû aujourd'hui", color: 'text-orange-600', bg: 'bg-orange-50', icon: 'alert' };
  return { label: `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}`, color: 'text-blue-600', bg: 'bg-blue-50', icon: 'clock' };
}

export function PaymentsHistory({ userId }: PaymentsHistoryProps) {
  const [tab, setTab] = useState<'unpaid' | 'history'>('unpaid');
  const [unpaidSessions, setUnpaidSessions] = useState<any[]>([]);
  const [paidSessions, setPaidSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => { fetchSessions(); }, [userId]);

  async function fetchSessions() {
    setLoading(true);
    const { data } = await supabase
      .from('sessions')
      .select('id, subject, session_date, start_time, end_time, duration_minutes, total_price, payment_status, completed_at, tutor_id')
      .eq('student_id', userId)
      .eq('status', 'completed')
      .order('session_date', { ascending: false });

    const tutorIds = [...new Set((data || []).map((s: any) => s.tutor_id))];
    const { data: tutors } = tutorIds.length > 0
      ? await supabase.from('profiles').select('id, name').in('id', tutorIds)
      : { data: [] };
    const tutorMap: Record<string, string> = {};
    (tutors || []).forEach((t: any) => { tutorMap[t.id] = t.name; });

    const sessions = (data || []).map((s: any) => ({ ...s, tutor_name: tutorMap[s.tutor_id] || 'Tuteur' }));
    setUnpaidSessions(sessions.filter((s: any) => s.payment_status !== 'paid'));
    setPaidSessions(sessions.filter((s: any) => s.payment_status === 'paid'));
    setLoading(false);
  }

  async function handlePay(session: any) {
    setPaying(session.id);
    // Simulation Stripe — délai réaliste
    await new Promise(r => setTimeout(r, 1500));

    const { error } = await supabase
      .from('sessions')
      .update({ payment_status: 'paid' })
      .eq('id', session.id);

    if (!error) {
      await supabase.from('payments').insert({
        student_id: userId,
        tutor_id: session.tutor_id,
        amount: session.total_price,
        status: 'completed',
        payment_date: new Date().toISOString(),
        method: 'Stripe',
        subject: session.subject,
        duration: session.duration_minutes / 60,
        rate: session.total_price / (session.duration_minutes / 60),
      });
      await fetchSessions();
    }
    setPaying(null);
  }

  function formatDate(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
  }

  const totalUnpaid = unpaidSessions.reduce((sum, s) => sum + (s.total_price || 0), 0);
  const totalPaid = paidSessions.reduce((sum, s) => sum + (s.total_price || 0), 0);

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-6">

      {/* Résumé */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm text-orange-600 font-medium">À payer</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{totalUnpaid.toFixed(2)} $</p>
          <p className="text-xs text-orange-500 mt-1">{unpaidSessions.length} séance{unpaidSessions.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">Total payé</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{totalPaid.toFixed(2)} $</p>
          <p className="text-xs text-green-500 mt-1">{paidSessions.length} séance{paidSessions.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['unpaid', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'unpaid' ? <>À payer {unpaidSessions.length > 0 && <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5">{unpaidSessions.length}</span>}</> : 'Historique'}
          </button>
        ))}
      </div>

      {/* À payer */}
      {tab === 'unpaid' && (
        <div className="space-y-3">
          {unpaidSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
              <p className="font-medium text-gray-600">Aucun paiement en attente</p>
            </div>
          ) : unpaidSessions.map(session => {
            const info = getDeadlineInfo(session.completed_at);
            const isPaying = paying === session.id;
            return (
              <div key={session.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{session.subject}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${info.bg} ${info.color}`}>
                      {info.icon === 'alert' ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {info.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(session.session_date)} · {session.tutor_name} · {session.duration_minutes} min</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-lg font-bold text-gray-900">{(session.total_price || 0).toFixed(2)} $</span>
                  <Button onClick={() => handlePay(session)} disabled={isPaying} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isPaying ? 'Traitement Stripe...' : 'Payer'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historique */}
      {tab === 'history' && (
        <div className="space-y-3">
          {paidSessions.length === 0
            ? <p className="text-center py-12 text-gray-400">Aucun paiement effectué</p>
            : paidSessions.map(session => (
              <div key={session.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{session.subject}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Payé via Stripe
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(session.session_date)} · {session.tutor_name} · {session.duration_minutes} min</p>
                </div>
                <span className="text-lg font-bold text-gray-900 ml-4">{(session.total_price || 0).toFixed(2)} $</span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
