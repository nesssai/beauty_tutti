import { Navigate, Outlet, useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'

export function MasterShell() {
  const { viewer, logoutToLanding } = useBookingApp()
  const navigate = useNavigate()

  if (viewer === 'client') return <Navigate to="/home" replace />
  if (viewer !== 'master') return <Navigate to="/login/master" replace />

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
        <span className="text-base font-semibold text-rose-800">BEAUTY TUTTI — мастер</span>
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
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
