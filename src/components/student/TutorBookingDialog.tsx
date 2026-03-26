import { useState } from "react"

import { Button } from "../ui/button"
import { Alert } from "../ui/alert"

import {
  DialogContent,
  DialogHeader,
  DialogTitle
} from "../ui/dialog"

import TutorCalendar from "./TutorCalendar"

import { supabase } from "../../app/core/supabase.client"

interface TutorBookingDialogProps {
  tutor: any
  userId: string
}

export default function TutorBookingDialog({ tutor, userId }: TutorBookingDialogProps) {
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [subject, setSubject] = useState('')
  const [duration, setDuration] = useState(1)

  // Tarifs selon la durée de la séance
  function getStudentRate(hours: number): number {
    if (hours >= 4) return 50;
    if (hours >= 1.5) return 55;
    return 60;
  }

  async function bookSession() {
    if (!selectedSlot) return

    setLoading(true)

    const end = new Date(selectedSlot.getTime() + duration * 3600000)
    const sessionDate = selectedSlot.toISOString().split('T')[0]
    const startTime = selectedSlot.toTimeString().slice(0, 5)
    const endTime = end.toTimeString().slice(0, 5)
    const pricePerHour = getStudentRate(duration)  // Ce que l'élève paie
    const totalPrice = Number((pricePerHour * duration).toFixed(2))

    const { error } = await supabase
      .from("sessions")
      .insert({
        tutor_id: tutor.id,
        student_id: userId,
        subject: subject || tutor.subjects?.[0] || 'Non specifie',
        level: 'Non specifie',
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: Math.round(duration * 60),
        status: "pending",
        price_per_hour: pricePerHour,
        total_price: totalPrice,
        payment_status: 'pending',
        student_notes: ''
      })

    if (error) {
      console.error(error)
      alert("Erreur lors de la reservation")
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Reserver avec {tutor.full_name}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {tutor.subjects && tutor.subjects.length > 0 && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Matiere</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Choisir une matiere</option>
              {tutor.subjects.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium">Duree</label>
          <select
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value={1}>1 heure — 60 $/h</option>
            <option value={1.5}>1h30 — 55 $/h</option>
            <option value={2}>2 heures — 55 $/h</option>
            <option value={3}>3 heures — 55 $/h</option>
            <option value={4}>4 heures — 50 $/h</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Total estimé : <strong>{(getStudentRate(duration) * duration).toFixed(2)} $</strong>
            <span className="ml-1">({getStudentRate(duration)} $/h × {duration}h)</span>
          </p>
        </div>

        <TutorCalendar
          tutorId={tutor.id}
          duration={duration}
          onSelect={(slot: Date) => setSelectedSlot(slot)}
        />

        {selectedSlot && (
          <Alert className="bg-green-50">
            Creneau choisi : {selectedSlot.toLocaleString()}
          </Alert>
        )}

        {selectedSlot && !success && (
          <Button
            className="w-full"
            onClick={bookSession}
            disabled={loading}
          >
            {loading ? "Reservation..." : "Confirmer la reservation"}
          </Button>
        )}

        {success && (
          <Alert className="bg-green-100 border-green-300">
            <div className="space-y-1">
              <p className="font-semibold text-green-800">Séance réservée avec succès !</p>
              <p className="text-sm text-green-700">En attente de confirmation par le tuteur.</p>
              <p className="text-xs text-green-600 mt-1">
                💳 Le paiement sera disponible une fois la séance terminée — vous aurez <strong>3 jours ouvrables</strong> pour payer.
              </p>
            </div>
          </Alert>
        )}
      </div>
    </DialogContent>
  )
}
