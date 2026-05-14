import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useBookingApp } from '@/context/BookingContext'
import {
  formatRuPhoneDisplay,
  isValidEmail,
  isValidPassword,
  isValidPersonName,
  parseRuPhoneInputToNormalized,
} from '@/utils/validation'

export function ClientRegisterPage() {
  const navigate = useNavigate()
  const { viewer, demoUser, registerClient } = useBookingApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneDisplay, setPhoneDisplay] = useState('+7')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (viewer === 'master') navigate('/master', { replace: true })
    else if (viewer === 'client' && demoUser) navigate('/home', { replace: true })
  }, [viewer, demoUser, navigate])

  if (viewer === 'master') return null
  if (viewer === 'client' && demoUser) return null

  const onPhoneChange = (raw: string) => {
    const norm = parseRuPhoneInputToNormalized(raw)
    setPhoneDisplay(formatRuPhoneDisplay(norm))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isValidPersonName(name)) {
      setError('Имя: только буквы, пробелы и дефис, от 2 символов.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Введите корректный email.')
      return
    }
    if (!isValidPassword(password)) {
      setError('Пароль: от 4 до 128 символов.')
      return
    }
    const norm = parseRuPhoneInputToNormalized(phoneDisplay)
    const res = registerClient({
      name: name.trim(),
      email: email.trim(),
      phone: norm,
      password,
    })
    if (!res.ok) {
      setError(res.error)
      return
    }
    navigate('/home', { replace: true })
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-900">Регистрация</h1>
      <p className="mt-2 text-sm text-stone-600">
        Создайте аккаунт, чтобы видеть записи в личном кабинете и пользоваться скидками.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="text-stone-700">Имя</span>
          <input
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-stone-700">Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-stone-700">Телефон</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="+7 900 000 00 00"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 font-mono text-sm tracking-wide"
            value={phoneDisplay}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-stone-700">Пароль</span>
          <input
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
        >
          Зарегистрироваться
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        Уже есть аккаунт?{' '}
        <Link to="/login/client" className="font-medium text-[var(--accent-strong)] hover:underline">
          Войти
        </Link>
      </p>
      <p className="mt-4 text-center text-sm">
        <Link to="/home" className="text-stone-500 hover:text-stone-800 hover:underline">
          На главную
        </Link>
      </p>
    </div>
  )
}
