import { Navigate } from 'react-router-dom'

/** @deprecated Используйте /login */
export function MasterLoginPage() {
  return <Navigate to="/login" replace />
}
