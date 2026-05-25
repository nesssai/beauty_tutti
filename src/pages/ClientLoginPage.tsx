import { Navigate } from 'react-router-dom'

/** @deprecated Используйте /login */
export function ClientLoginPage() {
  return <Navigate to="/login" replace />
}
