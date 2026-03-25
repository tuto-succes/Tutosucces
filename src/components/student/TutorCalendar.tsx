import { useState, useEffect } from 'react'
import { supabase } from '../../app/core/supabase.client'

interface TutorCalendarProps {
  tutorId: string
  duration: number
  onSelect: (slot: Date) => void
}

interface Availability {
  day_of_week: number
  start_time: string
  end_time: string
}

const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export default function TutorCalendar({ tutorId, duration, onSelect }: TutorCalendarProps) {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<Date[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)

  useEffect(() => {
    fetchAvailability()
  }, [tutorId])

  useEffect(() => {
    if (selectedDate) generateSlots(selectedDate)
    else setSlots([])
  }, [selectedDate, duration, availability])

  async function fetchAvailability() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tutor_availability')
      .select('day_of_week, start_time, end_time')
      .eq('tutor_id', tutorId)
      .eq('is_available', true)

    if (!error && data) {
      // Dédupliquer les lignes identiques
      const seen = new Set<string>()
      const unique = data.filter(row => {
        const key = `${row.day_of_week}-${row.start_time}-${row.end_time}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setAvailability(unique)
    }
    setLoading(false)
  }

  function generateSlots(dateStr: string) {
    const [year, month, day] = dateStr.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    const dayOfWeek = d.getDay()

    const daySlots = availability.filter(a => a.day_of_week === dayOfWeek)
    const available: Date[] = []

    daySlots.forEach(slot => {
      const [startH, startM] = slot.start_time.split(':').map(Number)
      const [endH, endM] = slot.end_time.split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM
      const durationMinutes = duration * 60

      let current = startMinutes
      while (current + durationMinutes <= endMinutes) {
        available.push(new Date(year, month - 1, day, Math.floor(current / 60), current % 60))
        current += 60
      }
    })

    setSlots(available)
    setSelectedSlot(null)
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  function formatSlotRange(slot: Date) {
    const end = new Date(slot.getTime() + duration * 3600000)
    return `${formatTime(slot)} – ${formatTime(end)}`
  }

  function prevMonth() {
    setCurrentMonth(prev =>
      prev.month === 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: prev.month - 1 }
    )
    setSelectedDate(null)
  }

  function nextMonth() {
    setCurrentMonth(prev =>
      prev.month === 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: prev.month + 1 }
    )
    setSelectedDate(null)
  }

  if (loading) return <p className="text-sm text-gray-400">Chargement des disponibilités...</p>
  if (availability.length === 0) return <p className="text-sm text-orange-500">Ce tuteur n'a pas de disponibilités configurées.</p>

  const availableDays = new Set(availability.map(a => a.day_of_week))
  const { year, month } = currentMonth
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)

  return (
    <div className="space-y-3">

      {/* Navigation mois */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600 text-sm"
        >
          ←
        </button>
        <span className="font-medium text-sm text-gray-800">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600 text-sm"
        >
          →
        </button>
      </div>

      {/* En-têtes jours */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />

          const date = new Date(year, month, day)
          const dow = date.getDay()
          const isPast = date < today
          const isAvailable = availableDays.has(dow) && !isPast
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isSelected = selectedDate === dateStr
          const isToday = date.getTime() === today.getTime()

          return (
            <button
              key={i}
              onClick={() => isAvailable && setSelectedDate(dateStr)}
              disabled={!isAvailable}
              className={[
                'text-xs rounded py-1.5 font-medium transition-colors w-full',
                isSelected ? 'bg-blue-600 text-white' : '',
                isAvailable && !isSelected ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer' : '',
                !isAvailable && !isPast ? 'text-gray-300 cursor-not-allowed' : '',
                isPast ? 'text-gray-200 cursor-not-allowed' : '',
                isToday && !isSelected ? 'ring-1 ring-blue-400' : '',
              ].join(' ')}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-100 inline-block" /> Disponible
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Sélectionné
        </span>
      </div>

      {/* Créneaux horaires */}
      {selectedDate && slots.length === 0 && (
        <p className="text-sm text-orange-500">Aucun créneau disponible ce jour.</p>
      )}

      {slots.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 text-gray-700">Créneaux disponibles :</p>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((slot, i) => {
              const isActive = selectedSlot?.getTime() === slot.getTime()
              return (
                <button
                  key={i}
                  onClick={() => { setSelectedSlot(slot); onSelect(slot) }}
                  className={[
                    'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50',
                  ].join(' ')}
                >
                  <span className={isActive ? 'text-blue-200' : 'text-blue-400'}>🕐</span>
                  {formatSlotRange(slot)}
                </button>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
