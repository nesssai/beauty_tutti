import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Link } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { MASTERS } from '@/data/masters'
import { SALONS } from '@/data/salons'
import { SERVICES } from '@/data/services'
import {
  formatRuPhoneDisplay,
  parseRuPhoneInputToNormalized,
} from '@/utils/validation'
import {
  canClientCancelBooking,
  effectiveVisitStatus,
  statusLabelRu,
} from '@/utils/visitStatus'

export function AccountPage() {
  const { demoUser, bookings, cancelClientBooking } = useBookingApp()
  const [cancelMsg, setCancelMsg] = useState<string | null>(null)

  if (!demoUser) {
    return (
      <div className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900">Личный кабинет</h1>
        <p className="mt-3 text-stone-600">
          Войдите или зарегистрируйтесь, чтобы видеть историю записей и персональные предложения.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/login/client"
            className="inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Войти
          </Link>
          <Link
            to="/register/client"
            className="inline-flex rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          >
            Зарегистрироваться
          </Link>
        </div>
        <p className="mt-6 text-sm text-stone-500">
          Запись без аккаунта доступна с главной страницы — раздел «Запись».
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

  const phoneDisplay = formatRuPhoneDisplay(
    parseRuPhoneInputToNormalized(demoUser.phone),
  )

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900">Профиль</h1>
        <p className="mt-2 text-stone-700">{demoUser.name}</p>
        <p className="text-sm text-stone-600">{demoUser.email}</p>
        <p className="text-sm font-mono text-stone-600">{phoneDisplay}</p>
        {!demoUser.firstVisitDiscountUsed && (
          <p className="mt-4 text-sm text-stone-600">
            Доступна{' '}
            <span className="font-medium text-emerald-800">скидка 10%</span> на первое
            посещение при следующей записи.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-stone-900">Мои записи</h2>
        {cancelMsg && (
          <p
            className={
              cancelMsg === 'Запись отменена.'
                ? 'mt-2 text-sm text-emerald-700'
                : 'mt-2 text-sm text-red-600'
            }
          >
            {cancelMsg}
          </p>
        )}
        {mine.length === 0 ? (
          <p className="mt-2 text-sm text-stone-600">Пока нет записей.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {mine.map((b) => {
              const service = SERVICES.find((s) => s.id === b.serviceId)
              const salon = SALONS.find((s) => s.id === b.salonId)
              const master = MASTERS.find((m) => m.id === b.masterId)
              const start = parseISO(b.startIso)
              const eff = effectiveVisitStatus(b)
              const canCancel =
                eff === 'scheduled' && canClientCancelBooking(b.startIso)

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
                    {statusLabelRu(eff)}
                  </p>
                  {canCancel && (
                    <button
                      type="button"
                      className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
                      onClick={() => {
                        setCancelMsg(null)
                        const res = cancelClientBooking(b.id)
                        if (!res.ok) setCancelMsg(res.error)
                        else setCancelMsg('Запись отменена.')
                      }}
                    >
                      Отменить запись
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Link
        to="/book/service"
        className="inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
      >
        Новая запись
      </Link>
    </div>
  )
}
