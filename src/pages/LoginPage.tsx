import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { isValidPassword } from '@/utils/validation'

export function LoginPage() {
  const navigate = useNavigate()
  const { viewer, demoUser, masterSession, login } = useBookingApp()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (viewer === 'master' && masterSession) {
      navigate('/master', { replace: true })
    } else if (viewer === 'client' && demoUser) {
      navigate('/home', { replace: true })
    }
  }, [viewer, demoUser, masterSession, navigate])

  if (
    (viewer === 'master' && masterSession) ||
    (viewer === 'client' && demoUser)
  ) {
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!identifier.trim()) {
      setError('Введите email (клиент) или логин (мастер).')
      return
    }
    if (!isValidPassword(password)) {
      setError('Пароль: от 4 до 128 символов.')
      return
    }
    setLoading(true)
    const role = await login(identifier, password)
    setLoading(false)
    if (role) {
      navigate(role === 'master' ? '/master' : '/home', { replace: true })
      return
    }
    setError('Неверный email/логин или пароль.')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14 animate-fade-in">
      <div className="rounded-3xl border border-stone-200/90 bg-white p-8 shadow-lg ring-1 ring-stone-100">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">
          BEAUTY TUTTI
        </p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">Вход в систему</h1>
        <p className="mt-3 text-base text-stone-600">
          Одна форма для клиентов и мастеров. Клиенты вводят email, мастера — свой логин.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block text-base">
            <span className="font-medium text-stone-700">Email или логин</span>
            <input
              type="text"
              autoComplete="username"
              placeholder="maria@example.com или anna"
              className="input-field mt-2"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </label>
          <label className="block text-base">
            <span className="font-medium text-stone-700">Пароль</span>
            <input
              type="password"
              autoComplete="current-password"
              className="input-field mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? 'Вход…' : 'Войти'}
          </button>
        </form>
        <p className="mt-6 text-center text-base text-stone-600">
          Нет аккаунта?{' '}
          <Link
            to="/register/client"
            className="font-semibold text-[var(--accent-strong)] hover:underline"
          >
            Зарегистрироваться
          </Link>
        </p>
        <p className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Демо-клиент: <span className="font-mono">maria@example.com</span> /{' '}
          <span className="font-mono">demo</span>
          <br />
          Демо-мастер: логин <span className="font-mono">anna</span> /{' '}
          <span className="font-mono">anna2026</span>
        </p>
        <p className="mt-6 text-center">
          <Link to="/home" className="text-stone-500 hover:text-stone-800 hover:underline">
            На главную
          </Link>
        </p>
      </div>
    </div>
  )
}
