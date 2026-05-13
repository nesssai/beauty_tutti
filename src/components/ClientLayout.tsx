import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-rose-100 text-rose-900'
      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
  ].join(' ')

export function ClientLayout() {
  const navigate = useNavigate()
  const { logoutToLanding } = useBookingApp()

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <NavLink to="/home" className="text-lg font-semibold text-rose-800">
              BEAUTY TUTTI
            </NavLink>
            <nav className="flex flex-wrap gap-1">
              <NavLink to="/home" className={linkClass}>
                Главная
              </NavLink>
              <NavLink to="/book/service" className={linkClass}>
                Запись
              </NavLink>
              <NavLink to="/account" className={linkClass}>
                Личный кабинет
              </NavLink>
            </nav>
          </div>
          <button
            type="button"
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
            onClick={() => {
              logoutToLanding()
              navigate('/welcome')
            }}
          >
            Выйти
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
