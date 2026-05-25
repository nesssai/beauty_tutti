import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, format, isSameDay, startOfToday } from 'date-fns'

import { useBookingApp } from '@/context/BookingContext'
import { formatRuDayChip } from '@/utils/formatRuWeekday'
import { isPastDay } from '@/utils/pastTime'

export function BookDatetimePage() {
  const navigate = useNavigate()
  const { draft, setDraft, fetchSlotsForDay } = useBookingApp()
  const today = startOfToday()
  const [pickedDay, setPickedDay] = useState<Date>(() => draft.day ?? today)
  const [slots, setSlots] = useState<Date[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const days = useMemo(() => {
    const start = today
    return Array.from({ length: 14 }, (_, i) => addDays(start, i))
  }, [today])

  useEffect(() => {
    if (!draft.masterId || !draft.serviceId) return
    let cancelled = false
    setLoadingSlots(true)
    void fetchSlotsForDay(draft.masterId, draft.serviceId, pickedDay)
      .then((list) => {
        if (!cancelled) setSlots(list)
      })
      .catch(() => {
        if (!cancelled) setSlots([])
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false)
      })
    return () => {
      cancelled = true
    }
  }, [draft.masterId, draft.serviceId, pickedDay, fetchSlotsForDay])

  const selectedSlot = draft.slotStart
  const canGoConfirm =
    selectedSlot != null && isSameDay(selectedSlot, pickedDay)

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="page-subtitle">Дата и время</h2>
      <div>
        <p className="text-base font-medium text-stone-700">День</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {days.map((d) => {
            const past = isPastDay(d)
            const active = isSameDay(d, pickedDay)
            return (
              <button
                key={d.toISOString()}
                type="button"
                disabled={past}
                onClick={() => {
                  setPickedDay(d)
                  setDraft({ day: d, slotStart: undefined })
                }}
                className={[
                  'rounded-xl border px-4 py-2.5 text-sm font-medium transition',
                  past
                    ? 'cursor-not-allowed border-stone-100 bg-stone-100 text-stone-400'
                    : active
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-md'
                      : 'border-stone-200 bg-white text-stone-800 hover:border-[var(--accent)]/50',
                ].join(' ')}
              >
                {formatRuDayChip(d)}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <p className="text-base font-medium text-stone-700">Свободные слоты</p>
        <p className="mt-1 text-sm text-stone-500">
          Прошедшее время недоступно для записи.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {loadingSlots ? (
            <p className="text-base text-stone-500">Загрузка слотов…</p>
          ) : slots.length === 0 ? (
            <p className="text-base text-stone-500">Нет свободных окон в этот день.</p>
          ) : (
            slots.map((t) => {
              const active =
                draft.slotStart &&
                isSameDay(t, draft.slotStart) &&
                t.getTime() === draft.slotStart.getTime()
              return (
                <button
                  key={t.toISOString()}
                  type="button"
                  onClick={() => setDraft({ day: pickedDay, slotStart: t })}
                  className={[
                    'slot-chip',
                    active ? 'slot-chip-active' : '',
                  ].join(' ')}
                >
                  {format(t, 'HH:mm')}
                </button>
              )
            })
          )}
        </div>
      </div>
      <button
        type="button"
        disabled={!canGoConfirm}
        onClick={() => navigate('/book/confirm')}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Перейти к подтверждению записи
      </button>
    </div>
  )
}
