import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Mail, Phone, Clock, CheckCircle, Eye, Trash2, UserPlus, BookOpen, GraduationCap } from 'lucide-react';
import { supabase } from '../app/core/supabase.client';
import { CreateAccountFromContact } from './admin/CreateAccountFromContact';

interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  requestType?: string;
  schoolLevel?: string;
  subjects?: string[];
  preferredSchedule?: string;
  hoursPerWeek?: string;
  message: string;
  submittedAt: string;
  read?: boolean;
  status?: string;
}

interface AdminContactMessagesPageProps {
  onUserCreated?: () => void;
}

export function AdminContactMessagesPage({ onUserCreated }: AdminContactMessagesPageProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const splitLegacyName = (name?: string | null) => {
        const fullName = String(name ?? '').trim();
        if (!fullName) return { firstName: '', lastName: '' };
        const parts = fullName.split(/\s+/);
        return {
          firstName: parts[0] ?? '',
          lastName: parts.slice(1).join(' '),
        };
      };

      const mapped: ContactMessage[] = (data ?? []).map((m: any) => ({
        ...(splitLegacyName(m.name)),
        id: m.id,
        firstName: m.first_name ?? splitLegacyName(m.name).firstName,
        lastName: m.last_name ?? splitLegacyName(m.name).lastName,
        email: m.email,
        phone: m.phone ?? '',
        schoolLevel: m.school_level ?? '',
        subjects: m.subjects ?? [],
        message: m.message ?? m.subject ?? '',
        submittedAt: m.created_at,
        read: !['new', 'unread', null, undefined].includes(m.status),
        status: m.status ?? 'new',
      }));

      setMessages(mapped);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setLoadError(message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('contact_messages')
      .update({ status: 'read' })
      .eq('id', messageId);

    setMessages(prev =>
      prev.map(msg => msg.id === messageId ? { ...msg, read: true, status: 'read' } : msg)
    );
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    await supabase.from('contact_messages').delete().eq('id', messageId);
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    if (selectedMessage?.id === messageId) setSelectedMessage(null);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const unreadCount = messages.filter(msg => !msg.read).length;

  if (loading) {
    return <div className="p-6 text-center" style={{ color: '#7F8C8D' }}>Chargement des messages...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
            Messages de contact
          </h2>
          <p style={{ color: '#7F8C8D' }}>
            Gérez les messages reçus via le formulaire de contact
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge
              className="text-lg px-4 py-2"
              style={{ backgroundColor: '#E74C3C', color: 'white' }}
            >
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={loadMessages}>
            Actualiser
          </Button>
        </div>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="font-medium" style={{ color: '#C0392B' }}>
              Impossible de charger les messages: {loadError}
            </p>
            <p className="mt-1 text-sm" style={{ color: '#7F8C8D' }}>
              Vérifiez que votre compte connecté existe bien dans `profiles` avec le rôle `admin`, et que la table `contact_messages` utilise la même base Supabase que le formulaire public.
            </p>
          </CardContent>
        </Card>
      )}

      {messages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: '#7F8C8D' }} />
            <p className="text-lg" style={{ color: '#7F8C8D' }}>
              Aucun message de contact pour le moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Liste des messages */}
          <div className="md:col-span-1 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-all ${
                  selectedMessage?.id === message.id
                    ? 'ring-2 ring-blue-500'
                    : 'hover:shadow-md'
                } ${!message.read ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.read) markAsRead(message.id);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: '#2C3E50' }}>
                        {message.firstName} {message.lastName}
                        {!message.read && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#E74C3C' }}></span>
                        )}
                      </h3>
                      <p className="text-sm" style={{ color: '#7F8C8D' }}>
                        {message.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2 mb-2" style={{ color: '#7F8C8D' }}>
                    {message.message}
                  </p>
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#7F8C8D' }}>
                    <Clock className="h-3 w-3" />
                    {formatDate(message.submittedAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Détails du message */}
          <div className="md:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle style={{ color: '#2C3E50' }}>
                        {selectedMessage.firstName} {selectedMessage.lastName}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: '#7F8C8D' }}>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedMessage.email}
                        </div>
                        {selectedMessage.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {selectedMessage.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#2C3E50' }}>
                      Message:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p style={{ color: '#2C3E50', whiteSpace: 'pre-wrap' }}>
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  {(selectedMessage.schoolLevel || (selectedMessage.subjects && selectedMessage.subjects.length > 0)) && (
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      {selectedMessage.schoolLevel && (
                        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2C3E50' }}>
                          <GraduationCap className="h-4 w-4" style={{ color: '#2E5CA8' }} />
                          Niveau : {selectedMessage.schoolLevel}
                        </div>
                      )}
                      {selectedMessage.subjects && selectedMessage.subjects.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                            <BookOpen className="h-4 w-4" style={{ color: '#2E5CA8' }} />
                            Matières recherchées :
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedMessage.subjects.map(subject => (
                              <span
                                key={subject}
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: '#DBEAFE', color: '#2E5CA8' }}
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                    <Clock className="h-4 w-4" />
                    Reçu le {formatDate(selectedMessage.submittedAt)}
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      className="flex-1"
                      style={{ backgroundColor: '#2E5CA8', color: 'white' }}
                      onClick={() => {
                        window.location.href = `mailto:${selectedMessage.email}`;
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Répondre par email
                    </Button>
                    {selectedMessage.phone && (
                      <Button
                        className="flex-1"
                        variant="outline"
                        style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                        onClick={() => {
                          window.location.href = `tel:${selectedMessage.phone}`;
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler
                      </Button>
                    )}
                    {selectedMessage.status !== 'account_created' ? (
                      <Button
                        className="flex-1"
                        variant="outline"
                        style={{ borderColor: '#10b981', color: '#10b981' }}
                        onClick={() => setShowCreateAccount(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Créer le compte
                      </Button>
                    ) : (
                      <Badge
                        className="flex-1 flex items-center justify-center py-2"
                        style={{ backgroundColor: '#D1FAE5', color: '#10b981' }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Compte créé
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: '#7F8C8D' }} />
                  <p className="text-lg" style={{ color: '#7F8C8D' }}>
                    Sélectionnez un message pour voir les détails
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {selectedMessage && showCreateAccount && (
        <CreateAccountFromContact
          contactMessage={selectedMessage}
          isOpen={showCreateAccount}
          onClose={() => setShowCreateAccount(false)}
          onAccountCreated={() => {
            setSelectedMessage(prev => prev ? { ...prev, status: 'account_created', read: true } : prev);
            loadMessages();
            setShowCreateAccount(false);
            onUserCreated?.();
          }}
        />
      )}
    </div>
  );
}
