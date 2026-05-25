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
  const guardMaster =
    location.pathname.includes('/book/master') && (!draft.serviceId || !draft.salonId)
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
    <div className="space-y-8 animate-fade-in">
      <div className="card-panel">
        <h1 className="page-title">Онлайн-запись</h1>
        <p className="mt-2 text-base text-stone-600">
          Пройдите шаги по порядку — система учитывает длительность услуги, занятость мастера
          и не даёт записаться на прошедшее время.
        </p>
      </div>
      <ol className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <li key={s.path}>
            <NavLink
              to={`/book/${s.path}`}
              className={({ isActive }) =>
                [
                  'inline-flex rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset transition',
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
