import { useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { salonsWithService } from '@/data/queries'

export function BookSalonPage() {
  const navigate = useNavigate()
  const { draft, setDraft, catalog } = useBookingApp()
  const serviceId = draft.serviceId!
  const salons = salonsWithService(catalog, serviceId)

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="page-subtitle">Выбор салона</h2>
      <div className="grid gap-4 sm:grid-cols-2">
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
                'service-card text-left',
                active ? 'service-card-active' : '',
              ].join(' ')}
            >
              <p className="text-lg font-semibold text-stone-900">{salon.name}</p>
              <p className="mt-2 text-base text-stone-600">
                {salon.city}, {salon.address}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
