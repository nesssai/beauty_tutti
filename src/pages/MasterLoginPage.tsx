import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import { MASTER_LOGIN } from '@/data/authDemo'

export function MasterLoginPage() {
  const navigate = useNavigate()
  const { viewer, loginMaster } = useBookingApp()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (viewer === 'master') navigate('/master', { replace: true })
    else if (viewer === 'client') navigate('/home', { replace: true })
  }, [viewer, navigate])

  if (viewer === 'client' || viewer === 'master') return null

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (loginMaster(login, password)) {
      navigate('/master', { replace: true })
    } else {
      setError('Неверный логин или пароль.')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-900">Вход мастера</h1>
      <p className="mt-2 text-sm text-stone-600">
        Демо: логин <span className="font-mono">{MASTER_LOGIN}</span>, пароль{' '}
        <span className="font-mono">master</span>
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
          className="w-full rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Войти
        </button>
      </form>
      <p className="mt-8 text-center text-sm">
        <Link to="/welcome" className="text-rose-700 hover:underline">
          На экран выбора роли
        </Link>
      </p>
    </div>
  )
}
