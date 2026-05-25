import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

import type { Booking, Master, Salon, Service } from '@/types/models'
import { formatRuPhoneDisplay, parseRuPhoneInputToNormalized } from '@/utils/validation'
import { statusLabelRu } from '@/utils/visitStatus'

export type BookingConfirmationSnapshot = {
  booking: Booking
  service: Service
  salon: Salon
  master: Master
  priceRub: number
  durationMinutes: number
  hadDiscount: boolean
  originalPriceRub: number
}

type Props = {
  data: BookingConfirmationSnapshot
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className="summary-row flex flex-col gap-1 border-b border-stone-100/90 py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-sm font-medium uppercase tracking-wide text-stone-500">{label}</dt>
      <dd
        className={[
          'text-base text-stone-900',
          highlight ? 'text-lg font-bold text-[var(--accent-strong)]' : 'font-medium',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  )
}

export function BookingSuccessSummary({ data }: Props) {
  const { booking, service, salon, master, priceRub, hadDiscount, originalPriceRub } = data
  const start = parseISO(booking.startIso)
  const end = parseISO(booking.endIso)
  const phone = booking.clientPhone
    ? formatRuPhoneDisplay(parseRuPhoneInputToNormalized(booking.clientPhone))
    : null

  return (
    <div className="summary-card rounded-2xl border border-[var(--accent)]/15 bg-gradient-to-br from-white via-[var(--accent-soft)]/25 to-white p-1 shadow-inner">
      <dl className="divide-y-0 px-4 py-1 sm:px-5">
        <SummaryRow label="Клиент" value={booking.clientName} highlight />
        {phone && <SummaryRow label="Телефон" value={<span className="font-mono">{phone}</span>} />}
        {booking.clientEmail && (
          <SummaryRow label="Email" value={booking.clientEmail} />
        )}
        <SummaryRow
          label="Дата"
          value={format(start, 'd MMMM yyyy', { locale: ru })}
        />
        <SummaryRow
          label="Время"
          value={`${format(start, 'HH:mm')} — ${format(end, 'HH:mm')}`}
        />
        <SummaryRow label="Услуга" value={service.name} />
        <SummaryRow label="Длительность" value={`${service.durationMinutes} мин`} />
        <SummaryRow label="Мастер" value={master.name} />
        <SummaryRow label="Салон" value={`${salon.name}, ${salon.city}`} />
        <SummaryRow
          label="Стоимость"
          value={
            <span>
              {priceRub.toLocaleString('ru-RU')} ₽
              {hadDiscount && (
                <span className="ml-2 text-sm font-normal text-stone-500 line-through">
                  {originalPriceRub.toLocaleString('ru-RU')} ₽
                </span>
              )}
            </span>
          }
          highlight
        />
        <SummaryRow
          label="Статус"
          value={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              {statusLabelRu(booking.status)}
            </span>
          }
        />
        <SummaryRow label="Номер записи" value={<span className="font-mono text-sm">{booking.id}</span>} />
      </dl>
    </div>
  )
}
