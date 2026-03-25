import { useState, useEffect, useRef } from 'react';
import { Send, User, Plus, X, MessageSquare, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { supabase } from '../../app/core/supabase.client';

interface MessagesPanelProps {
  userId: string;
  accessToken?: string;
}

interface Profile {
  id: string;
  name: string;
  role: string;
}

// Correspond exactement aux colonnes de la table messages Supabase
interface Message {
  id: string;
  message_id?: string;
  conversation_id?: string;
  sender_id: string;
  sender_name?: string;
  receiver_id: string;
  recipient_id?: string;
  content: string;
  read: boolean;
  timestamp?: string;
  created_at: string;
}

interface Conversation {
  otherId: string;
  name: string;
  role: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export function MessagesPanel({ userId }: MessagesPanelProps) {
  const [myName, setMyName] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const selectedUserRef = useRef<Profile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [searchContacts, setSearchContacts] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    init();
  }, [userId]);

  async function init() {
    // Récupérer le nom du profil courant
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', userId)
      .single();
    if (profile) setMyName(profile.name);

    await fetchConversations();
    setLoading(false);

    const channel = supabase
      .channel(`messages-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as Message;
        if (msg.receiver_id !== userId) return;
        const current = selectedUserRef.current;
        if (current && msg.sender_id === current.id) {
          setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        }
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  function sortKey(msg: any) {
    return msg.timestamp || msg.created_at || '';
  }

  async function fetchConversations() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (!data) return;

    const convMap = new Map<string, Conversation>();
    for (const msg of data) {
      const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          otherId,
          name: '',
          role: '',
          lastMessage: msg.content,
          lastTime: sortKey(msg),
          unread: msg.receiver_id === userId && !msg.read ? 1 : 0,
        });
      } else if (msg.receiver_id === userId && !msg.read) {
        convMap.get(otherId)!.unread++;
      }
    }

    if (convMap.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', Array.from(convMap.keys()));
      profiles?.forEach((p: any) => {
        if (convMap.has(p.id)) {
          convMap.get(p.id)!.name = p.name;
          convMap.get(p.id)!.role = p.role;
        }
      });
    }

    setConversations(Array.from(convMap.values()));
  }

  async function openConversation(profile: Profile) {
    setSelectedUser(profile);
    setShowNewDialog(false);
    setSearchContacts('');

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    setMessages(data || []);

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', profile.id)
      .eq('read', false);

    fetchConversations();
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedUser) return;

    const content = newMessage.trim();
    setNewMessage('');
    const now = new Date().toISOString();
    const tempId = `temp-${Date.now()}`;

    // Optimiste
    setMessages(prev => [...prev, {
      id: tempId,
      sender_id: userId,
      receiver_id: selectedUser.id,
      content,
      read: false,
      timestamp: now,
      created_at: now,
    }]);

    // Construire le payload avec tous les champs requis
    const convId = [userId, selectedUser.id].sort().join('--');
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const payload: any = {
      sender_id: userId,
      receiver_id: selectedUser.id,
      content,
      read: false,
      created_at: now,
    };

    // Champs requis selon l'ancienne structure (si présents dans la table)
    if (myName) payload.sender_name = myName;
    payload.message_id = msgId;
    payload.conversation_id = convId;
    payload.recipient_id = selectedUser.id;
    payload.timestamp = now;

    const { error } = await supabase.from('messages').insert(payload);

    if (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      console.error('Erreur envoi message:', error);
      return;
    }

    // Re-fetch pour remplacer l'optimiste
    const { data: refreshed } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (refreshed) setMessages(refreshed);
    fetchConversations();
  }

  async function loadContacts() {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, role')
      .neq('id', userId)
      .in('role', ['tutor', 'student']);
    setContacts(data || []);
  }

  function formatTime(iso: string) {
    if (!iso) return '';
    const date = new Date(iso);
    const isToday = date.toDateString() === new Date().toDateString();
    if (isToday) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' ' +
      date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchContacts.toLowerCase())
  );

  if (loading) return <div className="text-center py-8 text-gray-500">Chargement...</div>;

  return (
    <div className="flex gap-4 h-[600px]">

      {/* Liste conversations */}
      <div className="w-72 flex flex-col border rounded-xl overflow-hidden bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <span className="font-semibold text-gray-800">Messages</span>
          <button
            onClick={() => { setShowNewDialog(true); loadContacts(); }}
            className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 px-4 text-center">
              <MessageSquare className="h-8 w-8 mb-2" />
              <p className="text-sm">Aucune conversation</p>
              <button onClick={() => { setShowNewDialog(true); loadContacts(); }} className="mt-2 text-xs text-blue-600 hover:underline">
                Commencer une conversation
              </button>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.otherId}
                onClick={() => openConversation({ id: conv.otherId, name: conv.name, role: conv.role })}
                className={[
                  'w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors',
                  selectedUser?.id === conv.otherId ? 'bg-blue-50' : '',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">{conv.name}</span>
                      {conv.unread > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-gray-300">{formatTime(conv.lastTime)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Zone messages */}
      <div className="flex-1 flex flex-col border rounded-xl overflow-hidden bg-white">
        {!selectedUser ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="h-14 w-14 mb-3" />
            <p className="font-medium text-gray-600">Sélectionnez une conversation</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                <p className="text-xs text-gray-400">{selectedUser.role === 'tutor' ? 'Tuteur' : 'Élève'}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-3">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">Commencez la conversation !</p>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === userId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={[
                            'px-4 py-2 rounded-2xl text-sm',
                            isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm',
                          ].join(' ')}>
                            {msg.content}
                          </div>
                          <span className="text-xs text-gray-300 mt-0.5 px-1">
                            {formatTime(msg.timestamp || msg.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 px-4 py-3 border-t">
              <Input
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Dialog nouvelle conversation */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold">Nouvelle conversation</span>
              <button onClick={() => setShowNewDialog(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-3 border-b">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  autoFocus
                  placeholder="Rechercher..."
                  value={searchContacts}
                  onChange={e => setSearchContacts(e.target.value)}
                  className="bg-transparent flex-1 text-sm outline-none"
                />
              </div>
            </div>
            <ScrollArea className="h-72">
              {filteredContacts.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">Aucun contact trouvé</p>
              ) : (
                filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => openConversation(contact)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-400">{contact.role === 'tutor' ? 'Tuteur' : 'Élève'}</p>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
