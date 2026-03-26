import { useState, useEffect } from 'react';
import { Search, Star, MapPin, Calendar, Clock, BookOpen, CalendarClock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { getMockTutors, simulateNetworkDelay, getAllSubjects, isTutorAvailable } from '../../utils/mockData';
import { supabase } from '../../app/core/supabase.client';

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
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDuration, setBookingDuration] = useState('2');
  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  const availableSubjects = getAllSubjects();

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    filterTutors();
  }, [tutors, searchQuery, subjectFilter, levelFilter, searchDate, searchTime, searchDuration]);

  async function fetchTutors() {
    try {
      // Récupérer tous les tuteurs
      const { data: tutorsData, error: tutorsError } = await supabase
        .from('profiles')
        .select('id, name, email, phone, avatar_url, role')
        .eq('role', 'tutor');

      if (tutorsError) throw tutorsError;

      // Récupérer les disponibilités de tous les tuteurs
      const { data: availabilitiesData, error: availError } = await supabase
        .from('tutor_availability')
        .select('*')
        .eq('is_recurring', true);

      if (availError) throw availError;

      // Mapper les tuteurs avec leurs disponibilités
      const tutorsWithAvailability = (tutorsData || []).map((tutor: any) => {
        const tutorAvailabilities = (availabilitiesData || []).filter(
          (avail: any) => avail.tutor_id === tutor.id
        );

        // Regrouper les créneaux par jour de la semaine pour le format attendu par isTutorAvailable
        const savedTutorProfileRaw = localStorage.getItem(`mockTutorProfile:${tutor.id}`) || localStorage.getItem('mockTutorProfile');
        let savedTutorProfile: any = null;
        if (savedTutorProfileRaw) {
          try {
            const parsedProfile = JSON.parse(savedTutorProfileRaw);
            if (parsedProfile.id === tutor.id) {
              savedTutorProfile = parsedProfile;
            }
          } catch (storageError) {
            console.error('Error parsing tutor profile from storage:', storageError);
          }
        }

        const availabilityByDay: Record<number, any> = {};
        tutorAvailabilities.forEach((avail: any) => {
          if (!availabilityByDay[avail.day_of_week]) {
            availabilityByDay[avail.day_of_week] = {
              dayOfWeek: avail.day_of_week,
              slots: []
            };
          }
          availabilityByDay[avail.day_of_week].slots.push({
            start: avail.start_time,
            end: avail.end_time
          });
        });

        const availability = Object.values(availabilityByDay);

        // Créer une liste lisible des jours disponibles
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const availableDays = Array.from(
          new Set(tutorAvailabilities.map((a: any) => dayNames[a.day_of_week]))
        );

        return {
          id: tutor.id,
          userId: tutor.id,
          user: {
            name: tutor.name,
            email: tutor.email
          },
          name: tutor.name,
          email: tutor.email,
          phone: tutor.phone,
          avatar: tutor.avatar_url,
          bio: savedTutorProfile?.bio || 'Tuteur Tuto-Succes',
          subjects: savedTutorProfile?.subjects?.length ? savedTutorProfile.subjects : ['Mathématiques', 'Français', 'Anglais'],
          levels: savedTutorProfile?.levels?.length ? savedTutorProfile.levels : ['Primaire', 'Secondaire 1', 'Secondaire 3'],
          rating: 4.5,
          reviewCount: 12,
          rate: savedTutorProfile?.rate || 35,
          active: savedTutorProfile?.active ?? true,
          availability: availability,
          availabilities: tutorAvailabilities,
          availableDays: availableDays
        };
      });

      setTutors(tutorsWithAvailability.filter((tutor: any) => tutor.active !== false));
    } catch (error) {
      console.error('Error fetching tutors from DB:', error);
      // Fallback aux données mock
      const data = await getMockTutors();
      setTutors(data);
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
    if (!selectedTutor || !bookingDate || !bookingTime || !bookingSubject) {
      alert('Veuillez remplir tous les champs obligatoires (date, créneau et matière)');
      return;
    }

    // Vérifier si la matière est enseignée par le tuteur
    if (!selectedTutor.subjects?.includes(bookingSubject)) {
      alert('Ce tuteur n\'enseigne pas cette matière');
      return;
    }

    try {
      await simulateNetworkDelay();

      const sessionDate = bookingDate;
      
      // Calculer l'heure de fin basée sur la durée
      const startTimeDate = new Date(`2000-01-01T${bookingTime}`);
      const endTimeDate = new Date(startTimeDate.getTime() + parseFloat(bookingDuration) * 60 * 60 * 1000);
      const startTime = bookingTime;
      const endTime = endTimeDate.toTimeString().slice(0, 5); // HH:MM format

      // Calculer le prix total
      const totalPrice = (selectedTutor.rate || 35) * parseFloat(bookingDuration);

      // Insertion dans la table sessions
      const { error } = await supabase
        .from('sessions')
        .insert([
          {
            student_id: userId,
            tutor_id: selectedTutor.id,
            subject: bookingSubject,
            level: 'Secondaire 3', // À demander à l'utilisateur
            session_date: sessionDate,
            start_time: startTime,
            end_time: endTime,
            duration_minutes: Math.round(parseFloat(bookingDuration) * 60),
            status: 'pending',
            price_per_hour: selectedTutor.rate || 35,
            total_price: totalPrice,
            student_notes: bookingNotes,
            payment_status: 'pending'
          }
        ]);

      if (error) throw error;
      
      alert('Demande de réservation envoyée avec succès. Le paiement sera demandé après la séance, une fois marquée terminée par le tuteur.');
      setSelectedTutor(null);
      setBookingDate('');
      setBookingTime('');
      setBookingDuration('2');
      setBookingSubject('');
      setBookingNotes('');
    } catch (error: any) {
      console.error('Error booking session:', error);
      alert(`❌ Erreur lors de la réservation: ${error.message || JSON.stringify(error)}`);
    }
  }

  function handleSelectTutor(tutor: any) {
    setSelectedTutor(tutor);
    
    // Pré-remplir la date de réservation si l'utilisateur a fait une recherche par date/heure
    if (searchDate && searchTime) {
      setBookingDate(searchDate);
      setBookingTime(searchTime);
      setBookingDuration(searchDuration);
    } else {
      setBookingDate('');
      setBookingTime('');
      setBookingDuration('2');
    }
    
    // Pré-sélectionner la matière si filtré
    if (subjectFilter && tutor.subjects?.includes(subjectFilter)) {
      setBookingSubject(subjectFilter);
    } else {
      setBookingSubject('');
    }
  }

  function buildBookingSlots(tutor: any, date: string, duration: string): string[] {
    if (!tutor || !date) {
      return [];
    }

    const [year, month, day] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const dayOfWeek = selectedDate.getDay();
    const durationMinutes = Math.round(parseFloat(duration) * 60);
    const dayBlocks = tutor.availability?.filter((block: any) => block.dayOfWeek === dayOfWeek) || [];
    const generatedSlots: string[] = [];

    dayBlocks.forEach((dayBlock: any) => {
      (dayBlock.slots || []).forEach((slot: any) => {
        const [startHour, startMinute] = slot.start.split(':').map(Number);
        const [endHour, endMinute] = slot.end.split(':').map(Number);
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;

        let current = startTotalMinutes;
        while (current + durationMinutes <= endTotalMinutes) {
          const hours = String(Math.floor(current / 60)).padStart(2, '0');
          const minutes = String(current % 60).padStart(2, '0');
          generatedSlots.push(`${hours}:${minutes}`);
          current += 60;
        }
      });
    });

    return Array.from(new Set(generatedSlots)).sort();
  }

  function formatSlotLabel(time: string, duration: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, hours, minutes);
    const endDate = new Date(startDate.getTime() + parseFloat(duration) * 60 * 60 * 1000);

    return `${startDate.toLocaleTimeString('fr-CA', { hour: 'numeric', minute: '2-digit' })} - ${endDate.toLocaleTimeString('fr-CA', { hour: 'numeric', minute: '2-digit' })}`;
  }

  const bookingSlots = selectedTutor ? buildBookingSlots(selectedTutor, bookingDate, bookingDuration) : [];

  useEffect(() => {
    if (bookingTime && !bookingSlots.includes(bookingTime)) {
      setBookingTime('');
    }
  }, [bookingTime, bookingSlots]);

  function formatAvailability(tutor: any): string {
    if (!tutor.availability || tutor.availability.length === 0) {
      return 'Disponibilités flexibles';
    }

    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const availableDays = tutor.availability.map((a: any) => days[a.dayOfWeek]).join(', ');
    return availableDays;
  }

  function formatAvailabilityDetails(tutor: any): string {
    // Priorité à la structure déjà regroupée (tutor.availability)
    const dayBlocks = tutor.availability && tutor.availability.length > 0
      ? tutor.availability
      : (tutor.availabilities || []).reduce((acc: any, av: any) => {
          const existing = acc.find((e: any) => e.dayOfWeek === av.day_of_week);
          if (existing) {
            existing.slots.push({ start: av.start_time, end: av.end_time });
          } else {
            acc.push({ dayOfWeek: av.day_of_week, slots: [{ start: av.start_time, end: av.end_time }] });
          }
          return acc;
        }, []);

    if (!dayBlocks || dayBlocks.length === 0) {
      return 'Aucune disponibilité récurrente définie';
    }

    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return dayBlocks
      .map((dayBlock: any) => {
        const times = dayBlock.slots
          .map((slot: any) => `${slot.start} - ${slot.end}`)
          .join(', ');
        return `${days[dayBlock.dayOfWeek]}: ${times}`;
      })
      .join(' | ');
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
                    <SelectItem value="1.5">1.5 heures</SelectItem>
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
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Niveaux</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tutor.levels?.map((level: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Disponibilites</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatAvailability(tutor)}
                    </div>
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
                      <Label htmlFor="booking-date">Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="booking-date"
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Créneau <span className="text-red-500">*</span></Label>
                      {!bookingDate && (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                          Choisissez d&apos;abord une date pour voir les heures disponibles.
                        </div>
                      )}
                      {bookingDate && bookingSlots.length === 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          Aucun créneau disponible pour cette date.
                        </div>
                      )}
                      {bookingSlots.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {bookingSlots.map((slot) => {
                            const isActive = bookingTime === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setBookingTime(slot)}
                                className={[
                                  'rounded-xl border px-3 py-3 text-sm font-semibold transition-all',
                                  isActive
                                    ? 'border-[#2E5CA8] bg-[#2E5CA8] text-white shadow-sm'
                                    : 'border-amber-200 bg-amber-50 text-slate-800 hover:border-[#2E5CA8] hover:bg-blue-50',
                                ].join(' ')}
                              >
                                {formatSlotLabel(slot, bookingDuration)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking-duration">Durée <span className="text-red-500">*</span></Label>
                      <Select value={bookingDuration} onValueChange={setBookingDuration}>
                        <SelectTrigger id="booking-duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 heure</SelectItem>
                          <SelectItem value="1.5">1.5 heures</SelectItem>
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
                          <div className="text-gray-600">
                            Date: {bookingDate ? new Date(`${bookingDate}T00:00:00`).toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Non choisie'}
                          </div>
                          <div className="text-gray-600">Créneau: {bookingTime ? formatSlotLabel(bookingTime, bookingDuration) : 'Non choisi'}</div>
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

                    {/* Disponibilités hebdo direct tuteur */}
                    <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs font-bold text-blue-700">Jours disponibles</p>
                      <p className="text-sm text-gray-700">{formatAvailability(tutor)}</p>
                    </div>


                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertDescription>
                        Aucun paiement n&apos;est pris à la réservation. Après la séance terminée, vous aurez 5 jours pour payer.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={handleBookSession} 
                      className="w-full" 
                      style={{ backgroundColor: '#2E5CA8' }}
                      disabled={!bookingDate || !bookingTime || !bookingSubject}
                    >
                      Confirmer la réservation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>


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
