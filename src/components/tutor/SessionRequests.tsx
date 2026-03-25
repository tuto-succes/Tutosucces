import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, X, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../app/core/supabase.client';

interface SessionRequest {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  subject: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  student_notes: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_price: number;
}

interface SessionRequestsProps {
  tutorId: string;
  accessToken?: string;
}

export function SessionRequests({ tutorId }: SessionRequestsProps) {
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [tutorId]);

  async function fetchRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        id,
        student_id,
        subject,
        session_date,
        start_time,
        end_time,
        duration_minutes,
        student_notes,
        status,
        total_price
      `)
      .eq('tutor_id', tutorId)
      .eq('status', 'pending')
      .order('session_date', { ascending: true });

    if (!error && data) {
      // Récupérer les noms des élèves
      const studentIds = [...new Set(data.map((s: any) => s.student_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      const profileMap: Record<string, { full_name: string; email: string }> = {};
      profiles?.forEach((p: any) => { profileMap[p.id] = p; });

      const mapped = data.map((s: any) => ({
        id: s.id,
        student_id: s.student_id,
        student_name: profileMap[s.student_id]?.full_name || 'Élève',
        student_email: profileMap[s.student_id]?.email || '',
        subject: s.subject,
        session_date: s.session_date,
        start_time: s.start_time,
        end_time: s.end_time,
        duration_minutes: s.duration_minutes,
        student_notes: s.student_notes || '',
        status: s.status,
        total_price: s.total_price,
      }));
      setRequests(mapped);
    }
    setLoading(false);
  }

  async function handleRequest(sessionId: string, action: 'confirm' | 'cancel') {
    const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
    const { error } = await supabase
      .from('sessions')
      .update({ status: newStatus })
      .eq('id', sessionId);

    if (error) {
      alert('Erreur lors du traitement de la demande');
      return;
    }

    fetchRequests();
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Chargement des demandes...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#2C3E50]">Demandes de séances</h3>
        <p className="text-sm text-[#7F8C8D] mt-1">
          {requests.length} demande{requests.length !== 1 ? 's' : ''} en attente
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucune demande en attente</p>
          <p className="text-sm text-gray-500 mt-1">
            Les nouvelles demandes de séances apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => {
            const formattedDate = new Date(request.session_date + 'T12:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-5 w-5 text-[#2E5CA8]" />
                      <h4 className="font-semibold text-lg text-[#2C3E50]">{request.student_name}</h4>
                    </div>
                    {request.student_email && (
                      <p className="text-sm text-gray-500 ml-7">{request.student_email}</p>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    En attente
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-[#E74C3C]" />
                    <span className="text-gray-700"><strong>Matière :</strong> {request.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[#2E5CA8]" />
                    <span className="text-gray-700"><strong>Date :</strong> {formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[#8B5CF6]" />
                    <span className="text-gray-700">
                      <strong>Heure :</strong> {request.start_time.slice(0, 5)} – {request.end_time.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[#8B5CF6]" />
                    <span className="text-gray-700">
                      <strong>Durée :</strong> {request.duration_minutes} min
                    </span>
                  </div>
                </div>

                {request.student_notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Notes :</strong> {request.student_notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-700">
                    {request.total_price} €
                  </span>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleRequest(request.id, 'confirm')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accepter
                    </Button>
                    <Button
                      onClick={() => handleRequest(request.id, 'cancel')}
                      variant="outline"
                      className="border-[#E74C3C] text-[#E74C3C] hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
