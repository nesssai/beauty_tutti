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
  const [loading, setLoading] = useState(false)

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

  const onSubmit = async (e: React.FormEvent) => {
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
    setLoading(true)
    const res = await registerClient({
      name: name.trim(),
      email: email.trim(),
      phone: norm,
      password,
    })
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    navigate('/home', { replace: true })
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14 animate-fade-in">
      <div className="card-panel p-8">
        <h1 className="page-title">Регистрация</h1>
        <p className="mt-3 text-base text-stone-600">
          Аккаунт для истории записей и персональных скидок.
        </p>
        <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-5">
          <label className="block text-base">
            <span className="font-medium text-stone-700">Имя</span>
            <input
              type="text"
              className="input-field mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-base">
            <span className="font-medium text-stone-700">Email</span>
            <input
              type="email"
              className="input-field mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-base">
            <span className="font-medium text-stone-700">Телефон</span>
            <input
              type="tel"
              className="input-field mt-2 font-mono"
              value={phoneDisplay}
              onChange={(e) => onPhoneChange(e.target.value)}
            />
          </label>
          <label className="block text-base">
            <span className="font-medium text-stone-700">Пароль</span>
            <input
              type="password"
              className="input-field mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Создание…' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="mt-6 text-center text-base text-stone-600">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-semibold text-[var(--accent-strong)] hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
