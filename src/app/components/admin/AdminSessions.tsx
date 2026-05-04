import { useState, useEffect } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { projectId } from '../../utils/supabase/info';
import { authenticatedGet } from '../../utils/auth-fetch';

interface AdminSessionsProps {
  accessToken: string;
}

export function AdminSessions({ accessToken }: AdminSessionsProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const response = await authenticatedGet(
        `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/sessions`
      );

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des séances...</div>;
  }

  const pendingSessions = sessions.filter(s => s.status === 'pending');
  const confirmedSessions = sessions.filter(s => s.status === 'confirmed');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{sessions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Toutes les séances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>En attente</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{pendingSessions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">À confirmer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Confirmées</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{confirmedSessions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">À venir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Terminées</CardDescription>
            <CardTitle className="text-3xl text-green-600">{completedSessions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0}% taux de complétion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des séances</CardTitle>
          <CardDescription>
            Vue globale de toutes les séances de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Toutes ({sessions.length})</TabsTrigger>
              <TabsTrigger value="pending">En attente ({pendingSessions.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmées ({confirmedSessions.length})</TabsTrigger>
              <TabsTrigger value="completed">Terminées ({completedSessions.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Annulées ({cancelledSessions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <SessionsTable sessions={sessions} />
            </TabsContent>

            <TabsContent value="pending">
              <SessionsTable sessions={pendingSessions} />
            </TabsContent>

            <TabsContent value="confirmed">
              <SessionsTable sessions={confirmedSessions} />
            </TabsContent>

            <TabsContent value="completed">
              <SessionsTable sessions={completedSessions} />
            </TabsContent>

            <TabsContent value="cancelled">
              <SessionsTable sessions={cancelledSessions} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function SessionsTable({ sessions }: { sessions: any[] }) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune séance trouvée
      </div>
    );
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { label: string; variant: any }> = {
      pending: { label: 'En attente', variant: 'default' },
      confirmed: { label: 'Confirmée', variant: 'default' },
      completed: { label: 'Terminée', variant: 'secondary' },
      cancelled: { label: 'Annulée', variant: 'destructive' }
    };

    const config = variants[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Élève</TableHead>
          <TableHead>Tuteur</TableHead>
          <TableHead>Matière</TableHead>
          <TableHead>Durée</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Créée le</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">
                    {new Date(session.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(session.date).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span className="font-mono text-xs">
                {session.studentId.slice(0, 8)}...
              </span>
            </TableCell>
            <TableCell>
              <span className="font-mono text-xs">
                {session.tutorId.slice(0, 8)}...
              </span>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{session.subject}</Badge>
            </TableCell>
            <TableCell>{session.duration}h</TableCell>
            <TableCell>{getStatusBadge(session.status)}</TableCell>
            <TableCell className="text-sm text-gray-600">
              {new Date(session.createdAt).toLocaleDateString('fr-FR')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}