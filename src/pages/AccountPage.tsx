import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Link } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { MASTERS } from '@/data/masters'
import { SALONS } from '@/data/salons'
import { SERVICES } from '@/data/services'

export function AccountPage() {
  const { demoUser, bookings } = useBookingApp()

  if (!demoUser) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900">Личный кабинет</h1>
        <p className="mt-3 text-stone-600">
          Войдите по{' '}
          <Link to="/login/client" className="font-medium text-rose-700 hover:underline">
            странице входа
          </Link>
          , чтобы видеть историю записей и персональные предложения.
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Гости могут записаться без входа — история при этом недоступна.
        </p>
      </div>
    )
  }

  const mine = bookings
    .filter((b) => b.userId === demoUser.id)
    .sort(
      (a, b) =>
        parseISO(b.startIso).getTime() - parseISO(a.startIso).getTime(),
    )

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900">Профиль</h1>
        <p className="mt-2 text-stone-700">{demoUser.name}</p>
        <p className="text-sm text-stone-600">{demoUser.email}</p>
        <p className="text-sm text-stone-600">{demoUser.phone}</p>
        <p className="mt-4 text-sm text-stone-600">
          Статус лояльности:{' '}
          <span className="font-medium text-brand-700">
            {demoUser.firstVisitDiscountUsed
              ? 'Скидка на первый визит использована'
              : 'Доступна скидка 10% на первое посещение'}
          </span>
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-stone-900">Мои записи</h2>
        {mine.length === 0 ? (
          <p className="mt-2 text-sm text-stone-600">Пока нет записей.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {mine.map((b) => {
              const service = SERVICES.find((s) => s.id === b.serviceId)
              const salon = SALONS.find((s) => s.id === b.salonId)
              const master = MASTERS.find((m) => m.id === b.masterId)
              const start = parseISO(b.startIso)
              return (
                <li
                  key={b.id}
                  className="rounded-xl border border-stone-100 bg-white p-4 text-sm shadow-sm"
                >
                  <p className="font-medium text-stone-900">
                    {service?.name ?? b.serviceId}
                  </p>
                  <p className="mt-1 text-stone-600">
                    {format(start, 'd MMM yyyy HH:mm', { locale: ru })} ·{' '}
                    {salon?.name} · {master?.name}
                  </p>
                  <p className="mt-1 text-xs uppercase text-stone-500">
                    {b.status}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Link
        to="/book/service"
        className="inline-flex rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700"
      >
        Новая запись
      </Link>
    </div>
  )
}
