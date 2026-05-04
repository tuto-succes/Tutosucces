import { useState, useEffect } from 'react';
import { UserPlus, Check, X, Mail, Phone, GraduationCap, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

interface TutorApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  schoolLevel: string;
  experience: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export function AdminTutorApplications() {
  const [applications, setApplications] = useState<TutorApplication[]>([
    {
      id: 'app-1',
      name: 'Marie Dubois',
      email: 'marie.dubois@example.com',
      phone: '(514) 555-1234',
      subjects: ['Mathématiques', 'Physique'],
      schoolLevel: 'Université - Génie',
      experience: '3 ans d\'expérience en tutorat privé, spécialisée en mathématiques avancées et physique. J\'ai aidé plus de 20 élèves à améliorer leurs notes.',
      motivation: 'Je suis passionnée par l\'enseignement et j\'aime aider les élèves à surmonter leurs difficultés. Mon approche pédagogique est personnalisée et bienveillante.',
      status: 'pending',
      appliedAt: '2026-03-01T10:30:00',
    },
    {
      id: 'app-2',
      name: 'Alexandre Martin',
      email: 'alex.martin@example.com',
      phone: '(438) 555-5678',
      subjects: ['Français', 'Anglais', 'Histoire'],
      schoolLevel: 'Université - Études littéraires',
      experience: '2 ans comme tuteur dans un centre d\'aide aux devoirs. Expérience avec élèves de tous les niveaux.',
      motivation: 'L\'éducation est ma vocation. Je crois fermement que chaque élève peut réussir avec le bon accompagnement.',
      status: 'pending',
      appliedAt: '2026-02-28T14:20:00',
    },
    {
      id: 'app-3',
      name: 'Sophie Tremblay',
      email: 'sophie.tremblay@example.com',
      phone: '(450) 555-9012',
      subjects: ['Chimie', 'Biologie'],
      schoolLevel: 'Université - Sciences de la santé',
      experience: 'Tutrice depuis 4 ans, j\'ai accompagné des élèves du secondaire et du CÉGEP en sciences. Taux de réussite de 95%.',
      motivation: 'J\'adore rendre les sciences accessibles et passionnantes. Mon objectif est d\'inspirer les élèves à poursuivre dans ce domaine.',
      status: 'pending',
      appliedAt: '2026-02-27T09:15:00',
    },
  ]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const filteredApplications = applications.filter((app) =>
    filter === 'all' ? true : app.status === filter
  );

  const pendingCount = applications.filter((app) => app.status === 'pending').length;

  async function handleApprove(applicationId: string) {
    // En mode mock, on simule l'approbation
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: 'approved' as const } : app
      )
    );
  }

  async function handleReject(applicationId: string) {
    // En mode mock, on simule le rejet
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: 'rejected' as const } : app
      )
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold" style={{ color: '#2C3E50' }}>
          Demandes de tutorat
        </h3>
        <p className="text-sm mt-1" style={{ color: '#7F8C8D' }}>
          Gérez les candidatures pour devenir tuteur sur la plateforme
        </p>
      </div>

      {/* Alert pour les demandes en attente */}
      {pendingCount > 0 && (
        <Alert style={{ backgroundColor: '#FEF3E2', border: '1px solid #F39C12' }}>
          <Clock className="h-4 w-4" style={{ color: '#F39C12' }} />
          <AlertDescription style={{ color: '#F39C12' }}>
            <strong>{pendingCount}</strong> demande{pendingCount > 1 ? 's' : ''} en attente de traitement
          </AlertDescription>
        </Alert>
      )}

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              style={filter === 'all' ? { backgroundColor: '#2E5CA8', color: 'white' } : {}}
            >
              Toutes ({applications.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              style={filter === 'pending' ? { backgroundColor: '#F39C12', color: 'white' } : {}}
            >
              En attente ({applications.filter((a) => a.status === 'pending').length})
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
              style={filter === 'approved' ? { backgroundColor: '#10b981', color: 'white' } : {}}
            >
              Approuvées ({applications.filter((a) => a.status === 'approved').length})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
              style={filter === 'rejected' ? { backgroundColor: '#E74C3C', color: 'white' } : {}}
            >
              Rejetées ({applications.filter((a) => a.status === 'rejected').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des demandes */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: '#7F8C8D' }} />
              <p className="font-medium" style={{ color: '#2C3E50' }}>Aucune demande</p>
              <p className="text-sm mt-2" style={{ color: '#7F8C8D' }}>
                Les nouvelles demandes apparaîtront ici
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                      style={{ backgroundColor: '#2E5CA8' }}
                    >
                      {application.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{application.name}</CardTitle>
                        <Badge
                          style={{
                            backgroundColor:
                              application.status === 'pending'
                                ? '#FEF3E2'
                                : application.status === 'approved'
                                ? '#D1FAE5'
                                : '#FEE2E2',
                            color:
                              application.status === 'pending'
                                ? '#F39C12'
                                : application.status === 'approved'
                                ? '#10b981'
                                : '#E74C3C',
                            border: 'none',
                          }}
                        >
                          {application.status === 'pending'
                            ? 'En attente'
                            : application.status === 'approved'
                            ? 'Approuvée'
                            : 'Rejetée'}
                        </Badge>
                      </div>
                      <CardDescription>
                        Demande reçue le{' '}
                        {new Date(application.appliedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  {application.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        style={{ backgroundColor: '#10b981', color: 'white' }}
                        onClick={() => handleApprove(application.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        style={{ borderColor: '#E74C3C', color: '#E74C3C' }}
                        onClick={() => handleReject(application.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coordonnées */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                      <Mail className="h-4 w-4" />
                      {application.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                      <Phone className="h-4 w-4" />
                      {application.phone}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#7F8C8D' }}>
                      <GraduationCap className="h-4 w-4" />
                      {application.schoolLevel}
                    </div>
                  </div>
                </div>

                {/* Matières */}
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Matières enseignées
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {application.subjects.map((subject) => (
                      <Badge
                        key={subject}
                        variant="outline"
                        style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Expérience */}
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Expérience
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm" style={{ color: '#7F8C8D' }}>
                      {application.experience}
                    </p>
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                    Motivation
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm" style={{ color: '#7F8C8D' }}>
                      {application.motivation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
