import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, format, isSameDay, startOfToday } from 'date-fns'

import { useBookingApp } from '@/context/BookingContext'
import { formatRuDayChip } from '@/utils/formatRuWeekday'
import { getSlotsForBooking } from '@/utils/schedule'

export function BookDatetimePage() {
  const navigate = useNavigate()
  const { draft, setDraft, bookings } = useBookingApp()
  const [pickedDay, setPickedDay] = useState<Date>(() => draft.day ?? startOfToday())

  const days = useMemo(() => {
    const start = startOfToday()
    return Array.from({ length: 14 }, (_, i) => addDays(start, i))
  }, [])

  const slots = useMemo(() => {
    if (!draft.masterId || !draft.serviceId) return []
    return getSlotsForBooking({
      day: pickedDay,
      masterId: draft.masterId,
      serviceId: draft.serviceId,
      bookings,
    })
  }, [bookings, draft.masterId, draft.serviceId, pickedDay])

  const selectedSlot = draft.slotStart
  const canGoConfirm =
    selectedSlot != null && isSameDay(selectedSlot, pickedDay)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-stone-900">Дата и время</h2>
      <div>
        <p className="text-sm font-medium text-stone-700">День</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {days.map((d) => {
            const active = isSameDay(d, pickedDay)
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => {
                  setPickedDay(d)
                  setDraft({ day: d, slotStart: undefined })
                }}
                className={[
                  'rounded-lg border px-3 py-2 text-xs sm:text-sm',
                  active
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-stone-200 bg-white text-stone-800 hover:border-rose-400',
                ].join(' ')}
              >
                {formatRuDayChip(d)}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-stone-700">Свободные слоты</p>
        <p className="mt-1 text-xs text-stone-500">
          Выберите время, затем нажмите «Перейти к подтверждению записи».
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {slots.length === 0 ? (
            <p className="text-sm text-stone-500">Нет свободных окон в этот день.</p>
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
                  onClick={() => {
                    setDraft({ day: pickedDay, slotStart: t })
                  }}
                  className={[
                    'rounded-lg border px-3 py-2 text-sm',
                    active
                      ? 'border-rose-600 bg-rose-50 text-rose-900'
                      : 'border-stone-200 bg-white text-stone-800 hover:border-rose-400',
                  ].join(' ')}
                >
                  {format(t, 'HH:mm')}
                </button>
              )
            })
          )}
        </div>
      </div>
      <div className="pt-2">
        <button
          type="button"
          disabled={!canGoConfirm}
          onClick={() => navigate('/book/confirm')}
          className="inline-flex rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
        >
          Перейти к подтверждению записи
        </button>
      </div>
    </div>
  )
}
