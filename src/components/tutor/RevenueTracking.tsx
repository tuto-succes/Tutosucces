import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Clock, FileText, CheckCircle, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { supabase } from '../../app/core/supabase.client';

interface RevenueTrackingProps {
  userId: string;
  accessToken: string;
}

export function RevenueTracking({ userId }: RevenueTrackingProps) {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [currentWeekSessions, setCurrentWeekSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [userId]);

  async function fetchData() {
    setLoading(true);

    // Semaine en cours (lundi → dimanche)
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];

    // Séances complétées cette semaine
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('id, subject, session_date, duration_minutes, total_price, price_per_hour, student_id')
      .eq('tutor_id', userId)
      .eq('status', 'completed')
      .gte('session_date', mondayStr)
      .lte('session_date', sundayStr);

    const studentIds = [...new Set((sessionsData || []).map((s: any) => s.student_id))];
    let studentMap: Record<string, string> = {};
    if (studentIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', studentIds);
      (profiles || []).forEach((p: any) => { studentMap[p.id] = p.name; });
    }

    const sessions = (sessionsData || []).map((s: any) => ({
      ...s,
      student_name: studentMap[s.student_id] || 'Élève',
    }));
    setCurrentWeekSessions(sessions);

    // Fiches de paie (tutor_payouts)
    const { data: payoutsData, error } = await supabase
      .from('tutor_payouts')
      .select('*')
      .eq('tutor_id', userId)
      .order('period_end', { ascending: false });

    console.log('💰 tutor_payouts query — userId:', userId, 'data:', payoutsData, 'error:', error);

    if (!error && payoutsData) {
      // Pour chaque payout, charger les séances incluses
      const payoutsWithSessions = await Promise.all(
        payoutsData.map(async (payout: any) => {
          if (!payout.session_ids || payout.session_ids.length === 0) {
            return { ...payout, sessions: [] };
          }
          const { data: pSessions } = await supabase
            .from('sessions')
            .select('id, subject, session_date, duration_minutes, total_price, price_per_hour, student_id')
            .in('id', payout.session_ids);

          const sIds = [...new Set((pSessions || []).map((s: any) => s.student_id))];
          let sMap: Record<string, string> = {};
          if (sIds.length > 0) {
            const { data: profs } = await supabase.from('profiles').select('id, name').in('id', sIds);
            (profs || []).forEach((p: any) => { sMap[p.id] = p.name; });
          }

          return {
            ...payout,
            sessions: (pSessions || []).map((s: any) => ({
              ...s,
              student_name: sMap[s.student_id] || 'Élève',
            })),
          };
        })
      );
      setPayouts(payoutsWithSessions);
    }

    setLoading(false);
  }

  function formatDate(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  const currentWeekTotal = currentWeekSessions.reduce((s, x) => s + (x.total_price || 0), 0);
  const currentWeekHours = currentWeekSessions.reduce((s, x) => s + (x.duration_minutes || 0), 0) / 60;
  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  const pendingPayout = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    paid:    { label: 'Payé',             color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
    pending: { label: 'En attente',       color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mes revenus</h2>
        <p className="text-sm text-gray-500 mt-1">Vos fiches de paie et séances de la semaine</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Semaine en cours</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{currentWeekTotal.toFixed(2)} $</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">{currentWeekSessions.length} séance{currentWeekSessions.length !== 1 ? 's' : ''} · {currentWeekHours.toFixed(1)}h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> En attente</CardDescription>
            <CardTitle className="text-2xl text-orange-500">{pendingPayout.toFixed(2)} $</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Virement en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Total versé</CardDescription>
            <CardTitle className="text-2xl text-green-600">{totalPaid.toFixed(2)} $</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">{payouts.filter(p => p.status === 'paid').length} virement{payouts.filter(p => p.status === 'paid').length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Total fiches</CardDescription>
            <CardTitle className="text-2xl text-gray-700">{payouts.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Depuis le début</p>
          </CardContent>
        </Card>
      </div>

      {/* Séances semaine en cours */}
      {currentWeekSessions.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Séances cette semaine (non encore versées)
            </CardTitle>
            <CardDescription>Ces séances seront incluses dans votre prochaine fiche de paie dimanche</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentWeekSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium text-gray-800">{s.student_name}</span>
                    <span className="text-gray-500 ml-2">· {s.subject} · {formatDate(s.session_date)} · {Math.round(s.duration_minutes / 60 * 10) / 10}h</span>
                  </div>
                  <span className="font-semibold text-blue-600">{(s.total_price || 0).toFixed(2)} $</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-semibold text-gray-800">
                <span>Total semaine</span>
                <span className="text-blue-600">{currentWeekTotal.toFixed(2)} $</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fiches de paie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            Fiches de paie
          </CardTitle>
          <CardDescription>Générées chaque dimanche par l'administration</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-3" />
              <p className="font-medium text-gray-600">Aucune fiche de paie</p>
              <p className="text-sm mt-1">Vos fiches apparaîtront ici dès que l'admin effectuera un virement</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map(payout => {
                const cfg = statusConfig[payout.status] || statusConfig.pending;
                const isExpanded = expandedId === payout.id;
                return (
                  <div key={payout.id} className={`border rounded-xl overflow-hidden ${cfg.bg}`}>
                    <button
                      className="w-full flex items-center justify-between p-4 text-left"
                      onClick={() => setExpandedId(isExpanded ? null : payout.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatDate(payout.period_start)} – {formatDate(payout.period_end)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs border-0 ${cfg.color} ${cfg.bg}`}>{cfg.label}</Badge>
                            {payout.paid_at && (
                              <span className="text-xs text-gray-500">
                                Versé le {new Date(payout.paid_at).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {payout.sessions?.length || 0} séance{(payout.sessions?.length || 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-900">{(payout.amount || 0).toFixed(2)} $</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                      </div>
                    </button>

                    {isExpanded && payout.sessions?.length > 0 && (
                      <div className="px-4 pb-4 border-t bg-white">
                        <table className="w-full mt-3 text-sm">
                          <thead>
                            <tr className="text-left text-xs text-gray-500 border-b">
                              <th className="pb-2">Date</th>
                              <th className="pb-2">Élève</th>
                              <th className="pb-2">Matière</th>
                              <th className="pb-2 text-right">Durée</th>
                              <th className="pb-2 text-right">Montant</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payout.sessions.map((s: any) => (
                              <tr key={s.id} className="border-b last:border-0">
                                <td className="py-2">{formatDate(s.session_date)}</td>
                                <td className="py-2">{s.student_name}</td>
                                <td className="py-2">{s.subject}</td>
                                <td className="py-2 text-right">{Math.round(s.duration_minutes / 60 * 10) / 10}h</td>
                                <td className="py-2 text-right font-medium text-blue-600">{(s.total_price || 0).toFixed(2)} $</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="font-semibold">
                              <td colSpan={4} className="pt-2 text-gray-700">Total</td>
                              <td className="pt-2 text-right text-blue-700">{(payout.amount || 0).toFixed(2)} $</td>
                            </tr>
                          </tfoot>
                        </table>
                        {payout.notes && (
                          <p className="mt-3 text-xs text-gray-500 italic">Note : {payout.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
