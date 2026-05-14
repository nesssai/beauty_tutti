import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
      : 'text-stone-600 hover:bg-white/80 hover:text-stone-900',
  ].join(' ')

export function ClientLayout() {
  const navigate = useNavigate()
  const { demoUser, logoutClient } = useBookingApp()

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <header className="border-b border-stone-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <NavLink
              to="/home"
              className="text-lg font-semibold tracking-tight text-[var(--accent-strong)]"
            >
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
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!demoUser ? (
              <>
                <Link
                  to="/login/client"
                  className="rounded-lg border border-stone-200/90 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 shadow-sm transition hover:border-[var(--accent)]/40 hover:text-[var(--accent-strong)]"
                >
                  Войти
                </Link>
                <Link
                  to="/register/client"
                  className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                >
                  Зарегистрироваться
                </Link>
              </>
            ) : (
              <button
                type="button"
                className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-50"
                onClick={() => {
                  logoutClient()
                  navigate('/home', { replace: true })
                }}
              >
                Выйти
              </button>
            )}
            <Link
              to="/login/master"
              className="text-xs text-stone-500 underline-offset-2 hover:text-stone-700 hover:underline"
            >
              Вход для мастера
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
