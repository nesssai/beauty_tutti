import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

import { useBookingApp } from '@/context/BookingContext'
import { MASTERS } from '@/data/masters'
import { SALONS } from '@/data/salons'
import { SERVICES } from '@/data/services'

export function BookConfirmPage() {
  const navigate = useNavigate()
  const {
    draft,
    demoUser,
    addBooking,
    resetDraft,
    markFirstVisitDiscountUsed,
  } = useBookingApp()
  const service = SERVICES.find((s) => s.id === draft.serviceId)
  const salon = SALONS.find((s) => s.id === draft.salonId)
  const master = MASTERS.find((m) => m.id === draft.masterId)

  const showFirstVisitDeal =
    !demoUser || (demoUser && !demoUser.firstVisitDiscountUsed)

  const [name, setName] = useState(demoUser?.name ?? '')
  const [email, setEmail] = useState(demoUser?.email ?? '')
  const [phone, setPhone] = useState(demoUser?.phone ?? '')
  const [error, setError] = useState<string | null>(null)

  if (!service || !salon || !master || !draft.day || !draft.slotStart) {
    return null
  }

  const slotStart = draft.slotStart
  const selectedDay = draft.day

  const end = new Date(
    slotStart.getTime() + service.durationMinutes * 60_000,
  )

  const discount = showFirstVisitDeal ? 0.1 : 0
  const price = Math.round(service.priceRub * (1 - discount))

  const submit = () => {
    if (!name.trim()) {
      setError('Укажите имя')
      return
    }
    if (!demoUser && !email.trim() && !phone.trim()) {
      setError('Укажите email или телефон')
      return
    }
    const ok = addBooking({
      serviceId: service.id,
      salonId: salon.id,
      masterId: master.id,
      slotStart: slotStart,
      clientName: name.trim(),
      clientEmail: email.trim() || undefined,
      clientPhone: phone.trim() || undefined,
      userId: demoUser?.id,
    })
    if (!ok) {
      setError('Это время уже занято. Выберите другой слот.')
      return
    }
    if (showFirstVisitDeal && demoUser) markFirstVisitDiscountUsed()
    resetDraft()
    navigate('/book/done')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-stone-900">Подтверждение</h2>
      {showFirstVisitDeal && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Скидка 10% на первое посещение применена к стоимости услуги.
        </div>
      )}
      <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-700 shadow-sm">
        <p>
          <span className="font-medium text-stone-900">{service.name}</span> ·{' '}
          {service.durationMinutes} мин
        </p>
        <p className="mt-2">
          {salon.name}, {master.name}
        </p>
        <p className="mt-2">
          {format(selectedDay, 'd MMMM yyyy', { locale: ru })},{' '}
          {format(slotStart, 'HH:mm')}–{format(end, 'HH:mm')}
        </p>
        <p className="mt-3 text-base font-semibold text-stone-900">
          К оплате: {price.toLocaleString('ru-RU')} ₽
          {discount > 0 && (
            <span className="ml-2 text-sm font-normal text-stone-500 line-through">
              {service.priceRub.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </p>
      </div>

      {!demoUser && (
        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-900">Контакты</p>
          <label className="block text-sm">
            <span className="text-stone-600">Имя</span>
            <input
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-stone-600">Email</span>
            <input
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-stone-600">Телефон</span>
            <input
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
        </div>
      )}

      {demoUser && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-700 shadow-sm">
          <p className="font-medium text-stone-900">Профиль</p>
          <p className="mt-2">{demoUser.name}</p>
          <p>{demoUser.email}</p>
          <p>{demoUser.phone}</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        className="inline-flex rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
      >
        Подтвердить запись
      </button>
    </div>
  )
}
