import { useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'

export function BookServicePage() {
  const navigate = useNavigate()
  const { draft, setDraft, catalog } = useBookingApp()

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="page-subtitle">Выбор услуги</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.services.map((s) => {
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
                'service-card text-left',
                active ? 'service-card-active' : '',
              ].join(' ')}
            >
              <p className="text-lg font-semibold text-stone-900">{s.name}</p>
              <p className="mt-2 text-base text-stone-500">
                {s.durationMinutes} мин · {s.priceRub.toLocaleString('ru-RU')} ₽
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
