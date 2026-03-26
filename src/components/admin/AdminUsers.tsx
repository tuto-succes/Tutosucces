import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, Edit, Trash2, UserPlus, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { supabase } from '../../app/core/supabase.client';
import { EditUserDialog } from './EditUserDialog';
import { CreateAccountDialog } from './CreateAccountDialog';

interface AdminUser {
  id: string;
  profileId?: string;
  userId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: 'student' | 'tutor';
  created_at?: string;
  schoolLevel?: string;
  subjects?: string[];
  levels?: string[];
  bio?: string;
  hourlyRate?: number;
  approved?: boolean;
  bankInfo?: {
    institution_name?: string;
    transit_number?: string;
    institution_number?: string;
    account_number?: string;
    account_holder?: string;
  } | null;
}

function splitName(name: string) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] || '', lastName: '' };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.slice(-1).join(' '),
  };
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'tutor'>('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  async function fetchUsers() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['student', 'tutor'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Charger les infos bancaires des tuteurs
      const tutorIds = (data || []).filter((u: any) => u.role === 'tutor').map((u: any) => u.id);
      let bankInfoMap: Record<string, any> = {};
      if (tutorIds.length > 0) {
        const { data: bankData } = await supabase
          .from('tutor_bank_info')
          .select('*')
          .in('tutor_id', tutorIds);
        (bankData || []).forEach((b: any) => { bankInfoMap[b.tutor_id] = b; });
      }

      const mappedUsers: AdminUser[] = (data || []).map((user: any) => {
        const { firstName, lastName } = splitName(user.name || '');
        return {
          id: user.id,
          profileId: user.id,
          userId: user.id,
          name: user.name || 'Utilisateur',
          firstName,
          lastName,
          email: user.email || '',
          phone: user.phone || '',
          role: user.role,
          created_at: user.created_at,
          schoolLevel: user.student_level || '',
          subjects: user.subjects || [],
          levels: user.levels || [],
          bio: user.bio || '',
          hourlyRate: user.rate ? Number(user.rate) : undefined,
          approved: user.approved ?? undefined,
          bankInfo: user.role === 'tutor' ? (bankInfoMap[user.id] || null) : undefined,
        };
      });

      setUsers(mappedUsers);
      setFilteredUsers(mappedUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs admin :', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveUser(updatedUser: AdminUser) {
    try {
      const fullName = [updatedUser.firstName, updatedUser.lastName].filter(Boolean).join(' ').trim() || updatedUser.name;
      const targetId = updatedUser.profileId || updatedUser.id;
      if (!targetId) throw new Error('ID du profil introuvable');

      const payload: Record<string, any> = {
        name: fullName,
        phone: updatedUser.phone || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', targetId);

      if (error) {
        console.error('Erreur sauvegarde:', error);
        throw new Error(error.message);
      }

      await fetchUsers();
      alert(`Modifications sauvegardées pour ${fullName}`);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde utilisateur :', error);
      alert(`Impossible d'enregistrer les modifications : ${error.message}`);
    }
  }

  function handleCreateUser(newUser: any) {
    setUsers(prev => [newUser, ...prev]);
  }

  function filterUsers() {
    let filtered = users;

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone || '').toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  }

  if (loading) {
    return <div className="py-8 text-center">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
            Gestion des utilisateurs
          </h3>
          <p className="mt-1 text-sm" style={{ color: '#7F8C8D' }}>
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} affiché{filteredUsers.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button style={{ backgroundColor: '#2E5CA8', color: 'white' }} onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Créer un compte
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" style={{ color: '#7F8C8D' }} />
              <Input
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterRole === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterRole('all')}
                style={filterRole === 'all' ? { backgroundColor: '#2E5CA8', color: 'white' } : {}}
              >
                Tous
              </Button>
              <Button
                variant={filterRole === 'student' ? 'default' : 'outline'}
                onClick={() => setFilterRole('student')}
                style={filterRole === 'student' ? { backgroundColor: '#E74C3C', color: 'white' } : {}}
              >
                Élèves
              </Button>
              <Button
                variant={filterRole === 'tutor' ? 'default' : 'outline'}
                onClick={() => setFilterRole('tutor')}
                style={filterRole === 'tutor' ? { backgroundColor: '#10b981', color: 'white' } : {}}
              >
                Tuteurs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto mb-4 h-16 w-16 opacity-20" style={{ color: '#7F8C8D' }} />
              <p className="font-medium" style={{ color: '#2C3E50' }}>Aucun utilisateur trouvé</p>
              <p className="mt-2 text-sm" style={{ color: '#7F8C8D' }}>
                Ajustez les filtres ou la recherche.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map(user => (
            <Card key={user.id} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white"
                      style={{ backgroundColor: user.role === 'student' ? '#E74C3C' : '#10b981' }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-semibold" style={{ color: '#2C3E50' }}>
                          {user.name}
                        </h4>
                        <Badge
                          style={{
                            backgroundColor: user.role === 'student' ? '#FEE2E2' : '#D1FAE5',
                            color: user.role === 'student' ? '#E74C3C' : '#10b981',
                            border: 'none',
                          }}
                        >
                          {user.role === 'student' ? 'Élève' : 'Tuteur'}
                        </Badge>
                        {user.role === 'tutor' && (
                          <Badge variant="outline" style={{ borderColor: user.approved ? '#10b981' : '#F39C12', color: user.approved ? '#10b981' : '#F39C12' }}>
                            {user.approved ? 'Approuvé' : 'En attente'}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-sm" style={{ color: '#7F8C8D' }}>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Membre depuis {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      {user.role === 'student' && user.schoolLevel && (
                        <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: '#2E5CA8' }}>
                          <GraduationCap className="h-4 w-4" />
                          Niveau scolaire : {user.schoolLevel}
                        </div>
                      )}

                      {user.role === 'tutor' && (
                        <div className="mt-3 space-y-3">
                          {typeof user.hourlyRate === 'number' && (
                            <div className="text-sm font-medium" style={{ color: '#2E5CA8' }}>
                              Tarif : {user.hourlyRate.toFixed(2)} $/h
                            </div>
                          )}

                          {user.subjects && user.subjects.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {user.subjects.map(subject => (
                                <Badge key={subject} variant="outline" style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}>
                                  <BookOpen className="mr-1 h-3 w-3" />
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {user.levels && user.levels.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {user.levels.map(level => (
                                <Badge key={level} variant="outline" style={{ borderColor: '#7F8C8D', color: '#7F8C8D' }}>
                                  {level}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {user.bio && (
                            <p className="max-w-3xl text-sm" style={{ color: '#7F8C8D' }}>
                              {user.bio}
                            </p>
                          )}

                          {/* Infos bancaires */}
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                              <Building2 className="h-4 w-4 text-blue-600" />
                              Informations bancaires
                            </div>
                            {user.bankInfo && user.bankInfo.account_number ? (
                              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
                                {user.bankInfo.account_holder && (
                                  <span>Titulaire : <strong>{user.bankInfo.account_holder}</strong></span>
                                )}
                                {user.bankInfo.institution_name && (
                                  <span>Banque : <strong>{user.bankInfo.institution_name}</strong></span>
                                )}
                                {user.bankInfo.transit_number && (
                                  <span>Transit : <strong>{user.bankInfo.transit_number}</strong></span>
                                )}
                                {user.bankInfo.institution_number && (
                                  <span>Institution : <strong>{user.bankInfo.institution_number}</strong></span>
                                )}
                                <span>Compte : <strong>••••{user.bankInfo.account_number.slice(-4)}</strong></span>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 italic">Aucune information bancaire enregistrée</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ color: '#2E5CA8' }}
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" style={{ color: '#E74C3C' }} disabled title="Suppression non activée pour le moment">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <EditUserDialog
        user={editingUser}
        isOpen={showEditDialog}
        onClose={() => { setShowEditDialog(false); setEditingUser(null); }}
        onSave={handleSaveUser}
      />

      <CreateAccountDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreateUser}
      />
    </div>
  );
}
