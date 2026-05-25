import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-2xl px-4 py-2.5 text-base font-semibold transition duration-200',
    isActive ? 'nav-link-active' : 'text-stone-600 hover:bg-white/70 hover:text-stone-900',
  ].join(' ')

export function ClientLayout() {
  const navigate = useNavigate()
  const { demoUser, logout } = useBookingApp()

  return (
    <div className="min-h-screen">
      <header className="site-header sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="flex flex-wrap items-center gap-4">
            <NavLink
              to="/home"
              className="text-xl font-extrabold tracking-tight text-[var(--accent-strong)] sm:text-2xl"
            >
              BEAUTY TUTTI
            </NavLink>
            <nav className="flex flex-wrap gap-1.5">
              <NavLink to="/home" className={linkClass}>
                Главная
              </NavLink>
              <NavLink to="/book/service" className={linkClass}>
                Запись
              </NavLink>
              <NavLink to="/account" className={linkClass}>
                Кабинет
              </NavLink>
            </nav>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {!demoUser ? (
              <>
                <Link to="/login" className="btn-secondary text-base">
                  Войти
                </Link>
                <Link to="/register/client" className="btn-primary text-base">
                  Регистрация
                </Link>
              </>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  logout()
                  navigate('/home', { replace: true })
                }}
              >
                Выйти
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <Outlet />
      </main>
    </div>
  )
}
