import { Navigate, Outlet, useNavigate, Link } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'

export function MasterShell() {
  const { viewer, masterSession, logout, catalog } = useBookingApp()
  const navigate = useNavigate()

  if (viewer === 'client' || !masterSession) {
    return <Navigate to="/login" replace />
  }

  const master = catalog.masters.find((m) => m.id === masterSession.masterId)
  const salon = master ? catalog.salons.find((s) => s.id === master.salonId) : null

  return (
    <div className="min-h-screen">
      <header className="site-header master-header sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/master"
              className="text-xl font-extrabold tracking-tight text-[var(--accent-strong)] sm:text-2xl"
            >
              BEAUTY TUTTI
            </Link>
            <span className="master-header-badge hidden sm:inline-flex">
              Кабинет мастера
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <div className="text-left sm:text-right">
              <p className="text-base font-bold text-stone-900">{masterSession.name}</p>
              {salon && (
                <p className="text-sm text-stone-500">{salon.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Link to="/home" className="btn-secondary text-sm">
                Сайт салона
              </Link>
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
                }}
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <Outlet />
      </main>
    </div>
  )
}
