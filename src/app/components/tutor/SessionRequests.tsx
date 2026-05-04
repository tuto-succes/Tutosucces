import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { projectId } from '../../utils/supabase/info';
import { authenticatedGet, authenticatedPost } from '../../utils/auth-fetch';

interface SessionRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  requestedDate: string;
  requestedTime: string;
  duration: number;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface SessionRequestsProps {
  tutorId: string;
  accessToken: string;
}

export function SessionRequests({ tutorId, accessToken }: SessionRequestsProps) {
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [tutorId]);

  async function fetchRequests() {
    try {
      const response = await authenticatedGet(
        `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/session-requests?tutorId=${tutorId}`
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequest(requestId: string, action: 'accept' | 'decline') {
    try {
      const response = await authenticatedPost(
        `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/session-requests/${requestId}/${action}`,
        {}
      );

      if (response.ok) {
        const data = await response.json();
        
        if (action === 'accept') {
          alert(`Demande acceptée ! Lien de réunion : ${data.meetingLink}`);
        } else {
          alert('Demande refusée');
        }
        
        fetchRequests();
      } else {
        alert('Erreur lors du traitement de la demande');
      }
    } catch (error) {
      console.error('Error handling request:', error);
      alert('Erreur lors du traitement de la demande');
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des demandes...</div>;
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#2C3E50]">Demandes de séances</h3>
        <p className="text-sm text-[#7F8C8D] mt-1">
          {pendingRequests.length} demande{pendingRequests.length !== 1 ? 's' : ''} en attente
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucune demande en attente</p>
          <p className="text-sm text-gray-500 mt-1">
            Les nouvelles demandes de séances apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map(request => {
            const requestDate = new Date(request.requestedDate + 'T' + request.requestedTime);
            const formattedDate = requestDate.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-[#2E5CA8]" />
                      <h4 className="font-semibold text-lg text-[#2C3E50]">{request.studentName}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{request.studentEmail}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    En attente
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-[#E74C3C]" />
                    <span className="text-gray-700">
                      <strong>Matière :</strong> {request.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[#2E5CA8]" />
                    <span className="text-gray-700">
                      <strong>Date :</strong> {formattedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[#8B5CF6]" />
                    <span className="text-gray-700">
                      <strong>Heure :</strong> {request.requestedTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[#8B5CF6]" />
                    <span className="text-gray-700">
                      <strong>Durée :</strong> {request.duration} min
                    </span>
                  </div>
                </div>

                {request.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Notes :</strong> {request.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleRequest(request.id, 'accept')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accepter
                  </Button>
                  <Button
                    onClick={() => handleRequest(request.id, 'decline')}
                    variant="outline"
                    className="flex-1 border-[#E74C3C] text-[#E74C3C] hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}