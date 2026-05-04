import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, Edit, Trash2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { getMockUsers } from '../../utils/mockData';
import { EditUserDialog } from './EditUserDialog';
import { CreateAccountDialog } from './CreateAccountDialog';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'tutor'>('all');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  async function fetchUsers() {
    try {
      const data = await getMockUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSaveUser(updatedUser: any) {
    // Mettre à jour dans localStorage
    const storedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const userIndex = storedUsers.findIndex((u: any) => u.id === updatedUser.id);
    
    if (userIndex !== -1) {
      storedUsers[userIndex] = updatedUser;
      localStorage.setItem('mockUsers', JSON.stringify(storedUsers));
      
      // Mettre à jour l'état local
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(u => {
        if (filterRole !== 'all' && u.role !== filterRole) return false;
        if (searchTerm && !u.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !u.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      }));
      
      alert(`✅ Modifications sauvegardées pour ${updatedUser.name}`);
    }
  }

  function handleCreateUser(newUser: any) {
    // Ajouter dans localStorage
    const storedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    storedUsers.push(newUser);
    localStorage.setItem('mockUsers', JSON.stringify(storedUsers));
    
    // Mettre à jour l'état local
    setUsers([...users, newUser]);
    
    alert(`✅ Compte créé avec succès pour ${newUser.name}\nEmail: ${newUser.email}\nMot de passe: ${newUser.password}`);
  }

  function filterUsers() {
    let filtered = users;

    // Filtrer par rôle
    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
            Gestion des utilisateurs
          </h3>
          <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <Button style={{ backgroundColor: '#2E5CA8', color: 'white' }} onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Créer un compte
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#7F8C8D' }} />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Liste des utilisateurs */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: '#7F8C8D' }} />
              <p className="font-medium" style={{ color: '#2C3E50' }}>Aucun utilisateur trouvé</p>
              <p className="text-sm mt-2" style={{ color: '#7F8C8D' }}>
                Ajustez vos filtres de recherche
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                      style={{ backgroundColor: user.role === 'student' ? '#E74C3C' : '#10b981' }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info utilisateur */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg" style={{ color: '#2C3E50' }}>
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
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                            <Phone className="h-4 w-4" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                          <Calendar className="h-4 w-4" />
                          Membre depuis {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      {/* Info spécifiques au tuteur */}
                      {user.role === 'tutor' && user.subjects && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {user.subjects.map((subject: string) => (
                            <Badge
                              key={subject}
                              variant="outline"
                              style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                            >
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
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
                    <Button variant="ghost" size="sm" style={{ color: '#E74C3C' }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog d'édition */}
      <EditUserDialog
        user={editingUser}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={handleSaveUser}
      />

      {/* Dialog de création de compte */}
      <CreateAccountDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreateUser}
      />
    </div>
  );
}