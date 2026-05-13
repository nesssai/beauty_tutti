import { Navigate, Outlet } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'

export function RequireClient() {
  const { viewer } = useBookingApp()
  if (viewer === 'master') return <Navigate to="/master" replace />
  if (viewer !== 'client') return <Navigate to="/welcome" replace />
  return <Outlet />
}

export function RootRedirect() {
  const { viewer } = useBookingApp()
  if (viewer === 'landing') return <Navigate to="/welcome" replace />
  if (viewer === 'master') return <Navigate to="/master" replace />
  return <Navigate to="/home" replace />
}
