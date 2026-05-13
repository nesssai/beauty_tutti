import { useMemo, useState } from 'react'
import { format, isSameDay, parseISO } from 'date-fns'
import { useBookingApp } from '@/context/BookingContext'
import { MASTERS } from '@/data/masters'
import { SERVICES } from '@/data/services'
import type { VisitStatus } from '@/types/models'

export function MasterPage() {
  const { bookings, updateBookingStatus } = useBookingApp()
  const [masterId, setMasterId] = useState(MASTERS[0]?.id ?? '')
  const [day, setDay] = useState(() => new Date())

  const dayBookings = useMemo(() => {
    return bookings
      .filter((b) => b.masterId === masterId && isSameDay(parseISO(b.startIso), day))
      .sort(
        (a, b) =>
          parseISO(a.startIso).getTime() - parseISO(b.startIso).getTime(),
      )
  }, [bookings, day, masterId])

  const busyPreview = useMemo(() => {
    return dayBookings.map((b) => {
      const s = SERVICES.find((x) => x.id === b.serviceId)
      const start = parseISO(b.startIso)
      const end = parseISO(b.endIso)
      return { b, label: s?.name ?? b.serviceId, start, end }
    })
  }, [dayBookings])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Расписание мастера</h1>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <label className="text-sm text-stone-700">
          Мастер
          <select
            className="mt-1 block w-48 rounded-lg border border-stone-200 px-3 py-2"
            value={masterId}
            onChange={(e) => setMasterId(e.target.value)}
          >
            {MASTERS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-stone-700">
          Дата
          <input
            type="date"
            className="mt-1 block rounded-lg border border-stone-200 px-3 py-2"
            value={format(day, 'yyyy-MM-dd')}
            onChange={(e) => setDay(new Date(e.target.value + 'T12:00:00'))}
          />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Записи на день
          </h2>
          {dayBookings.length === 0 ? (
            <p className="mt-3 text-sm text-stone-600">Нет записей.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {dayBookings.map((b) => {
                const service = SERVICES.find((s) => s.id === b.serviceId)
                const start = parseISO(b.startIso)
                const end = parseISO(b.endIso)
                return (
                  <li
                    key={b.id}
                    className="rounded-lg border border-stone-100 p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-stone-900">
                          {service?.name}
                        </p>
                        <p className="text-stone-600">
                          {format(start, 'HH:mm')}–{format(end, 'HH:mm')} ·{' '}
                          {b.clientName}
                        </p>
                      </div>
                      <select
                        className="rounded-lg border border-stone-200 px-2 py-1 text-xs"
                        value={b.status}
                        onChange={(e) =>
                          updateBookingStatus(b.id, e.target.value as VisitStatus)
                        }
                      >
                        <option value="scheduled">Запланирован</option>
                        <option value="completed">Завершён</option>
                        <option value="cancelled">Отменён</option>
                      </select>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Занятость
          </h2>
          <div className="mt-4 space-y-2">
            {busyPreview.length === 0 ? (
              <p className="text-sm text-stone-600">Свободный день.</p>
            ) : (
              busyPreview.map(({ b, label, start, end }) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-700"
                >
                  <span>{label}</span>
                  <span>
                    {format(start, 'HH:mm')}–{format(end, 'HH:mm')}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
