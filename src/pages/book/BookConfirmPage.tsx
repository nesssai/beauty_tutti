import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

import {
  BookingSuccessSummary,
  type BookingConfirmationSnapshot,
} from '@/components/BookingSuccessSummary'
import { Modal } from '@/components/Modal'
import { Spinner } from '@/components/Spinner'
import { useBookingApp } from '@/context/BookingContext'
import {
  formatRuPhoneDisplay,
  isCompleteRuMobile,
  isValidEmail,
  isValidPersonName,
  parseRuPhoneInputToNormalized,
} from '@/utils/validation'

export function BookConfirmPage() {
  const {
    draft,
    demoUser,
    catalog,
    addBooking,
    resetDraft,
    checkExistingClient,
  } = useBookingApp()

  const service = catalog.services.find((s) => s.id === draft.serviceId)
  const salon = catalog.salons.find((s) => s.id === draft.salonId)
  const master = catalog.masters.find((m) => m.id === draft.masterId)
  const slotStart = draft.slotStart
  const selectedDay = draft.day

  const showFirstVisitDeal =
    !demoUser || (demoUser && !demoUser.firstVisitDiscountUsed)

  const [name, setName] = useState(demoUser?.name ?? '')
  const [email, setEmail] = useState(demoUser?.email ?? '')
  const [phoneDisplay, setPhoneDisplay] = useState(() =>
    demoUser?.phone
      ? formatRuPhoneDisplay(parseRuPhoneInputToNormalized(demoUser.phone))
      : '+7',
  )
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successSnapshot, setSuccessSnapshot] =
    useState<BookingConfirmationSnapshot | null>(null)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(
    null,
  )

  const submitLock = useRef(false)

  const canShowForm =
    service && salon && master && selectedDay && slotStart

  const closeSuccessModal = useCallback(() => {
    setSuccessModalOpen(false)
    setSuccessSnapshot(null)
    resetDraft()
  }, [resetDraft])

  if (!canShowForm && !successSnapshot) {
    return null
  }

  const displayService = successSnapshot?.service ?? service!
  const displaySlotStart = successSnapshot
    ? new Date(successSnapshot.booking.startIso)
    : slotStart!
  const end = new Date(
    displaySlotStart.getTime() + displayService.durationMinutes * 60_000,
  )
  const discount = showFirstVisitDeal && !successSnapshot ? 0.1 : 0
  const price = Math.round(displayService.priceRub * (1 - discount))

  const onGuestPhoneChange = (raw: string) => {
    const norm = parseRuPhoneInputToNormalized(raw)
    setPhoneDisplay(formatRuPhoneDisplay(norm))
  }

  const showError = (message: string, title = 'Не удалось подтвердить запись') => {
    setInlineError(message)
    setErrorModal({ title, message })
  }

  const submit = async () => {
    if (submitLock.current || submitting || !canShowForm) return

    setInlineError(null)
    if (!isValidPersonName(name)) {
      showError('Имя: только буквы, пробелы и дефис, от 2 символов.', 'Проверьте данные')
      return
    }
    if (!demoUser) {
      if (!isValidEmail(email)) {
        showError('Введите корректный email.', 'Проверьте данные')
        return
      }
      const phoneNorm = parseRuPhoneInputToNormalized(phoneDisplay)
      if (!isCompleteRuMobile(phoneNorm)) {
        showError('Телефон должен быть в формате +7 и 10 цифр.', 'Проверьте данные')
        return
      }
      const check = await checkExistingClient(email, phoneNorm)
      if (check.exists) {
        showError(
          check.message ??
            'Вы уже зарегистрированы. Войдите в аккаунт для записи.',
          'Требуется вход',
        )
        return
      }
    }

    const phoneNormGuest = demoUser
      ? undefined
      : parseRuPhoneInputToNormalized(phoneDisplay)

    const payload = {
      serviceId: service!.id,
      salonId: salon!.id,
      masterId: master!.id,
      slotStart: slotStart!,
      clientName: name.trim(),
      clientEmail: (demoUser ? demoUser.email : email).trim() || undefined,
      clientPhone: demoUser ? demoUser.phone : phoneNormGuest,
      userId: demoUser?.id,
    }

    submitLock.current = true
    setSubmitting(true)

    try {
      const res = await addBooking(payload)

      if (!res.ok) {
        const msg = res.requiresLogin
          ? `${res.error} Перейдите на страницу входа.`
          : res.error
        showError(msg, res.requiresLogin ? 'Требуется вход' : 'Ошибка записи')
        return
      }

      const snapshot: BookingConfirmationSnapshot = {
        booking: res.booking,
        service: service!,
        salon: salon!,
        master: master!,
        priceRub: Math.round(
          service!.priceRub * (1 - (showFirstVisitDeal ? 0.1 : 0)),
        ),
        durationMinutes: service!.durationMinutes,
        hadDiscount: showFirstVisitDeal,
        originalPriceRub: service!.priceRub,
      }

      setSuccessSnapshot(snapshot)
      setSuccessModalOpen(true)
    } finally {
      setSubmitting(false)
      submitLock.current = false
    }
  }

  const formVisible = canShowForm && !successModalOpen

  return (
    <>
      {formVisible && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="page-subtitle">Подтверждение</h2>
          {showFirstVisitDeal && (
            <div className="alert-success">
              Скидка 10% на первое посещение будет применена к стоимости услуги.
            </div>
          )}
          <div className="card-panel card-panel-glow text-base text-stone-700">
            <p>
              <span className="font-semibold text-stone-900">{service!.name}</span> ·{' '}
              {service!.durationMinutes} мин
            </p>
            <p className="mt-2">
              {salon!.name}, {master!.name}
            </p>
            <p className="mt-2">
              {format(selectedDay!, 'd MMMM yyyy', { locale: ru })},{' '}
              {format(slotStart!, 'HH:mm')}–{format(end, 'HH:mm')}
            </p>
            <p className="mt-3 text-xl font-bold text-[var(--accent-strong)]">
              К оплате: {price.toLocaleString('ru-RU')} ₽
            </p>
          </div>

          {!demoUser && (
            <div className="card-panel space-y-4">
              <p className="font-semibold text-stone-900">Контакты</p>
              <label className="block text-base">
                <span className="text-stone-600">Имя</span>
                <input
                  type="text"
                  autoComplete="name"
                  className="input-field mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                />
              </label>
              <label className="block text-base">
                <span className="text-stone-600">Email</span>
                <input
                  type="email"
                  className="input-field mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </label>
              <label className="block text-base">
                <span className="text-stone-600">Телефон</span>
                <input
                  type="tel"
                  className="input-field mt-1 font-mono"
                  value={phoneDisplay}
                  onChange={(e) => onGuestPhoneChange(e.target.value)}
                  disabled={submitting}
                />
              </label>
            </div>
          )}

          {demoUser && (
            <div className="card-panel text-base">
              <p className="font-semibold text-stone-900">Профиль</p>
              <p className="mt-2">{demoUser.name}</p>
              <p>{demoUser.email}</p>
              <p className="font-mono text-sm">{demoUser.phone}</p>
            </div>
          )}

          {inlineError && (
            <p className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-base text-red-800">
              {inlineError}
            </p>
          )}

          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting}
            className="btn-primary btn-primary-lg w-full sm:w-auto disabled:pointer-events-none disabled:opacity-70"
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <Spinner className="mr-2 text-white" />
                Сохраняем запись…
              </>
            ) : (
              'Подтвердить запись'
            )}
          </button>
        </div>
      )}

      <Modal
        open={successModalOpen && !!successSnapshot}
        onClose={closeSuccessModal}
        title="Вы успешно записаны"
        variant="success"
        size="lg"
        closeOnBackdrop
        footer={
          <>
            <button type="button" onClick={closeSuccessModal} className="btn-secondary w-full sm:w-auto">
              Закрыть
            </button>
            {demoUser ? (
              <Link
                to="/account"
                onClick={closeSuccessModal}
                className="btn-primary w-full sm:w-auto"
              >
                Мои записи
              </Link>
            ) : (
              <Link
                to="/home"
                onClick={closeSuccessModal}
                className="btn-primary w-full sm:w-auto"
              >
                На главную
              </Link>
            )}
          </>
        }
      >
        {successSnapshot && (
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-stone-600">
              Запись сохранена в системе. Ниже — данные, которые мы зафиксировали.
            </p>
            <BookingSuccessSummary data={successSnapshot} />
          </div>
        )}
      </Modal>

      <Modal
        open={!!errorModal}
        onClose={() => setErrorModal(null)}
        title={errorModal?.title ?? 'Ошибка'}
        variant="error"
        closeOnBackdrop
        footer={
          <>
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto"
              onClick={() => setErrorModal(null)}
            >
              Понятно
            </button>
            {errorModal?.message.includes('вход') && (
              <Link
                to="/login"
                className="btn-primary w-full sm:w-auto"
                onClick={() => setErrorModal(null)}
              >
                Войти
              </Link>
            )}
          </>
        }
      >
        <p className="text-base leading-relaxed text-stone-700">{errorModal?.message}</p>
        <p className="mt-3 text-sm text-stone-500">
          Введённые данные сохранены — вы можете исправить их и попробовать снова.
        </p>
      </Modal>
    </>
  )
}
