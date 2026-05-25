import { useMemo, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Link } from 'react-router-dom'

import { Modal } from '@/components/Modal'
import { Spinner } from '@/components/Spinner'
import { StatusBadge } from '@/components/StatusBadge'
import { useBookingApp } from '@/context/BookingContext'
import type { Booking } from '@/types/models'
import {
  formatRuPhoneDisplay,
  parseRuPhoneInputToNormalized,
} from '@/utils/validation'
import {
  canClientCancelBooking,
  canShowCancelButton,
  effectiveVisitStatus,
} from '@/utils/visitStatus'

function belongsToClient(b: Booking, userId: string, email: string) {
  return b.userId === userId || b.clientEmail?.toLowerCase() === email.toLowerCase()
}

export function AccountPage() {
  const { demoUser, bookings, cancelClientBooking, catalog } = useBookingApp()
  const [pendingCancel, setPendingCancel] = useState<Booking | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const cancelLock = useRef(false)

  if (!demoUser) {
    return (
      <div className="account-guest card-panel-glow mx-auto max-w-lg p-12 text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-soft)] to-white shadow-lg">
          <span className="text-3xl" aria-hidden>
            ✦
          </span>
        </div>
        <h1 className="page-title">Личный кабинет</h1>
        <p className="mt-4 text-lg text-stone-600">
          Войдите, чтобы управлять записями и видеть историю визитов.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/login" className="btn-primary">
            Войти
          </Link>
          <Link to="/register/client" className="btn-secondary">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    )
  }

  const mine = useMemo(
    () =>
      bookings
        .filter((b) =>
          belongsToClient(b, demoUser.id, demoUser.email),
        )
        .sort(
          (a, b) =>
            parseISO(b.startIso).getTime() - parseISO(a.startIso).getTime(),
        ),
    [bookings, demoUser.id, demoUser.email],
  )

  const upcoming = mine.filter((b) => effectiveVisitStatus(b) === 'scheduled')
  const history = mine.filter((b) => effectiveVisitStatus(b) !== 'scheduled')

  const phoneDisplay = formatRuPhoneDisplay(
    parseRuPhoneInputToNormalized(demoUser.phone),
  )

  const confirmCancel = async () => {
    if (!pendingCancel || cancelLock.current) return

    if (!canClientCancelBooking(pendingCancel.startIso)) {
      setErrorModal(
        'Отмена возможна не позднее чем за 24 часа до начала приёма. Свяжитесь с салоном, если нужна помощь.',
      )
      setPendingCancel(null)
      return
    }

    cancelLock.current = true
    setCancelling(true)
    const res = await cancelClientBooking(pendingCancel.id)
    setCancelling(false)
    cancelLock.current = false

    if (!res.ok) {
      setErrorModal(res.error)
      setPendingCancel(null)
      return
    }

    setPendingCancel(null)
    setSuccessModal(true)
  }

  const renderBookingCard = (b: Booking, index: number) => {
    const service = catalog.services.find((s) => s.id === b.serviceId)
    const salon = catalog.salons.find((s) => s.id === b.salonId)
    const master = catalog.masters.find((m) => m.id === b.masterId)
    const start = parseISO(b.startIso)
    const end = parseISO(b.endIso)
    const eff = effectiveVisitStatus(b)
    const showCancel = canShowCancelButton(b)

    return (
      <li
        key={b.id}
        className="booking-card stagger-item"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-stone-900">
              {service?.name ?? b.serviceId}
            </p>
            <p className="mt-1 text-base text-stone-600">
              {format(start, 'd MMMM yyyy', { locale: ru })}
            </p>
            <p className="text-base font-medium text-[var(--accent-strong)]">
              {format(start, 'HH:mm')} — {format(end, 'HH:mm')}
            </p>
          </div>
          <StatusBadge status={eff} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
          <span>{salon?.name}</span>
          <span>·</span>
          <span>{master?.name}</span>
        </div>
        {showCancel && (
          <div className="mt-5 border-t border-stone-100/80 pt-4">
            <button
              type="button"
              className="btn-danger-outline w-full sm:w-auto"
              onClick={() => setPendingCancel(b)}
            >
              Отменить запись
            </button>
          </div>
        )}
      </li>
    )
  }

  const pendingService = pendingCancel
    ? catalog.services.find((s) => s.id === pendingCancel.serviceId)
    : null
  const pendingMaster = pendingCancel
    ? catalog.masters.find((m) => m.id === pendingCancel.masterId)
    : null

  return (
    <div className="account-dashboard space-y-10 animate-fade-in">
      <header className="dashboard-hero relative overflow-hidden rounded-3xl p-8 sm:p-10">
        <div className="hero-glow hero-glow-1" aria-hidden />
        <p className="relative text-sm font-bold uppercase tracking-widest text-[var(--accent-strong)]">
          Личный кабинет
        </p>
        <h1 className="relative mt-2 page-title">{demoUser.name}</h1>
        <p className="relative mt-2 text-base text-stone-600">{demoUser.email}</p>
        <p className="relative font-mono text-sm text-stone-500">{phoneDisplay}</p>
        {!demoUser.firstVisitDiscountUsed && (
          <p className="relative mt-4 inline-flex rounded-full bg-emerald-100/90 px-4 py-2 text-sm font-semibold text-emerald-800">
            Скидка 10% на следующую запись
          </p>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Всего визитов', value: mine.length, accent: 'stat-accent-rose' },
          { label: 'Предстоящие', value: upcoming.length, accent: 'stat-accent-gold' },
          { label: 'В истории', value: history.length, accent: 'stat-accent-slate' },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.accent}`}>
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="section-head">
          <h2 className="page-subtitle">Предстоящие записи</h2>
          <span className="section-pill">{upcoming.length}</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty-state card-panel mt-4">
            <p className="text-base text-stone-600">Нет активных записей.</p>
            <Link to="/book/service" className="btn-primary mt-4 inline-flex">
              Записаться
            </Link>
          </div>
        ) : (
          <ul className="mt-5 grid gap-5 lg:grid-cols-2">{upcoming.map(renderBookingCard)}</ul>
        )}
      </section>

      {history.length > 0 && (
        <section>
          <div className="section-head">
            <h2 className="page-subtitle">История</h2>
            <span className="section-pill section-pill-muted">{history.length}</span>
          </div>
          <ul className="mt-5 grid gap-5 lg:grid-cols-2 opacity-95">
            {history.map(renderBookingCard)}
          </ul>
        </section>
      )}

      <Link to="/book/service" className="btn-primary btn-primary-lg inline-flex">
        Новая запись
      </Link>

      <Modal
        open={!!pendingCancel}
        onClose={() => !cancelling && setPendingCancel(null)}
        title="Отменить запись?"
        variant="danger"
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto"
              disabled={cancelling}
              onClick={() => setPendingCancel(null)}
            >
              Оставить запись
            </button>
            <button
              type="button"
              className="btn-danger w-full sm:w-auto"
              disabled={cancelling}
              onClick={() => void confirmCancel()}
            >
              {cancelling ? (
                <>
                  <Spinner className="mr-2 text-white" />
                  Отменяем…
                </>
              ) : (
                'Да, отменить'
              )}
            </button>
          </>
        }
      >
        {pendingCancel && (
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-stone-700">
              Запись будет отменена. Слот у мастера освободится. Статус изменится на
              «Отменён», запись останется в истории.
            </p>
            <div className="summary-card rounded-2xl p-4">
              <dl className="space-y-2 text-base">
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">Дата</dt>
                  <dd className="font-semibold text-stone-900">
                    {format(parseISO(pendingCancel.startIso), 'd MMMM yyyy', {
                      locale: ru,
                    })}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">Время</dt>
                  <dd className="font-semibold text-[var(--accent-strong)]">
                    {format(parseISO(pendingCancel.startIso), 'HH:mm')} —{' '}
                    {format(parseISO(pendingCancel.endIso), 'HH:mm')}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">Услуга</dt>
                  <dd className="font-medium">{pendingService?.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">Мастер</dt>
                  <dd className="font-medium">{pendingMaster?.name}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={successModal}
        onClose={() => setSuccessModal(false)}
        title="Запись отменена"
        variant="success"
        footer={
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            onClick={() => setSuccessModal(false)}
          >
            Понятно
          </button>
        }
      >
        <p className="text-base text-stone-700">
          Статус обновлён. Запись перемещена в раздел «История» со статусом «Отменён».
        </p>
      </Modal>

      <Modal
        open={!!errorModal}
        onClose={() => setErrorModal(null)}
        title="Не удалось отменить"
        variant="error"
        footer={
          <button
            type="button"
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setErrorModal(null)}
          >
            Закрыть
          </button>
        }
      >
        <p className="text-base text-stone-700">{errorModal}</p>
      </Modal>
    </div>
  )
}
