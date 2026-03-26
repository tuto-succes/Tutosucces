import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { supabase } from '../../app/core/supabase.client';

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
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
];

function normalizeSlots(slots: TimeSlot[]): TimeSlot[] {
  const unique = new Map<string, TimeSlot>();

  slots.forEach((slot) => {
    const startTime = slot.startTime.slice(0, 5);
    const endTime = slot.endTime.slice(0, 5);
    const key = `${startTime}-${endTime}`;
    if (!unique.has(key)) {
      unique.set(key, {
        id: slot.id,
        startTime,
        endTime,
      });
    }
  });

  return [...unique.values()].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function hasSlotConflicts(slots: TimeSlot[]) {
  const normalized = normalizeSlots(slots);

  for (let i = 0; i < normalized.length; i += 1) {
    const current = normalized[i];
    if (current.startTime >= current.endTime) {
      return true;
    }

    const currentStart = Number(current.startTime.replace(':', ''));
    const currentEnd = Number(current.endTime.replace(':', ''));

    for (let j = i + 1; j < normalized.length; j += 1) {
      const next = normalized[j];
      const nextStart = Number(next.startTime.replace(':', ''));
      const nextEnd = Number(next.endTime.replace(':', ''));

      if (currentStart < nextEnd && nextStart < currentEnd) {
        return true;
      }
    }
  }

  return false;
}

export function AvailabilityManager({ tutorId }: AvailabilityManagerProps) {
  const [daysAvailability, setDaysAvailability] = useState<DayAvailability[]>(
    DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.value,
      label: day.label,
      enabled: false,
      slots: [],
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadAvailabilities();
  }, [tutorId]);

  async function loadAvailabilities() {
    try {
      const { data: availabilities, error } = await supabase
        .from('tutor_availability')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      const updatedDays = DAYS_OF_WEEK.map((day) => {
        const daySlots = availabilities?.filter((slot: any) => slot.day_of_week === day.value) || [];
        const normalizedSlots = normalizeSlots(
          daySlots.map((slot: any) => ({
            id: slot.id,
            startTime: slot.start_time,
            endTime: slot.end_time,
          }))
        );

        return {
          dayOfWeek: day.value,
          label: day.label,
          enabled: normalizedSlots.length > 0,
          slots: normalizedSlots,
        };
      });

      setDaysAvailability(updatedDays);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading availabilities:', error);
      alert('Erreur lors du chargement des disponibilites');
    } finally {
      setLoading(false);
    }
  }

  async function saveAvailabilities() {
    const invalidDay = daysAvailability.find((day) => day.enabled && hasSlotConflicts(day.slots));
    if (invalidDay) {
      alert(`Les creneaux de ${invalidDay.label} sont invalides ou se chevauchent.`);
      return;
    }

    setSaving(true);
    try {
      const { error: deleteError } = await supabase
        .from('tutor_availability')
        .delete()
        .eq('tutor_id', tutorId);

      if (deleteError) throw deleteError;

      const newAvailabilities = daysAvailability.flatMap((day) =>
        day.enabled
          ? normalizeSlots(day.slots).map((slot) => ({
              tutor_id: tutorId,
              day_of_week: day.dayOfWeek,
              start_time: slot.startTime,
              end_time: slot.endTime,
              is_recurring: true,
              is_available: true,
            }))
          : []
      );

      if (newAvailabilities.length > 0) {
        const { error: insertError } = await supabase
          .from('tutor_availability')
          .insert(newAvailabilities);

        if (insertError) throw insertError;
      }

      setHasChanges(false);
      await loadAvailabilities();
      alert('Disponibilites sauvegardees avec succes.');
    } catch (error) {
      console.error('Error saving availabilities:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(dayValue: number) {
    setDaysAvailability((days) =>
      days.map((day) => {
        if (day.dayOfWeek !== dayValue) return day;

        const enabled = !day.enabled;
        return {
          ...day,
          enabled,
          slots: enabled && day.slots.length === 0
            ? [{ id: crypto.randomUUID(), startTime: '09:00', endTime: '17:00' }]
            : day.slots,
        };
      })
    );
    setHasChanges(true);
  }

  function addTimeSlot(dayValue: number) {
    setDaysAvailability((days) =>
      days.map((day) => {
        if (day.dayOfWeek !== dayValue) return day;

        const lastSlot = normalizeSlots(day.slots)[day.slots.length - 1];
        const newSlot: TimeSlot = {
          id: crypto.randomUUID(),
          startTime: lastSlot?.endTime || '09:00',
          endTime: '17:00',
        };

        return {
          ...day,
          enabled: true,
          slots: normalizeSlots([...day.slots, newSlot]),
        };
      })
    );
    setHasChanges(true);
  }

  function removeTimeSlot(dayValue: number, slotId: string) {
    setDaysAvailability((days) =>
      days.map((day) => {
        if (day.dayOfWeek !== dayValue) return day;

        const slots = day.slots.filter((slot) => slot.id !== slotId);
        return {
          ...day,
          enabled: slots.length > 0 ? day.enabled : false,
          slots,
        };
      })
    );
    setHasChanges(true);
  }

  function updateTimeSlot(dayValue: number, slotId: string, field: 'startTime' | 'endTime', value: string) {
    setDaysAvailability((days) =>
      days.map((day) => {
        if (day.dayOfWeek !== dayValue) return day;

        const updatedSlots = day.slots.map((slot) =>
          slot.id === slotId ? { ...slot, [field]: value.slice(0, 5) } : slot
        );

        return {
          ...day,
          slots: normalizeSlots(updatedSlots),
        };
      })
    );
    setHasChanges(true);
  }

  function clearAllDays() {
    if (!confirm('Voulez-vous effacer toutes les disponibilites ?')) return;

    setDaysAvailability((days) =>
      days.map((day) => ({
        ...day,
        enabled: false,
        slots: [],
      }))
    );
    setHasChanges(true);
  }

  function applyWeekdaySchedule() {
    setDaysAvailability((days) =>
      days.map((day) => {
        if (day.dayOfWeek === 0 || day.dayOfWeek === 6) {
          return day;
        }

        return {
          ...day,
          enabled: true,
          slots: [{ id: crypto.randomUUID(), startTime: '09:00', endTime: '17:00' }],
        };
      })
    );
    setHasChanges(true);
  }

  const totalSlots = daysAvailability.reduce((sum, day) => sum + (day.enabled ? day.slots.length : 0), 0);
  const enabledDays = daysAvailability.filter((day) => day.enabled).length;

  if (loading) {
    return <div className="py-8 text-center text-sm text-gray-500">Chargement des disponibilites...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mes disponibilites</h2>
          <p className="mt-1 text-sm text-slate-500">
            Definissez simplement vos jours et vos creneaux.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border bg-white px-4 py-2 text-sm text-slate-600">
            {enabledDays} jours actifs · {totalSlots} creneaux
          </div>
          <Button onClick={saveAvailabilities} disabled={saving || !hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={applyWeekdaySchedule} variant="outline">
          Lun-Ven 09:00-17:00
        </Button>
        <Button onClick={clearAllDays} variant="outline">
          <Trash2 className="mr-2 h-4 w-4" />
          Tout effacer
        </Button>
      </div>

      <div className="space-y-4">
        {daysAvailability.map((day) => {
          const hasConflicts = day.enabled && hasSlotConflicts(day.slots);

          return (
            <Card key={day.dayOfWeek} className="overflow-hidden border border-slate-200">
              <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Switch checked={day.enabled} onCheckedChange={() => toggleDay(day.dayOfWeek)} />
                  <div>
                    <h3 className="font-semibold text-slate-900">{day.label}</h3>
                    {day.enabled && (
                      <p className="text-sm text-slate-500">
                        {day.slots.length} creneau{day.slots.length > 1 ? 'x' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {hasConflicts && (
                  <div className="text-sm font-medium text-red-600">
                    Creneaux en conflit
                  </div>
                )}
              </div>

              {day.enabled ? (
                <div className="space-y-3 p-4">
                  {day.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <div>
                        <label className="mb-1 block text-sm text-slate-600">Debut</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(day.dayOfWeek, slot.id, 'startTime', e.target.value)}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm text-slate-600">Fin</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(day.dayOfWeek, slot.id, 'endTime', e.target.value)}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeTimeSlot(day.dayOfWeek, slot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={() => addTimeSlot(day.dayOfWeek)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un creneau
                  </Button>
                </div>
              ) : (
                <div className="px-4 py-5 text-sm text-slate-500">
                  Activez ce jour pour ajouter des creneaux.
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {hasChanges && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Des modifications ne sont pas encore sauvegardees.
        </div>
      )}
    </div>
  );
}
