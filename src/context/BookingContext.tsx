import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { addMinutes, parseISO } from 'date-fns'

import { buildInitialBookings } from '@/data/bookings'
import {
  CLIENT_DEMO_EMAIL,
  CLIENT_DEMO_PASSWORD,
  MASTER_CREDENTIALS,
} from '@/data/authDemo'
import { SERVICES } from '@/data/services'
import { DEMO_USERS } from '@/data/users'
import type {
  AppViewer,
  Booking,
  DemoUser,
  MasterBlockedInterval,
} from '@/types/models'
import { bookingOverlapsExisting } from '@/utils/schedule'
import { intervalsOverlap } from '@/utils/slots'
import {
  isValidEmail,
  isValidPassword,
  isValidPersonName,
  normalizeRuPhoneFromDigits,
} from '@/utils/validation'

export type BookingDraft = {
  serviceId?: string
  salonId?: string
  masterId?: string
  day?: Date
  slotStart?: Date
}

export type MasterSession = {
  masterId: string
}

type BookingContextValue = {
  viewer: AppViewer
  demoUser: DemoUser | null
  masterSession: MasterSession | null
  setDemoUser: (u: DemoUser | null) => void
  loginClient: (email: string, password: string) => boolean
  registerClient: (payload: {
    name: string
    email: string
    phone: string
    password: string
  }) => { ok: true } | { ok: false; error: string }
  loginMaster: (masterId: string, login: string, password: string) => boolean
  logoutClient: () => void
  logoutMaster: () => void
  bookings: Booking[]
  blockedIntervals: MasterBlockedInterval[]
  draft: BookingDraft
  setDraft: (patch: Partial<BookingDraft>) => void
  resetDraft: () => void
  addBooking: (payload: {
    serviceId: string
    salonId: string
    masterId: string
    slotStart: Date
    clientName: string
    clientEmail?: string
    clientPhone?: string
    userId?: string
  }) => boolean
  /** Мастер вручную: только «запланирован» или «отменён». */
  updateBookingStatus: (id: string, status: 'scheduled' | 'cancelled') => void
  updateBookingMasterNote: (id: string, note: string) => void
  markFirstVisitDiscountUsed: () => void
  cancelClientBooking: (id: string) => { ok: true } | { ok: false; error: string }
  addMasterBlockedInterval: (payload: {
    masterId: string
    start: Date
    end: Date
  }) => { ok: true } | { ok: false; error: string }
  removeMasterBlockedInterval: (id: string) => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

function syncCompletedBookings(list: Booking[]): Booking[] {
  const now = Date.now()
  return list.map((b) => {
    if (b.status !== 'scheduled') return b
    if (parseISO(b.endIso).getTime() <= now) {
      return { ...b, status: 'completed' as const }
    }
    return b
  })
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<AppViewer>('client')
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null)
  const [masterSession, setMasterSession] = useState<MasterSession | null>(null)
  const [registeredUsers, setRegisteredUsers] = useState<DemoUser[]>(() =>
    DEMO_USERS.map((u) => ({ ...u })),
  )
  const [bookings, setBookings] = useState<Booking[]>(() => buildInitialBookings())
  const [blockedIntervals, setBlockedIntervals] = useState<MasterBlockedInterval[]>([])
  const [draft, setDraftState] = useState<BookingDraft>({})

  useEffect(() => {
    const tick = () => {
      setBookings((prev) => syncCompletedBookings(prev))
    }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  const setDraft = useCallback((patch: Partial<BookingDraft>) => {
    setDraftState((s) => ({ ...s, ...patch }))
  }, [])

  const resetDraft = useCallback(() => setDraftState({}), [])

  const loginClient = useCallback((email: string, password: string) => {
    const normalized = email.trim().toLowerCase()
    if (
      normalized === CLIENT_DEMO_EMAIL.toLowerCase() &&
      password === CLIENT_DEMO_PASSWORD
    ) {
      const u = registeredUsers.find(
        (x) => x.email.toLowerCase() === CLIENT_DEMO_EMAIL.toLowerCase(),
      )
      if (u) {
        setDemoUser({ ...u })
        setViewer('client')
        return true
      }
    }
    const found = registeredUsers.find(
      (x) => x.email.trim().toLowerCase() === normalized,
    )
    if (found && found.password === password) {
      setDemoUser({ ...found })
      setViewer('client')
      return true
    }
    return false
  }, [registeredUsers])

  const registerClient = useCallback(
    (payload: {
      name: string
      email: string
      phone: string
      password: string
    }): { ok: true } | { ok: false; error: string } => {
      const name = payload.name.trim()
      const email = payload.email.trim().toLowerCase()
      const phone = normalizeRuPhoneFromDigits(payload.phone)
      if (!isValidPersonName(name)) {
        return { ok: false, error: 'Введите корректное имя (буквы, 2–80 символов).' }
      }
      if (!isValidEmail(email)) {
        return { ok: false, error: 'Введите корректный email.' }
      }
      if (!/^\+7\d{10}$/.test(phone)) {
        return { ok: false, error: 'Телефон: +7 и 10 цифр номера.' }
      }
      if (!isValidPassword(payload.password)) {
        return { ok: false, error: 'Пароль: от 4 до 128 символов.' }
      }
      if (registeredUsers.some((u) => u.email.toLowerCase() === email)) {
        return { ok: false, error: 'Пользователь с таким email уже есть.' }
      }
      const user: DemoUser = {
        id: `u_${crypto.randomUUID()}`,
        name,
        email,
        phone,
        firstVisitDiscountUsed: false,
        password: payload.password,
      }
      setRegisteredUsers((prev) => [...prev, user])
      setDemoUser(user)
      setViewer('client')
      return { ok: true }
    },
    [registeredUsers],
  )

  const loginMaster = useCallback((masterId: string, login: string, password: string) => {
    const cred = MASTER_CREDENTIALS[masterId]
    if (!cred) return false
    if (login.trim() === cred.login && password === cred.password) {
      setMasterSession({ masterId })
      setViewer('master')
      setDemoUser(null)
      return true
    }
    return false
  }, [])

  const logoutClient = useCallback(() => {
    setDemoUser(null)
    setDraftState({})
    setViewer('client')
  }, [])

  const logoutMaster = useCallback(() => {
    setMasterSession(null)
    setViewer('client')
  }, [])

  const addBooking = useCallback(
    (payload: {
      serviceId: string
      salonId: string
      masterId: string
      slotStart: Date
      clientName: string
      clientEmail?: string
      clientPhone?: string
      userId?: string
    }) => {
      const service = SERVICES.find((s) => s.id === payload.serviceId)
      if (!service) return false
      const end = addMinutes(payload.slotStart, service.durationMinutes)
      const candidate = { start: payload.slotStart, end }

      let added = false
      setBookings((prev) => {
        const synced = syncCompletedBookings(prev)
        if (
          bookingOverlapsExisting(
            candidate,
            synced,
            payload.masterId,
            blockedIntervals,
          )
        ) {
          return synced
        }
        added = true
        const booking: Booking = {
          id: `b_${crypto.randomUUID()}`,
          masterId: payload.masterId,
          salonId: payload.salonId,
          serviceId: payload.serviceId,
          startIso: payload.slotStart.toISOString(),
          endIso: end.toISOString(),
          clientName: payload.clientName,
          clientEmail: payload.clientEmail,
          clientPhone: payload.clientPhone,
          status: 'scheduled',
          userId: payload.userId,
        }
        return [...synced, booking]
      })
      return added
    },
    [blockedIntervals],
  )

  const updateBookingStatus = useCallback((id: string, status: 'scheduled' | 'cancelled') => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        if (b.status === 'completed') return b
        return { ...b, status }
      }),
    )
  }, [])

  const updateBookingMasterNote = useCallback((id: string, note: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, masterNote: note } : b)),
    )
  }, [])

  const markFirstVisitDiscountUsed = useCallback(() => {
    setDemoUser((u) => {
      if (!u) return u
      const id = u.id
      setRegisteredUsers((prev) =>
        prev.map((x) => (x.id === id ? { ...x, firstVisitDiscountUsed: true } : x)),
      )
      return { ...u, firstVisitDiscountUsed: true }
    })
  }, [])

  const cancelClientBooking = useCallback(
    (id: string): { ok: true } | { ok: false; error: string } => {
      if (!demoUser) return { ok: false, error: 'Войдите в аккаунт.' }
      const b = bookings.find((x) => x.id === id)
      if (!b || b.userId !== demoUser.id) {
        return { ok: false, error: 'Запись не найдена.' }
      }
      const start = parseISO(b.startIso)
      const now = new Date()
      if (start.getTime() <= now.getTime()) {
        return { ok: false, error: 'Нельзя отменить прошедшую запись.' }
      }
      if (start.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
        return {
          ok: false,
          error: 'Отмена возможна не позднее чем за 24 часа до приёма.',
        }
      }
      setBookings((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: 'cancelled' as const } : x)),
      )
      return { ok: true }
    },
    [bookings, demoUser],
  )

  const addMasterBlockedInterval = useCallback(
    (payload: {
      masterId: string
      start: Date
      end: Date
    }): { ok: true } | { ok: false; error: string } => {
      if (payload.end.getTime() <= payload.start.getTime()) {
        return { ok: false, error: 'Время окончания должно быть позже начала.' }
      }
      const candidate = { start: payload.start, end: payload.end }
      const clashBooking = bookings.some(
        (b) =>
          b.masterId === payload.masterId &&
          b.status !== 'cancelled' &&
          intervalsOverlap(candidate, {
            start: parseISO(b.startIso),
            end: parseISO(b.endIso),
          }),
      )
      if (clashBooking) {
        return { ok: false, error: 'На это время уже есть запись.' }
      }
      const clashBlock = blockedIntervals.some(
        (b) =>
          b.masterId === payload.masterId &&
          intervalsOverlap(candidate, {
            start: parseISO(b.startIso),
            end: parseISO(b.endIso),
          }),
      )
      if (clashBlock) {
        return { ok: false, error: 'Пересечение с другим недоступным интервалом.' }
      }
      const row: MasterBlockedInterval = {
        id: `blk_${crypto.randomUUID()}`,
        masterId: payload.masterId,
        startIso: payload.start.toISOString(),
        endIso: payload.end.toISOString(),
      }
      setBlockedIntervals((prev) => [...prev, row])
      return { ok: true }
    },
    [bookings, blockedIntervals],
  )

  const removeMasterBlockedInterval = useCallback((id: string) => {
    setBlockedIntervals((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      viewer,
      demoUser,
      masterSession,
      setDemoUser,
      loginClient,
      registerClient,
      loginMaster,
      logoutClient,
      logoutMaster,
      bookings,
      blockedIntervals,
      draft,
      setDraft,
      resetDraft,
      addBooking,
      updateBookingStatus,
      updateBookingMasterNote,
      markFirstVisitDiscountUsed,
      cancelClientBooking,
      addMasterBlockedInterval,
      removeMasterBlockedInterval,
    }),
    [
      viewer,
      demoUser,
      masterSession,
      loginClient,
      registerClient,
      loginMaster,
      logoutClient,
      logoutMaster,
      bookings,
      blockedIntervals,
      draft,
      setDraft,
      resetDraft,
      addBooking,
      updateBookingStatus,
      updateBookingMasterNote,
      markFirstVisitDiscountUsed,
      cancelClientBooking,
      addMasterBlockedInterval,
      removeMasterBlockedInterval,
    ],
  )

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBookingApp() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBookingApp must be used within BookingProvider')
  return ctx
}
