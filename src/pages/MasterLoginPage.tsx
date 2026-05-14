import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { MASTER_CREDENTIALS } from '@/data/authDemo'
import { MASTERS } from '@/data/masters'
import { isValidLoginId, isValidPassword } from '@/utils/validation'

export function MasterLoginPage() {
  const { masterId } = useParams()
  const navigate = useNavigate()
  const { viewer, loginMaster } = useBookingApp()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (viewer === 'master') navigate('/master', { replace: true })
  }, [viewer, navigate])

  if (viewer === 'master') return null

  if (!masterId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold text-stone-900">Вход мастера</h1>
        <p className="mt-2 text-sm text-stone-600">
          Выберите свой профиль — у каждого мастера отдельный логин и пароль.
        </p>
        <ul className="mt-8 space-y-3">
          {MASTERS.map((m) => {
            const cred = MASTER_CREDENTIALS[m.id]
            return (
              <li key={m.id}>
                <Link
                  to={`/login/master/${m.id}`}
                  className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-5 py-4 text-left shadow-sm ring-1 ring-stone-100 transition hover:border-[var(--accent)]/35 hover:ring-[var(--accent-soft)]"
                >
                  <span className="font-semibold text-stone-900">{m.name}</span>
                  <span className="text-xs text-stone-500">
                    логин:{' '}
                    <span className="font-mono text-stone-700">{cred?.login ?? '—'}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <p className="mt-10 text-center text-sm">
          <Link to="/home" className="text-[var(--accent-strong)] hover:underline">
            На главную
          </Link>
        </p>
      </div>
    )
  }

  const master = MASTERS.find((m) => m.id === masterId)
  const cred = masterId ? MASTER_CREDENTIALS[masterId] : undefined

  if (!master || !cred) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-stone-700">Мастер не найден.</p>
        <Link to="/login/master" className="mt-4 inline-block text-[var(--accent-strong)] hover:underline">
          К списку мастеров
        </Link>
      </div>
    )
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isValidLoginId(login)) {
      setError('Логин: латиница, цифры, точка, 2–32 символа.')
      return
    }
    if (!isValidPassword(password)) {
      setError('Пароль: от 4 до 128 символов.')
      return
    }
    if (loginMaster(master.id, login, password)) {
      navigate('/master', { replace: true })
    } else {
      setError('Неверный логин или пароль.')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <p className="text-sm font-medium text-[var(--accent-strong)]">Вход мастера</p>
      <h1 className="mt-1 text-2xl font-bold text-stone-900">{master.name}</h1>
      <p className="mt-2 text-sm text-stone-600">
        Демо: логин <span className="font-mono">{cred.login}</span>, пароль{' '}
        <span className="font-mono">{cred.password}</span>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="text-stone-700">Логин</span>
          <input
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="block text-sm">
          <span className="text-stone-700">Пароль</span>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
        >
          Войти
        </button>
      </form>
      <p className="mt-8 text-center text-sm">
        <Link to="/login/master" className="text-[var(--accent-strong)] hover:underline">
          Другой мастер
        </Link>
        {' · '}
        <Link to="/home" className="text-stone-500 hover:underline">
          На главную
        </Link>
      </p>
    </div>
  )
}
