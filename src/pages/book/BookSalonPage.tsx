import { useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { salonsWithService } from '@/data/queries'

export function BookSalonPage() {
  const navigate = useNavigate()
  const { draft, setDraft } = useBookingApp()
  const serviceId = draft.serviceId!
  const salons = salonsWithService(serviceId)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-900">Выбор салона</h2>
      <div className="grid gap-3">
        {salons.map((salon) => {
          const active = draft.salonId === salon.id
          return (
            <button
              key={salon.id}
              type="button"
              onClick={() => {
                setDraft({
                  salonId: salon.id,
                  masterId: undefined,
                  day: undefined,
                  slotStart: undefined,
                })
                navigate('/book/master')
              }}
                className={[
                'rounded-xl border p-4 text-left transition',
                active
                  ? 'border-[color:var(--accent)]/40 bg-[var(--accent-soft)] ring-2 ring-[color:var(--accent)]/25'
                  : 'border-stone-200/90 bg-white hover:border-[color:var(--accent)]/35',
              ].join(' ')}
            >
              <p className="font-medium text-stone-900">{salon.name}</p>
              <p className="mt-1 text-sm text-stone-600">
                {salon.city}, {salon.address}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
