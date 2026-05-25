import { useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { mastersForSalonAndService } from '@/data/queries'

export function BookMasterPage() {
  const navigate = useNavigate()
  const { draft, setDraft, catalog } = useBookingApp()
  const masters = mastersForSalonAndService(
    catalog,
    draft.salonId!,
    draft.serviceId!,
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="page-subtitle">Выбор мастера</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {masters.map((m) => {
          const active = draft.masterId === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setDraft({ masterId: m.id, day: undefined, slotStart: undefined })
                navigate('/book/datetime')
              }}
              className={[
                'service-card text-left',
                active ? 'service-card-active' : '',
              ].join(' ')}
            >
              <p className="text-lg font-semibold text-stone-900">{m.name}</p>
              <p className="mt-2 text-sm text-stone-500">
                {m.serviceIds.length} услуг в зоне ответственности
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
