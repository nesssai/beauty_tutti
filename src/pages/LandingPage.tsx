import { Link, Navigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'

export function LandingPage() {
  const { viewer } = useBookingApp()

  if (viewer === 'client') return <Navigate to="/home" replace />
  if (viewer === 'master') return <Navigate to="/master" replace />

  return (
    <div className="mx-auto flex min-h-[calc(100vh-0px)] max-w-lg flex-col justify-center px-4 py-12">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
          Сеть салонов
        </p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">BEAUTY TUTTI</h1>
        <p className="mt-3 text-stone-600">
          Выберите, как вы заходите в систему.
        </p>
      </div>
      <div className="mt-10 flex flex-col gap-4">
        <Link
          to="/login/client"
          className="rounded-2xl border border-stone-200 bg-white px-6 py-5 text-center text-lg font-semibold text-stone-900 shadow-sm ring-1 ring-stone-100 transition hover:border-rose-300 hover:ring-rose-100"
        >
          Вход для клиента
        </Link>
        <Link
          to="/login/master"
          className="rounded-2xl border border-stone-200 bg-white px-6 py-5 text-center text-lg font-semibold text-stone-900 shadow-sm ring-1 ring-stone-100 transition hover:border-rose-300 hover:ring-rose-100"
        >
          Вход для мастера
        </Link>
      </div>
    </div>
  )
}
