import { Navigate } from 'react-router-dom'

/** Стартовый экран выбора роли больше не используется по умолчанию — гости попадают на главную. */
export function LandingPage() {
  return <Navigate to="/home" replace />
}
