import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, CheckCircle, Clock, Trash2, Eye, UserPlus } from 'lucide-react';
import { supabase } from '../../app/core/supabase.client';
import { CreateAccountDialog } from './CreateAccountDialog';

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message: string;
  school_level?: string;
  subjects?: string[];
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

interface ContactMessagesPageProps {
  onUserCreated?: () => void;
}

export function ContactMessagesPage({ onUserCreated }: ContactMessagesPageProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [prefilledContact, setPrefilledContact] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMessages(data ?? []);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: 'new' | 'read' | 'replied') {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      if (selectedMessage?.id === id) setSelectedMessage(s => s ? { ...s, status } : s);
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm('Supprimer ce message ?')) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  }

  function openCreateAccount(message: ContactMessage) {
    setPrefilledContact(message);
    setCreateDialogOpen(true);
  }

  const filtered = filter === 'all' ? messages : messages.filter(m => m.status === filter);
  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
  };

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function StatusBadge({ status }: { status: string }) {
    if (status === 'new') return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium"><Clock className="w-3 h-3" />Nouveau</span>;
    if (status === 'read') return <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"><Eye className="w-3 h-3" />Lu</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" />Répondu</span>;
  }

  if (loading) {
    return <div className="py-8 text-center">Chargement des messages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#2C3E50' }}>Messages de contact</h3>
          <p className="mt-1 text-sm" style={{ color: '#7F8C8D' }}>Messages reçus depuis le formulaire de contact</p>
        </div>
        <button onClick={fetchMessages} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-100 text-gray-900' },
          { label: 'Nouveaux', value: stats.new, color: 'bg-red-100 text-red-800' },
          { label: 'Lus', value: stats.read, color: 'bg-blue-100 text-blue-800' },
          { label: 'Répondus', value: stats.replied, color: 'bg-green-100 text-green-800' },
        ].map(s => (
          <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {(['all', 'new', 'read', 'replied'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {f === 'all' ? `Tous (${stats.total})` : f === 'new' ? `Nouveaux (${stats.new})` : f === 'read' ? `Lus (${stats.read})` : `Répondus (${stats.replied})`}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Mail className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p className="text-gray-500">Aucun message</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(message => (
            <div
              key={message.id}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                selectedMessage?.id === message.id ? 'border-blue-500' : 'border-transparent hover:border-gray-200'
              } ${message.status === 'new' ? 'bg-red-50' : ''}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {message.first_name} {message.last_name}
                      </h3>
                      <StatusBadge status={message.status} />
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${message.email}`} className="hover:text-blue-600">{message.email}</a>
                      </div>
                      {message.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${message.phone}`} className="hover:text-blue-600">{message.phone}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(message.created_at)}
                      </div>
                    </div>

                    {selectedMessage?.id === message.id ? (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Message :</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                      </div>
                    ) : (
                      <p className="text-gray-600 line-clamp-2 mb-4">{message.message}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          if (selectedMessage?.id === message.id) {
                            setSelectedMessage(null);
                          } else {
                            setSelectedMessage(message);
                            if (message.status === 'new') updateStatus(message.id, 'read');
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        {selectedMessage?.id === message.id ? 'Masquer' : 'Voir le détail'}
                      </button>

                      {message.status !== 'replied' && (
                        <button
                          onClick={() => updateStatus(message.id, 'replied')}
                          className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 text-sm"
                        >
                          Marquer répondu
                        </button>
                      )}

                      <button
                        onClick={() => openCreateAccount(message)}
                        className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 text-white"
                        style={{ backgroundColor: '#E74C3C' }}
                      >
                        <UserPlus className="w-4 h-4" />
                        Créer compte élève
                      </button>

                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-sm flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {prefilledContact && (
        <CreateAccountDialog
          isOpen={createDialogOpen}
          onClose={() => { setCreateDialogOpen(false); setPrefilledContact(null); }}
          onSave={() => {
            if (prefilledContact) updateStatus(prefilledContact.id, 'replied');
            setCreateDialogOpen(false);
            setPrefilledContact(null);
            onUserCreated?.();
          }}
          initialData={{
            firstName: prefilledContact.first_name,
            lastName: prefilledContact.last_name,
            email: prefilledContact.email,
            phone: prefilledContact.phone ?? '',
            accountType: 'student',
            schoolLevel: prefilledContact.school_level ?? '',
            subjects: prefilledContact.subjects ?? [],
          }}
        />
      )}
    </div>
  );
}
