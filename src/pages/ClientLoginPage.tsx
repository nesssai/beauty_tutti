import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { CLIENT_DEMO_EMAIL } from '@/data/authDemo'

export function ClientLoginPage() {
  const navigate = useNavigate()
  const { viewer, loginClient, enterAsGuestClient } = useBookingApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (viewer === 'client') navigate('/home', { replace: true })
    else if (viewer === 'master') navigate('/master', { replace: true })
  }, [viewer, navigate])

  if (viewer === 'client' || viewer === 'master') return null

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (loginClient(email, password)) {
      navigate('/home', { replace: true })
    } else {
      setError('Неверный email или пароль.')
    }
  }

  const guest = () => {
    enterAsGuestClient()
    navigate('/home', { replace: true })
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-900">Вход клиента</h1>
      <p className="mt-2 text-sm text-stone-600">
        Демо-аккаунт: <span className="font-mono text-stone-800">{CLIENT_DEMO_EMAIL}</span> /{' '}
        <span className="font-mono text-stone-800">demo</span>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="text-stone-700">Email</span>
          <input
            type="email"
            autoComplete="username"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-stone-700">Пароль</span>
          <input
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Войти
        </button>
      </form>
      <button
        type="button"
        onClick={guest}
        className="mt-4 w-full rounded-xl border border-stone-200 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50"
      >
        Продолжить без входа (запись без личного кабинета)
      </button>
      <p className="mt-8 text-center text-sm">
        <Link to="/welcome" className="text-rose-700 hover:underline">
          На экран выбора роли
        </Link>
      </p>
    </div>
  )
}
