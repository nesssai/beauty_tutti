import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'

const steps = [
  { path: 'service', label: 'Услуга' },
  { path: 'salon', label: 'Салон' },
  { path: 'master', label: 'Мастер' },
  { path: 'datetime', label: 'Дата и время' },
  { path: 'confirm', label: 'Подтверждение' },
] as const

export function BookLayout() {
  const location = useLocation()
  const { draft } = useBookingApp()

  if (location.pathname.includes('/book/done')) {
    return <Outlet />
  }

  const guardSalon = location.pathname.includes('/book/salon') && !draft.serviceId
  const guardMaster = location.pathname.includes('/book/master') && (!draft.serviceId || !draft.salonId)
  const guardDatetime =
    location.pathname.includes('/book/datetime') &&
    (!draft.serviceId || !draft.salonId || !draft.masterId)
  const guardConfirm =
    location.pathname.includes('/book/confirm') &&
    (!draft.serviceId ||
      !draft.salonId ||
      !draft.masterId ||
      !draft.day ||
      !draft.slotStart)

  if (guardSalon || guardMaster || guardDatetime || guardConfirm) {
    return <Navigate to="/book/service" replace />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Онлайн-запись</h1>
        <p className="mt-1 text-sm text-stone-600">
          Пройдите шаги по порядку — система учитывает длительность услуги и
          занятость мастера.
        </p>
      </div>
      <ol className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <li key={s.path}>
            <NavLink
              to={`/book/${s.path}`}
              className={({ isActive }) =>
                [
                  'inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                  isActive
                    ? 'bg-[var(--accent)] text-white ring-[var(--accent)]'
                    : 'bg-white text-stone-800 ring-stone-300 hover:bg-[var(--accent-soft)]',
                ].join(' ')
              }
            >
              {s.label}
            </NavLink>
          </li>
        ))}
      </ol>
      <Outlet />
    </div>
  )
}
