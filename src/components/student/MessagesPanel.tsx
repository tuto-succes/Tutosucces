import { useState, useEffect } from 'react';
import { Send, User, Plus, X, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { getMockTutors, getMockMessages, simulateNetworkDelay } from '../../utils/mockData';

interface MessagesPanelProps {
  userId: string;
  accessToken: string;
}

export function MessagesPanel({ userId, accessToken }: MessagesPanelProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);

  useEffect(() => {
    fetchAllMessages();
    fetchTutors();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchConversation();
    }
  }, [selectedUserId]);

  async function fetchTutors() {
    setLoadingTutors(true);
    try {
      const data = await getMockTutors();
      setTutors(data);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoadingTutors(false);
    }
  }

  async function fetchAllMessages() {
    try {
      const data = await getMockMessages(userId);
      setMessages(data);
      extractConversations(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }

  function extractConversations(msgs: any[]) {
    const userMap = new Map<string, any>();
    msgs.forEach(msg => {
      const otherUserId = msg.senderId !== userId ? msg.senderId : msg.recipientId;
      if (!userMap.has(otherUserId) && otherUserId !== userId) {
        userMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt
        });
      }
    });
    setConversations(Array.from(userMap.values()));
  }

  async function fetchConversation() {
    try {
      const data = await getMockMessages(userId);
      const filtered = data.filter((m: any) => 
        (m.senderId === userId && m.receiverId === selectedUserId) ||
        (m.senderId === selectedUserId && m.receiverId === userId)
      );
      setMessages(filtered);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      // Simulation d'envoi de message
      await simulateNetworkDelay();
      const newMsg = {
        id: `msg-${Date.now()}`,
        conversationId: `conv-${selectedUserId}`,
        senderId: userId,
        senderName: 'Vous',
        receiverId: selectedUserId,
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  function startNewConversation(tutorId: string) {
    setSelectedUserId(tutorId);
    setShowNewMessageDialog(false);
    fetchConversation();
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des messages...</div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Vos échanges avec les tuteurs</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowNewMessageDialog(true)}
              style={{ backgroundColor: '#E74C3C' }}
              className="text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-4">
                    Aucune conversation
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowNewMessageDialog(true)}
                    style={{ backgroundColor: '#2E5CA8' }}
                    className="text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Commencer une conversation
                  </Button>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedUserId(conv.userId)}
                    className={`w-full p-3 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                      selectedUserId === conv.userId ? 'border-2' : 'border border-gray-200'
                    }`}
                    style={{
                      backgroundColor: selectedUserId === conv.userId ? '#FFF5F5' : 'white',
                      borderColor: selectedUserId === conv.userId ? '#E74C3C' : '#E5E7EB'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4" style={{ color: '#7F8C8D' }} />
                      <span className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                        Tuteur {conv.userId.slice(0, 8)}...
                      </span>
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs truncate" style={{ color: '#7F8C8D' }}>
                        {conv.lastMessage}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          {selectedUserId && (
            <CardDescription>
              Conversation avec Tuteur {selectedUserId.slice(0, 8)}...
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!selectedUserId ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-gray-500">
              <MessageSquare className="h-16 w-16 mb-4" style={{ color: '#E5E7EB' }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#2C3E50' }}>
                Sélectionnez une conversation
              </p>
              <p className="text-sm mb-4" style={{ color: '#7F8C8D' }}>
                Choisissez un tuteur pour commencer à échanger
              </p>
              <Button
                onClick={() => setShowNewMessageDialog(true)}
                style={{ backgroundColor: '#E74C3C' }}
                className="text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau message
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      Aucun message. Commencez la conversation!
                    </p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3`}
                          style={{
                            backgroundColor: message.senderId === userId ? '#E74C3C' : '#F8F9FA',
                            color: message.senderId === userId ? 'white' : '#2C3E50'
                          }}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button 
                  onClick={sendMessage}
                  style={{ backgroundColor: '#E74C3C' }}
                  className="text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Message Dialog */}
      {showNewMessageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nouveau message</CardTitle>
                  <CardDescription>Sélectionnez un tuteur</CardDescription>
                </div>
                <button
                  onClick={() => setShowNewMessageDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTutors ? (
                <div className="text-center py-8">Chargement des tuteurs...</div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {tutors.map((tutor) => (
                      <button
                        key={tutor.userId}
                        onClick={() => startNewConversation(tutor.userId)}
                        className="w-full p-4 rounded-lg text-left border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium" style={{ color: '#2C3E50' }}>
                              {tutor.user?.name || 'Tuteur'}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tutor.subjects?.slice(0, 3).map((subject: string, index: number) => (
                                <span
                                  key={index}
                                  className="text-xs px-2 py-1 rounded"
                                  style={{ backgroundColor: '#FFF5F5', color: '#E74C3C' }}
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold" style={{ color: '#2E5CA8' }}>
                              {tutor.rate}$/h
                            </p>
                            {tutor.rating > 0 && (
                              <p className="text-xs" style={{ color: '#7F8C8D' }}>
                                ⭐ {tutor.rating.toFixed(1)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}