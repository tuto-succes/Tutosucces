import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, CheckCircle, Clock, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export function ContactMessagesPage({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Get all contact messages from KV store
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/contacts`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch contact messages');
      }

      const data = await response.json();
      
      // Sort by date (newest first)
      const sortedMessages = data.sort((a: ContactMessage, b: ContactMessage) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: 'new' | 'read' | 'replied') => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/contacts/${messageId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update message status');
      }

      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));

      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-385c5805/contacts/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(messages.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(msg => msg.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Nouveau
          </span>
        );
      case 'read':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Eye className="w-3 h-3" />
            Lu
          </span>
        );
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Répondu
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour au dashboard
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages de Contact</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gérez tous les messages reçus via le formulaire de contact
              </p>
            </div>
            <button
              onClick={fetchMessages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-red-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-800">{stats.new}</div>
              <div className="text-sm text-red-700">Nouveaux</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-800">{stats.read}</div>
              <div className="text-sm text-blue-700">Lus</div>
            </div>
            <div className="bg-green-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-800">{stats.replied}</div>
              <div className="text-sm text-green-700">Répondus</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tous ({stats.total})
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'new'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Nouveaux ({stats.new})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Lus ({stats.read})
            </button>
            <button
              onClick={() => setFilter('replied')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'replied'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Répondus ({stats.replied})
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun message</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'Aucun message de contact pour le moment.'
                : `Aucun message avec le statut "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                  selectedMessage?.id === message.id
                    ? 'border-blue-500'
                    : 'border-transparent hover:border-gray-200'
                } ${message.status === 'new' ? 'bg-red-50' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {message.firstName} {message.lastName}
                        </h3>
                        {getStatusBadge(message.status)}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${message.email}`} className="hover:text-blue-600">
                            {message.email}
                          </a>
                        </div>
                        {message.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <a href={`tel:${message.phone}`} className="hover:text-blue-600">
                              {message.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(message.createdAt)}
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

                      <div className="flex gap-2">
                        {selectedMessage?.id === message.id ? (
                          <button
                            onClick={() => setSelectedMessage(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                          >
                            Masquer
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedMessage(message);
                              if (message.status === 'new') {
                                updateMessageStatus(message.id, 'read');
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Voir le détail
                          </button>
                        )}

                        {message.status === 'new' && (
                          <button
                            onClick={() => updateMessageStatus(message.id, 'read')}
                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            Marquer comme lu
                          </button>
                        )}

                        {message.status !== 'replied' && (
                          <button
                            onClick={() => updateMessageStatus(message.id, 'replied')}
                            className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            Marquer comme répondu
                          </button>
                        )}

                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-2"
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
      </div>
    </div>
  );
}