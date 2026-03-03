import { useState, useEffect } from 'react';
import { Search, Star, MapPin, Calendar, Clock, BookOpen, CreditCard, CalendarClock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { getMockTutors, simulateNetworkDelay, isTutorAvailable, getAllSubjects } from '../../utils/mockData';

interface TutorSearchProps {
  userId: string;
  accessToken: string;
}

export function TutorSearch({ userId, accessToken }: TutorSearchProps) {
  const [tutors, setTutors] = useState<any[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  
  // Nouveaux filtres pour la recherche par disponibilité
  const [searchDate, setSearchDate] = useState('');
  const [searchTime, setSearchTime] = useState('');
  const [searchDuration, setSearchDuration] = useState('2');
  
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingDuration, setBookingDuration] = useState('2');
  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const availableSubjects = getAllSubjects();

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    filterTutors();
  }, [tutors, searchQuery, subjectFilter, levelFilter, searchDate, searchTime, searchDuration]);

  async function fetchTutors() {
    try {
      const data = await getMockTutors();
      setTutors(data);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterTutors() {
    let filtered = [...tutors];

    // Filtre par texte de recherche
    if (searchQuery) {
      filtered = filtered.filter(tutor => 
        tutor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.subjects?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtre par matière
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(tutor => 
        tutor.subjects?.includes(subjectFilter)
      );
    }

    // Filtre par niveau
    if (levelFilter !== 'all') {
      filtered = filtered.filter(tutor => 
        tutor.levels?.includes(levelFilter)
      );
    }

    // Filtre par disponibilité (si date et heure sont spécifiées)
    if (searchDate && searchTime) {
      const requestedDateTime = new Date(`${searchDate}T${searchTime}`);
      const duration = parseFloat(searchDuration);
      
      filtered = filtered.filter(tutor => 
        isTutorAvailable(tutor, requestedDateTime, duration)
      );
    }

    setFilteredTutors(filtered);
  }

  async function handleBookSession() {
    if (!selectedTutor || !bookingDate || !bookingSubject) {
      alert('Veuillez remplir tous les champs obligatoires (date/heure et matière)');
      return;
    }

    // Vérifier si la matière est enseignée par le tuteur
    if (!selectedTutor.subjects?.includes(bookingSubject)) {
      alert('Ce tuteur n\'enseigne pas cette matière');
      return;
    }

    // Vérifier si le paiement a été effectué
    if (!paymentSuccess) {
      alert('Veuillez effectuer le paiement avant de confirmer la réservation');
      return;
    }

    try {
      await simulateNetworkDelay();
      
      alert('Demande de réservation envoyée avec succès!');
      setSelectedTutor(null);
      setBookingDate('');
      setBookingDuration('2');
      setBookingSubject('');
      setBookingNotes('');
      setPaymentSuccess(false);
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Erreur lors de la réservation');
    }
  }

  async function handlePayment() {
    setShowPaymentDialog(true);
  }

  async function processPayment() {
    try {
      await simulateNetworkDelay(1000);
      setPaymentSuccess(true);
      setShowPaymentDialog(false);
      alert('Paiement effectué avec succès! Vous pouvez maintenant confirmer votre réservation.');
    } catch (error) {
      alert('Erreur lors du paiement');
    }
  }

  function handleSelectTutor(tutor: any) {
    setSelectedTutor(tutor);
    setPaymentSuccess(false);
    
    // Pré-remplir la date de réservation si l'utilisateur a fait une recherche par date/heure
    if (searchDate && searchTime) {
      setBookingDate(`${searchDate}T${searchTime}`);
      setBookingDuration(searchDuration);
    } else {
      setBookingDate('');
      setBookingDuration('2');
    }
    
    // Pré-sélectionner la matière si filtré
    if (subjectFilter && tutor.subjects?.includes(subjectFilter)) {
      setBookingSubject(subjectFilter);
    } else {
      setBookingSubject('');
    }
  }

  function formatAvailability(tutor: any): string {
    if (!tutor.availability || tutor.availability.length === 0) {
      return 'Disponibilités flexibles';
    }

    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const availableDays = tutor.availability.map((a: any) => days[a.dayOfWeek]).join(', ');
    return availableDays;
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des tuteurs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher un tuteur</CardTitle>
          <CardDescription>
            Trouvez le tuteur parfait selon vos besoins et disponibilités
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recherche par disponibilité */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Recherche par disponibilité</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label htmlFor="search-date" className="text-sm">Date</Label>
                <Input
                  id="search-date"
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="search-time" className="text-sm">Heure</Label>
                <Input
                  id="search-time"
                  type="time"
                  value={searchTime}
                  onChange={(e) => setSearchTime(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="search-duration" className="text-sm">Durée</Label>
                <Select value={searchDuration} onValueChange={setSearchDuration}>
                  <SelectTrigger id="search-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 heure</SelectItem>
                    <SelectItem value="1.5">1h30</SelectItem>
                    <SelectItem value="2">2 heures</SelectItem>
                    <SelectItem value="3">3 heures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => filterTutors()} 
                  className="w-full"
                  style={{ backgroundColor: '#2E5CA8' }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>
            {searchDate && searchTime && (
              <p className="text-sm text-blue-700 mt-2">
                📅 Recherche pour le {new Date(searchDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} à {searchTime} ({searchDuration}h)
              </p>
            )}
          </div>

          {/* Autres filtres */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <h3 className="font-semibold">Filtres supplémentaires</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="subject-filter" className="text-sm">Matière</Label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger id="subject-filter">
                    <SelectValue placeholder="Toutes les matières" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les matières</SelectItem>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="level-filter" className="text-sm">Niveau</Label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger id="level-filter">
                    <SelectValue placeholder="Tous les niveaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="Primaire">Primaire</SelectItem>
                    <SelectItem value="Secondaire">Secondaire</SelectItem>
                    <SelectItem value="CÉGEP">CÉGEP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="name-search" className="text-sm">Recherche</Label>
                <Input
                  id="name-search"
                  placeholder="Nom, matière..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      {filteredTutors.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredTutors.length}</span> tuteur(s) trouvé(s)
          </p>
          {searchDate && searchTime && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchDate('');
                setSearchTime('');
              }}
            >
              Réinitialiser la recherche par date
            </Button>
          )}
        </div>
      )}

      {/* Tutors List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutors.map((tutor) => (
          <Card key={tutor.userId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div>
                <CardTitle className="text-lg">{tutor.user?.name || 'Tuteur'}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{tutor.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-xs text-gray-500">({tutor.reviewCount || 0} avis)</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-3">
                {tutor.bio || 'Pas de description'}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Matières</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tutor.subjects?.map((subject: string, idx: number) => (
                        <Badge 
                          key={idx} 
                          variant={subject === subjectFilter ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div className="text-sm text-gray-600">
                    {formatAvailability(tutor)}
                  </div>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSelectTutor(tutor)}
                    style={{ backgroundColor: '#2E5CA8' }}
                  >
                    Réserver une séance
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Réserver avec {tutor.user?.name}</DialogTitle>
                    <DialogDescription>
                      Tarif: {tutor.rate} $/heure CAD
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="booking-date">Date et heure <span className="text-red-500">*</span></Label>
                      <Input
                        id="booking-date"
                        type="datetime-local"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking-duration">Durée <span className="text-red-500">*</span></Label>
                      <Select value={bookingDuration} onValueChange={setBookingDuration}>
                        <SelectTrigger id="booking-duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 heure</SelectItem>
                          <SelectItem value="1.5">1h30</SelectItem>
                          <SelectItem value="2">2 heures</SelectItem>
                          <SelectItem value="3">3 heures</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking-subject">Matière <span className="text-red-500">*</span></Label>
                      <Select value={bookingSubject} onValueChange={setBookingSubject}>
                        <SelectTrigger id="booking-subject">
                          <SelectValue placeholder="Sélectionnez une matière" />
                        </SelectTrigger>
                        <SelectContent>
                          {tutor.subjects?.map((subject: string) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking-notes">Notes / Objectifs (optionnel)</Label>
                      <Textarea
                        id="booking-notes"
                        placeholder="Décrivez vos besoins ou objectifs pour cette séance..."
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <div className="text-gray-600">Durée: {bookingDuration}h</div>
                          <div className="text-gray-600">Tarif: {tutor.rate} $/h</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Total estimé:</div>
                          <div className="font-bold text-lg" style={{ color: '#E74C3C' }}>
                            {(tutor.rate * parseFloat(bookingDuration)).toFixed(2)} $ CAD
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vérification de disponibilité */}
                    {bookingDate && (
                      <Alert className={
                        isTutorAvailable(tutor, new Date(bookingDate), parseFloat(bookingDuration))
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }>
                        <Clock className={`h-4 w-4 ${
                          isTutorAvailable(tutor, new Date(bookingDate), parseFloat(bookingDuration))
                            ? "text-green-600"
                            : "text-red-600"
                        }`} />
                        <AlertDescription className={
                          isTutorAvailable(tutor, new Date(bookingDate), parseFloat(bookingDuration))
                            ? "text-green-700"
                            : "text-red-700"
                        }>
                          {isTutorAvailable(tutor, new Date(bookingDate), parseFloat(bookingDuration))
                            ? "✓ Le tuteur est disponible à cette date/heure"
                            : "✗ Le tuteur n'est pas disponible à cette date/heure. Veuillez choisir un autre créneau."
                          }
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Section de paiement */}
                    {!paymentSuccess ? (
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <CreditCard className="h-4 w-4" />
                        <AlertDescription>
                          Le paiement est requis avant de confirmer la réservation.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-green-50 border-green-200">
                        <CreditCard className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-600">
                          Paiement effectué avec succès! Vous pouvez maintenant confirmer votre réservation.
                        </AlertDescription>
                      </Alert>
                    )}

                    {!paymentSuccess ? (
                      <Button 
                        onClick={handlePayment} 
                        className="w-full" 
                        style={{ backgroundColor: '#E74C3C' }}
                        disabled={!bookingDate || !bookingSubject || (bookingDate && !isTutorAvailable(tutor, new Date(bookingDate), parseFloat(bookingDuration)))}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Procéder au paiement ({(tutor.rate * parseFloat(bookingDuration)).toFixed(2)} $ CAD)
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleBookSession} 
                        className="w-full" 
                        style={{ backgroundColor: '#2E5CA8' }}
                      >
                        Confirmer la réservation
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de paiement simulé */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Paiement sécurisé</DialogTitle>
            <DialogDescription>
              Intégration Stripe (à configurer)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Mode démonstration</strong><br />
                Le paiement Stripe sera configuré ultérieurement. Pour l'instant, cliquez sur "Simuler le paiement" pour continuer.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Tuteur:</span>
                <span className="font-medium">{selectedTutor?.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Matière:</span>
                <span className="font-medium">{bookingSubject || 'Non spécifiée'}</span>
              </div>
              <div className="flex justify-between">
                <span>Durée:</span>
                <span className="font-medium">{bookingDuration}h</span>
              </div>
              <div className="flex justify-between">
                <span>Tarif:</span>
                <span className="font-medium">{selectedTutor?.rate} $/h</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span style={{ color: '#E74C3C' }}>
                  {selectedTutor ? (selectedTutor.rate * parseFloat(bookingDuration)).toFixed(2) : '0.00'} $ CAD
                </span>
              </div>
            </div>

            <Button 
              onClick={processPayment} 
              className="w-full" 
              style={{ backgroundColor: '#2E5CA8' }}
            >
              Simuler le paiement
            </Button>
            <Button onClick={() => setShowPaymentDialog(false)} variant="outline" className="w-full">
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredTutors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-2">
              Aucun tuteur trouvé avec ces critères.
            </p>
            {searchDate && searchTime && (
              <p className="text-sm text-gray-400">
                Essayez de modifier la date/heure ou la durée de la session.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}