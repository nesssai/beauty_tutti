import { format, parseISO } from 'date-fns'

import { StatusBadge } from '@/components/StatusBadge'
import type { Booking, Service } from '@/types/models'
import { effectiveVisitStatus } from '@/utils/visitStatus'

type Props = {
  booking: Booking
  service?: Service
  onStatusChange: (id: string, status: 'scheduled' | 'cancelled') => void
  onNoteBlur: (id: string, note: string) => void
}

export function MasterBookingCard({
  booking,
  service,
  onStatusChange,
  onNoteBlur,
}: Props) {
  const start = parseISO(booking.startIso)
  const end = parseISO(booking.endIso)
  const eff = effectiveVisitStatus(booking)
  const manual = booking.status !== 'completed' && eff !== 'completed'

  return (
    <article className="master-booking-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="master-booking-time">
            {format(start, 'HH:mm')} — {format(end, 'HH:mm')}
          </p>
          <p className="master-booking-client">{booking.clientName}</p>
        </div>
        <StatusBadge status={eff} />
      </div>

      <p className="master-booking-service">{service?.name ?? booking.serviceId}</p>

      {(booking.clientPhone || booking.clientEmail) && (
        <div className="master-booking-contacts">
          {booking.clientPhone && (
            <span className="font-mono text-xs">{booking.clientPhone}</span>
          )}
          {booking.clientEmail && (
            <span className="truncate text-xs">{booking.clientEmail}</span>
          )}
        </div>
      )}

      {manual ? (
        <div className="master-booking-actions">
          <label className="master-field-label">
            Статус
            <select
              className="master-select"
              value={booking.status === 'cancelled' ? 'cancelled' : 'scheduled'}
              onChange={(e) =>
                onStatusChange(
                  booking.id,
                  e.target.value as 'scheduled' | 'cancelled',
                )
              }
            >
              <option value="scheduled">Ожидает</option>
              <option value="cancelled">Отменено</option>
            </select>
          </label>
          <label className="master-field-label">
            Заметка к визиту
            <textarea
              rows={2}
              className="master-textarea"
              placeholder="Комментарий для себя…"
              defaultValue={booking.masterNote ?? ''}
              onBlur={(e) => onNoteBlur(booking.id, e.target.value.trim())}
            />
          </label>
        </div>
      ) : (
        <p className="master-booking-auto text-xs text-stone-500">
          Завершено автоматически после окончания слота
        </p>
      )}
    </article>
  )
}
