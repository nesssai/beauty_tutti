import { Navigate, Outlet, useNavigate, Link } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { MASTERS } from '@/data/masters'

export function MasterShell() {
  const { viewer, masterSession, logoutMaster } = useBookingApp()
  const navigate = useNavigate()

  if (viewer === 'client' || !masterSession) {
    return <Navigate to="/login/master" replace />
  }
  if (viewer !== 'master') return <Navigate to="/login/master" replace />

  const name = MASTERS.find((m) => m.id === masterSession.masterId)?.name ?? 'Мастер'

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-[var(--accent-strong)]">
            BEAUTY TUTTI — кабинет мастера
          </span>
          <span className="text-xs text-stone-500">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/home"
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-50"
          >
            Сайт салона
          </Link>
          <button
            type="button"
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-50"
            onClick={() => {
              logoutMaster()
              navigate('/login/master', { replace: true })
            }}
          >
            Выйти
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
