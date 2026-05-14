import { Navigate, Outlet } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'

export function RequireClient() {
  const { viewer } = useBookingApp()
  if (viewer === 'master') return <Navigate to="/master" replace />
  return <Outlet />
}

export function RootRedirect() {
  const { viewer } = useBookingApp()
  if (viewer === 'master') return <Navigate to="/master" replace />
  return <Navigate to="/home" replace />
}
