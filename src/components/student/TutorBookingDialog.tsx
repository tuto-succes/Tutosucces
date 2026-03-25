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

  async function bookSession() {

    if (!selectedSlot) return

    setLoading(true)

    const end = new Date(selectedSlot.getTime() + duration * 3600000)
    const sessionDate = selectedSlot.toISOString().split('T')[0]
    const startTime = selectedSlot.toTimeString().slice(0, 5)
    const endTime = end.toTimeString().slice(0, 5)
    const pricePerHour = tutor.rate || 35
    const totalPrice = Number((pricePerHour * duration).toFixed(2))

    const { error } = await supabase
      .from("sessions")
      .insert({
        tutor_id: tutor.id,
        student_id: userId,
        subject: subject || tutor.subjects?.[0] || 'Non spécifié',
        level: 'Non spécifié',
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: Math.round(duration * 60),
        status: "pending",
        price_per_hour: pricePerHour,
        total_price: totalPrice,
        payment_status: 'paid',
        student_notes: ''
      })

    if (error) {
      console.error(error)
      alert("Erreur lors de la réservation")
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
          Réserver avec {tutor.full_name}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">

        {tutor.subjects && tutor.subjects.length > 0 && (
            <div className="space-y-1">
                <label className="text-sm font-medium">Matière</label>
                <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                >
                <option value="">Choisir une matière</option>
                {tutor.subjects.map((s: string) => (
                    <option key={s} value={s}>{s}</option>
                ))}
                </select>
            </div>
        )}
        <div className="space-y-1">
            <label className="text-sm font-medium">Durée</label>
            <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full border rounded px-3 py-2 text-sm"
            >
                <option value={1}>1 heure</option>
                <option value={1.5}>1h30</option>
                <option value={2}>2 heures</option>
                <option value={3}>3 heures</option>
            </select>
        </div>

        <TutorCalendar
          tutorId={tutor.id}
duration={duration}
          onSelect={(slot: Date) => setSelectedSlot(slot)}
        />

        {selectedSlot && (

          <Alert className="bg-green-50">

            Créneau choisi :{" "}
            {selectedSlot.toLocaleString()}

          </Alert>

        )}

        {selectedSlot && !success && (

          <Button
            className="w-full"
            onClick={bookSession}
            disabled={loading}
          >

            {loading
              ? "Réservation..."
              : "Confirmer la réservation"
            }

          </Button>

        )}

        {success && (

          <Alert className="bg-green-100">

            Séance réservée avec succès

          </Alert>

        )}

      </div>

    </DialogContent>

  )

}