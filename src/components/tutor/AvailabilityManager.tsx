import { useState, useEffect } from 'react';
import { Clock, Plus, Copy, Trash2, Save, CalendarDays, AlertCircle, Check, X, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { supabase } from '../../app/core/supabase.client';
import { projectId } from '../../utils/supabase/info';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  dayOfWeek: number;
  label: string;
  enabled: boolean;
  slots: TimeSlot[];
}

interface AvailabilityManagerProps {
  tutorId: string;
  accessToken: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dimanche', short: 'Dim' },
  { value: 1, label: 'Lundi', short: 'Lun' },
  { value: 2, label: 'Mardi', short: 'Mar' },
  { value: 3, label: 'Mercredi', short: 'Mer' },
  { value: 4, label: 'Jeudi', short: 'Jeu' },
  { value: 5, label: 'Vendredi', short: 'Ven' },
  { value: 6, label: 'Samedi', short: 'Sam' }
];

const QUICK_PRESETS = [
  { 
    name: 'Matinée (9h-12h)', 
    startTime: '09:00', 
    endTime: '12:00',
    icon: '🌅'
  },
  { 
    name: 'Après-midi (13h-17h)', 
    startTime: '13:00', 
    endTime: '17:00',
    icon: '☀️'
  },
  { 
    name: 'Soirée (18h-21h)', 
    startTime: '18:00', 
    endTime: '21:00',
    icon: '🌙'
  },
  { 
    name: 'Journée complète (9h-17h)', 
    startTime: '09:00', 
    endTime: '17:00',
    icon: '📅'
  }
];

export function AvailabilityManager({ tutorId }: AvailabilityManagerProps) {
  const [daysAvailability, setDaysAvailability] = useState<DayAvailability[]>(
    DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.value,
      label: day.label,
      enabled: false,
      slots: []
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    loadAvailabilities();
  }, [tutorId]);

  async function loadAvailabilities() {
    try {
      const { data: availabilities, error } = await supabase
        .from('tutor_availability')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      // Convert database format to UI format
      const updatedDays = DAYS_OF_WEEK.map(day => {
        const daySlots = availabilities?.filter((slot: any) => slot.day_of_week === day.value) || [];
        return {
          dayOfWeek: day.value,
          label: day.label,
          enabled: daySlots.length > 0,
          slots: daySlots.map((slot: any) => ({
            id: slot.id,
            startTime: slot.start_time,
            endTime: slot.end_time
          }))
        };
      });
      
      setDaysAvailability(updatedDays);
    } catch (error) {
      console.error('Error loading availabilities:', error);
      alert('Erreur lors du chargement des disponibilités');
    } finally {
      setLoading(false);
    }
  }

  async function saveAvailabilities() {
    setSaving(true);
    try {
      // First, delete all existing availabilities for this tutor
      const { error: deleteError } = await supabase
        .from('tutor_availability')
        .delete()
        .eq('tutor_id', tutorId);

      if (deleteError) throw deleteError;

      // Prepare new availability records
      const newAvailabilities = daysAvailability.flatMap(day => 
        day.enabled ? day.slots.map(slot => ({
          tutor_id: tutorId,
          day_of_week: day.dayOfWeek,
          start_time: slot.startTime,
          end_time: slot.endTime,
          is_recurring: true,
          is_available: true
        })) : []
      );

      // Insert new availabilities if any
      if (newAvailabilities.length > 0) {
        const { error: insertError } = await supabase
          .from('tutor_availability')
          .insert(newAvailabilities);

        if (insertError) throw insertError;
      }

      alert('✅ Disponibilités sauvegardées avec succès !');
      setHasChanges(false);
      await loadAvailabilities();
    } catch (error) {
      console.error('Error saving availabilities:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(dayValue: number) {
    setDaysAvailability(days => days.map(day => {
      if (day.dayOfWeek === dayValue) {
        const newEnabled = !day.enabled;
        // If enabling and no slots, add a default slot
        if (newEnabled && day.slots.length === 0) {
          return {
            ...day,
            enabled: true,
            slots: [{
              id: crypto.randomUUID(),
              startTime: '09:00',
              endTime: '17:00'
            }]
          };
        }
        return { ...day, enabled: newEnabled };
      }
      return day;
    }));
    setHasChanges(true);
  }

  function addTimeSlot(dayValue: number) {
    setDaysAvailability(days => days.map(day => {
      if (day.dayOfWeek === dayValue) {
        const newSlot: TimeSlot = {
          id: crypto.randomUUID(),
          startTime: '09:00',
          endTime: '17:00'
        };
        return {
          ...day,
          enabled: true,
          slots: [...day.slots, newSlot]
        };
      }
      return day;
    }));
    setHasChanges(true);
  }

  function removeTimeSlot(dayValue: number, slotId: string) {
    setDaysAvailability(days => days.map(day => {
      if (day.dayOfWeek === dayValue) {
        const newSlots = day.slots.filter(slot => slot.id !== slotId);
        return {
          ...day,
          slots: newSlots,
          enabled: newSlots.length > 0 ? day.enabled : false
        };
      }
      return day;
    }));
    setHasChanges(true);
  }

  function updateTimeSlot(dayValue: number, slotId: string, field: 'startTime' | 'endTime', value: string) {
    setDaysAvailability(days => days.map(day => {
      if (day.dayOfWeek === dayValue) {
        return {
          ...day,
          slots: day.slots.map(slot =>
            slot.id === slotId ? { ...slot, [field]: value } : slot
          )
        };
      }
      return day;
    }));
    setHasChanges(true);
  }

  function applyPreset(dayValue: number, preset: typeof QUICK_PRESETS[0]) {
    setDaysAvailability(days => days.map(day => {
      if (day.dayOfWeek === dayValue) {
        const newSlot: TimeSlot = {
          id: crypto.randomUUID(),
          startTime: preset.startTime,
          endTime: preset.endTime
        };
        return {
          ...day,
          enabled: true,
          slots: [...day.slots, newSlot]
        };
      }
      return day;
    }));
    setHasChanges(true);
  }

  function copyToAllDays(dayValue: number) {
    const sourceDay = daysAvailability.find(d => d.dayOfWeek === dayValue);
    if (!sourceDay || sourceDay.slots.length === 0) return;

    setDaysAvailability(days => days.map(day => {
      if (day.dayOfWeek === dayValue) return day;
      
      const newSlots = sourceDay.slots.map(slot => ({
        id: crypto.randomUUID(),
        startTime: slot.startTime,
        endTime: slot.endTime
      }));

      return {
        ...day,
        enabled: true,
        slots: [...day.slots, ...newSlots]
      };
    }));
    setHasChanges(true);
  }

  function clearAllDays() {
    if (!confirm('Êtes-vous sûr de vouloir effacer toutes les disponibilités ?')) return;
    
    setDaysAvailability(days => days.map(day => ({
      ...day,
      enabled: false,
      slots: []
    })));
    setHasChanges(true);
  }

  function applyWeekdaySchedule() {
    const weekdaySchedule = {
      startTime: '09:00',
      endTime: '17:00'
    };

    setDaysAvailability(days => days.map(day => {
      // Skip weekend (0 = dimanche, 6 = samedi)
      if (day.dayOfWeek === 0 || day.dayOfWeek === 6) return day;
      
      return {
        ...day,
        enabled: true,
        slots: [{
          id: crypto.randomUUID(),
          startTime: weekdaySchedule.startTime,
          endTime: weekdaySchedule.endTime
        }]
      };
    }));
    setHasChanges(true);
  }

  const totalSlots = daysAvailability.reduce((sum, day) => sum + (day.enabled ? day.slots.length : 0), 0);
  const enabledDays = daysAvailability.filter(day => day.enabled).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E74C3C' }}></div>
          <p className="text-sm" style={{ color: '#7F8C8D' }}>Chargement des disponibilités...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#2C3E50' }}>
            <CalendarDays className="h-7 w-7" style={{ color: '#E74C3C' }} />
            Mes disponibilités
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#7F8C8D' }}>
            Définissez vos plages horaires disponibles pour recevoir des demandes de séances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-4 px-4 py-2 bg-white border-2 rounded-lg" style={{ borderColor: '#F8F9FA' }}>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>{enabledDays}</div>
              <div className="text-xs" style={{ color: '#7F8C8D' }}>jours actifs</div>
            </div>
            <div className="border-l" style={{ borderColor: '#F8F9FA' }}></div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#2E5CA8' }}>{totalSlots}</div>
              <div className="text-xs" style={{ color: '#7F8C8D' }}>créneaux</div>
            </div>
          </div>

          <Button
            onClick={saveAvailabilities}
            disabled={saving || !hasChanges}
            className="text-white shadow-lg"
            style={{ 
              backgroundColor: hasChanges ? '#E74C3C' : '#7F8C8D',
              opacity: (!saving && hasChanges) ? 1 : 0.6
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : hasChanges ? 'Enregistrer les modifications' : 'Aucun changement'}
          </Button>
        </div>
      </div>

      {/* Actions rapides */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2" style={{ borderColor: '#E3F2FD' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#2C3E50' }}>
          <Clock className="h-5 w-5" style={{ color: '#2E5CA8' }} />
          Actions rapides
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={applyWeekdaySchedule}
            variant="outline"
            className="border-2"
            style={{ borderColor: '#2E5CA8', color: '#2E5CA8' }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Semaine complète (Lun-Ven 9h-17h)
          </Button>
          <Button
            onClick={clearAllDays}
            variant="outline"
            className="border-2"
            style={{ borderColor: '#E74C3C', color: '#E74C3C' }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Tout effacer
          </Button>
        </div>
      </Card>

      {/* Vue en calendrier hebdomadaire */}
      <div className="grid grid-cols-1 gap-4">
        {daysAvailability.map((day, index) => {
          const dayInfo = DAYS_OF_WEEK[index];
          const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;
          
          return (
            <Card 
              key={day.dayOfWeek} 
              className={`overflow-hidden transition-all ${day.enabled ? 'border-2' : 'border'}`}
              style={{ 
                borderColor: day.enabled ? '#E74C3C' : '#E5E7EB',
                backgroundColor: isWeekend ? '#FAFAFA' : '#FFFFFF'
              }}
            >
              {/* En-tête du jour */}
              <div 
                className="p-4 flex items-center justify-between"
                style={{ 
                  backgroundColor: day.enabled 
                    ? 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'
                    : '#F8F9FA',
                  background: day.enabled 
                    ? 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'
                    : '#F8F9FA'
                }}
              >
                <div className="flex items-center gap-4">
                  <Switch
                    checked={day.enabled}
                    onCheckedChange={() => toggleDay(day.dayOfWeek)}
                    className="data-[state=checked]:bg-white"
                  />
                  <div>
                    <h3 
                      className="text-lg font-bold"
                      style={{ color: day.enabled ? '#FFFFFF' : '#2C3E50' }}
                    >
                      {day.label}
                    </h3>
                    {day.enabled && day.slots.length > 0 && (
                      <p className="text-sm opacity-90" style={{ color: '#FFFFFF' }}>
                        {day.slots.length} créneau{day.slots.length > 1 ? 'x' : ''} défini{day.slots.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {day.enabled && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-white/20 text-white border-white/30"
                    >
                      Actif
                    </Badge>
                    {day.slots.length > 0 && (
                      <Button
                        onClick={() => copyToAllDays(day.dayOfWeek)}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copier à tous
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Contenu du jour */}
              {day.enabled && (
                <div className="p-4 space-y-4">
                  {/* Créneaux horaires */}
                  {day.slots.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {day.slots.map((slot) => (
                        <div 
                          key={slot.id} 
                          className="p-4 rounded-lg border-2 bg-white shadow-sm hover:shadow-md transition-shadow"
                          style={{ borderColor: '#E3F2FD' }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" style={{ color: '#2E5CA8' }} />
                              <span className="text-sm font-semibold" style={{ color: '#2C3E50' }}>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <button
                              onClick={() => removeTimeSlot(day.dayOfWeek, slot.id)}
                              className="p-1 rounded hover:bg-red-50 transition-colors"
                              title="Supprimer ce créneau"
                            >
                              <X className="h-4 w-4" style={{ color: '#E74C3C' }} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs font-medium mb-1 block" style={{ color: '#7F8C8D' }}>
                                Début
                              </label>
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateTimeSlot(day.dayOfWeek, slot.id, 'startTime', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ 
                                  borderColor: '#E5E7EB',
                                  '--tw-ring-color': '#2E5CA8'
                                } as any}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block" style={{ color: '#7F8C8D' }}>
                                Fin
                              </label>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateTimeSlot(day.dayOfWeek, slot.id, 'endTime', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ 
                                  borderColor: '#E5E7EB',
                                  '--tw-ring-color': '#2E5CA8'
                                } as any}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Créneaux prédéfinis */}
                  <div>
                    <p className="text-sm font-medium mb-2" style={{ color: '#7F8C8D' }}>
                      Ajouter un créneau prédéfini :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyPreset(day.dayOfWeek, preset)}
                          className="px-3 py-2 text-sm rounded-lg border-2 hover:shadow-md transition-all font-medium"
                          style={{ 
                            borderColor: '#E3F2FD',
                            backgroundColor: '#FFFFFF',
                            color: '#2E5CA8'
                          }}
                        >
                          <span className="mr-2">{preset.icon}</span>
                          {preset.name}
                        </button>
                      ))}
                      <button
                        onClick={() => addTimeSlot(day.dayOfWeek)}
                        className="px-3 py-2 text-sm rounded-lg border-2 hover:shadow-md transition-all font-medium"
                        style={{ 
                          borderColor: '#E74C3C',
                          backgroundColor: '#FFFFFF',
                          color: '#E74C3C'
                        }}
                      >
                        <Plus className="h-4 w-4 inline mr-1" />
                        Personnalisé
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Message si jour désactivé */}
              {!day.enabled && (
                <div className="p-8 text-center" style={{ color: '#7F8C8D' }}>
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Ce jour est désactivé</p>
                  <p className="text-xs mt-1">Activez le bouton ci-dessus pour ajouter des créneaux</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Informations importantes */}
      <Card className="p-6 border-2" style={{ backgroundColor: '#FFF9E6', borderColor: '#FFE082' }}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: '#F57C00' }} />
          <div>
            <h4 className="font-semibold mb-2" style={{ color: '#E65100' }}>
              📌 Informations importantes
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: '#F57C00' }}>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Ces créneaux représentent vos <strong>disponibilités générales</strong>, pas des réservations confirmées.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Les élèves peuvent envoyer des <strong>demandes de séances</strong> sur ces plages horaires.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Vous pourrez <strong>accepter ou refuser</strong> chaque demande individuellement.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>N'oubliez pas de <strong>sauvegarder</strong> vos modifications pour les rendre visibles aux élèves.</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Avertissement de modifications non sauvegardées */}
      {hasChanges && (
        <Card className="p-4 border-2 animate-pulse" style={{ backgroundColor: '#FFEBEE', borderColor: '#E74C3C' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5" style={{ color: '#E74C3C' }} />
              <span className="font-semibold" style={{ color: '#E74C3C' }}>
                Vous avez des modifications non sauvegardées
              </span>
            </div>
            <Button
              onClick={saveAvailabilities}
              disabled={saving}
              className="text-white"
              style={{ backgroundColor: '#E74C3C' }}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder maintenant'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
