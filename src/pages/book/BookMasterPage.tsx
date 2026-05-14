import { useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { mastersForSalonAndService } from '@/data/queries'

export function BookMasterPage() {
  const navigate = useNavigate()
  const { draft, setDraft } = useBookingApp()
  const masters = mastersForSalonAndService(draft.salonId!, draft.serviceId!)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-900">Выбор мастера</h2>
      <div className="grid gap-3 sm:grid-cols-2">
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
                'rounded-xl border p-4 text-left transition',
                active
                  ? 'border-[color:var(--accent)]/40 bg-[var(--accent-soft)] ring-2 ring-[color:var(--accent)]/25'
                  : 'border-stone-200/90 bg-white hover:border-[color:var(--accent)]/35',
              ].join(' ')}
            >
              <p className="font-medium text-stone-900">{m.name}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
