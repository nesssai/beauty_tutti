import { useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { SERVICES } from '@/data/services'

export function BookServicePage() {
  const navigate = useNavigate()
  const { draft, setDraft } = useBookingApp()

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-900">Выбор услуги</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {SERVICES.map((s) => {
          const active = draft.serviceId === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setDraft({
                  serviceId: s.id,
                  salonId: undefined,
                  masterId: undefined,
                  day: undefined,
                  slotStart: undefined,
                })
                navigate('/book/salon')
              }}
                className={[
                'rounded-xl border p-4 text-left transition',
                active
                  ? 'border-[color:var(--accent)]/40 bg-[var(--accent-soft)] ring-2 ring-[color:var(--accent)]/25'
                  : 'border-stone-200/90 bg-white hover:border-[color:var(--accent)]/35',
              ].join(' ')}
            >
              <p className="font-medium text-stone-900">{s.name}</p>
              <p className="mt-1 text-sm text-stone-500">
                {s.durationMinutes} мин · {s.priceRub.toLocaleString('ru-RU')} ₽
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
