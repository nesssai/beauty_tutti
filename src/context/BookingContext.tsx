import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { format, parseISO } from 'date-fns'

import { api, apiOrigin, ApiError, setToken } from '@/api/client'
import { MASTERS } from '@/data/masters'
import { SALONS } from '@/data/salons'
import { SERVICES } from '@/data/services'
import type {
  AppViewer,
  Booking,
  DemoUser,
  Master,
  MasterBlockedInterval,
  Salon,
  Service,
} from '@/types/models'
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
  name: string
}

export type CatalogData = {
  services: Service[]
  salons: Salon[]
  masters: Master[]
}

type BookingContextValue = {
  ready: boolean
  apiError: string | null
  catalog: CatalogData
  viewer: AppViewer
  demoUser: DemoUser | null
  masterSession: MasterSession | null
  login: (
    identifier: string,
    password: string,
  ) => Promise<'client' | 'master' | null>
  registerClient: (payload: {
    name: string
    email: string
    phone: string
    password: string
  }) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void
  bookings: Booking[]
  blockedIntervals: MasterBlockedInterval[]
  refreshBookings: () => Promise<void>
  draft: BookingDraft
  setDraft: (patch: Partial<BookingDraft>) => void
  resetDraft: () => void
  checkExistingClient: (
    email: string,
    phone: string,
  ) => Promise<{ exists: boolean; message?: string }>
  addBooking: (payload: {
    serviceId: string
    salonId: string
    masterId: string
    slotStart: Date
    clientName: string
    clientEmail?: string
    clientPhone?: string
    userId?: string
  }) => Promise<
    | { ok: true; booking: Booking }
    | { ok: false; error: string; requiresLogin?: boolean }
  >
  updateBookingStatus: (id: string, status: 'scheduled' | 'cancelled') => Promise<void>
  updateBookingMasterNote: (id: string, note: string) => Promise<void>
  cancelClientBooking: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>
  addMasterBlockedInterval: (payload: {
    masterId: string
    start: Date
    end: Date
  }) => Promise<{ ok: true } | { ok: false; error: string }>
  removeMasterBlockedInterval: (id: string) => Promise<void>
  fetchSlotsForDay: (
    masterId: string,
    serviceId: string,
    day: Date,
  ) => Promise<Date[]>
}

const BookingContext = createContext<BookingContextValue | null>(null)

const emptyCatalog: CatalogData = { services: [], salons: [], masters: [] }

export function BookingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [catalog, setCatalog] = useState<CatalogData>(emptyCatalog)
  const [viewer, setViewer] = useState<AppViewer>('client')
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null)
  const [masterSession, setMasterSession] = useState<MasterSession | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blockedIntervals, setBlockedIntervals] = useState<MasterBlockedInterval[]>([])
  const [draft, setDraftState] = useState<BookingDraft>({})

  const refreshBookings = useCallback(async () => {
    try {
      const list = await api.getBookings()
      setBookings(list)
    } catch (e) {
      if (e instanceof ApiError) setApiError(e.message)
    }
  }, [])

  const refreshBlocked = useCallback(async (masterId?: string) => {
    try {
      const list = await api.getBlocked(masterId)
      setBlockedIntervals(list)
    } catch {
      /* optional */
    }
  }, [])

  const applyAuth = useCallback((auth: Awaited<ReturnType<typeof api.me>>) => {
    if (auth.role === 'client' && auth.client) {
      setDemoUser({
        id: auth.client.id,
        name: auth.client.name,
        email: auth.client.email,
        phone: auth.client.phone,
        firstVisitDiscountUsed: auth.client.firstVisitDiscountUsed,
      })
      setMasterSession(null)
      setViewer('client')
    } else if (auth.role === 'master' && auth.master) {
      setDemoUser(null)
      setMasterSession({
        masterId: auth.master.masterId,
        name: auth.master.name,
      })
      setViewer('master')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const origin = apiOrigin()
      const isGitHubPages = window.location.hostname.endsWith('github.io')
      if (isGitHubPages && !origin) {
        // Static/demo mode for GitHub Pages (no backend available at /api).
        setCatalog({ services: SERVICES, salons: SALONS, masters: MASTERS })
        setApiError(
          'Демо-режим: бэкенд недоступен на GitHub Pages. Для записи и входа запустите API отдельно и соберите сайт с VITE_API_ORIGIN.',
        )
        setReady(true)
        return
      }
      try {
        await api.health()
        const cat = await api.getCatalog()
        if (cancelled) return
        setCatalog(cat)
        try {
          const me = await api.me()
          if (!cancelled) applyAuth(me)
        } catch {
          /* not logged in */
        }
        await refreshBookings()
        if (!cancelled) setReady(true)
      } catch {
        if (!cancelled) {
          // Fallback catalog keeps UI usable even if API is down.
          setCatalog({ services: SERVICES, salons: SALONS, masters: MASTERS })
          setApiError(
            'Не удалось подключиться к серверу. Запустите API локально или укажите VITE_API_ORIGIN при сборке.',
          )
          setReady(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [applyAuth, refreshBookings])

  useEffect(() => {
    if (viewer === 'master' && masterSession) {
      void refreshBlocked(masterSession.masterId)
    }
  }, [viewer, masterSession, refreshBlocked])

  const setDraft = useCallback((patch: Partial<BookingDraft>) => {
    setDraftState((s) => ({ ...s, ...patch }))
  }, [])

  const resetDraft = useCallback(() => setDraftState({}), [])

  const login = useCallback(
    async (identifier: string, password: string) => {
      try {
        const res = await api.login(identifier.trim(), password)
        setToken(res.token)
        if (res.role === 'client' && res.client) {
          setDemoUser({
            id: res.client.id,
            name: res.client.name,
            email: res.client.email,
            phone: res.client.phone,
            firstVisitDiscountUsed: res.client.firstVisitDiscountUsed,
          })
          setMasterSession(null)
          setViewer('client')
        } else if (res.role === 'master' && res.master) {
          setDemoUser(null)
          setMasterSession({
            masterId: res.master.masterId,
            name: res.master.name,
          })
          setViewer('master')
        }
        await refreshBookings()
        if (res.role === 'master' && res.master) {
          await refreshBlocked(res.master.masterId)
        }
        return res.role === 'master' ? 'master' : 'client'
      } catch (e) {
        if (e instanceof ApiError) setApiError(e.message)
        return null
      }
    },
    [refreshBookings, refreshBlocked],
  )

  const registerClient = useCallback(
    async (payload: {
      name: string
      email: string
      phone: string
      password: string
    }): Promise<{ ok: true } | { ok: false; error: string }> => {
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
      try {
        const res = await api.register({
          name,
          email,
          phone,
          password: payload.password,
        })
        setToken(res.token)
        if (res.client) {
          setDemoUser({
            id: res.client.id,
            name: res.client.name,
            email: res.client.email,
            phone: res.client.phone,
            firstVisitDiscountUsed: res.client.firstVisitDiscountUsed,
          })
          setViewer('client')
        }
        await refreshBookings()
        return { ok: true }
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Ошибка регистрации.'
        return { ok: false, error: msg }
      }
    },
    [refreshBookings],
  )

  const logout = useCallback(() => {
    setToken(null)
    setDemoUser(null)
    setMasterSession(null)
    setViewer('client')
    setDraftState({})
    void refreshBookings()
  }, [refreshBookings])

  const checkExistingClient = useCallback(async (email: string, phone: string) => {
    try {
      const res = await api.checkClient(email.trim(), phone)
      return {
        exists: res.exists && res.requiresLogin,
        message: res.message,
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Ошибка проверки клиента.'
      return { exists: false, message: msg }
    }
  }, [])

  const addBooking = useCallback(
    async (payload: {
      serviceId: string
      salonId: string
      masterId: string
      slotStart: Date
      clientName: string
      clientEmail?: string
      clientPhone?: string
      userId?: string
    }) => {
      try {
        const booking = await api.createBooking({
          serviceId: payload.serviceId,
          salonId: payload.salonId,
          masterId: payload.masterId,
          slotStartIso: payload.slotStart.toISOString(),
          clientName: payload.clientName,
          clientEmail: payload.clientEmail,
          clientPhone: payload.clientPhone,
        })
        await refreshBookings()
        if (payload.userId && demoUser?.id === payload.userId) {
          setDemoUser((u) =>
            u ? { ...u, firstVisitDiscountUsed: true } : u,
          )
        }
        return { ok: true as const, booking }
      } catch (e) {
        if (e instanceof ApiError) {
          return {
            ok: false as const,
            error: e.message,
            requiresLogin: e.status === 403,
          }
        }
        return { ok: false as const, error: 'Не удалось создать запись.' }
      }
    },
    [refreshBookings, demoUser],
  )

  const updateBookingStatus = useCallback(
    async (id: string, status: 'scheduled' | 'cancelled') => {
      await api.updateBookingStatus(id, status)
      await refreshBookings()
    },
    [refreshBookings],
  )

  const updateBookingMasterNote = useCallback(
    async (id: string, note: string) => {
      await api.updateBookingNote(id, note)
      await refreshBookings()
    },
    [refreshBookings],
  )

  const cancelClientBooking = useCallback(
    async (id: string): Promise<{ ok: true } | { ok: false; error: string }> => {
      try {
        await api.cancelBooking(id)
        await refreshBookings()
        return { ok: true }
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Не удалось отменить.'
        return { ok: false, error: msg }
      }
    },
    [refreshBookings],
  )

  const addMasterBlockedInterval = useCallback(
    async (payload: {
      masterId: string
      start: Date
      end: Date
    }): Promise<{ ok: true } | { ok: false; error: string }> => {
      try {
        await api.addBlocked({
          masterId: payload.masterId,
          startIso: payload.start.toISOString(),
          endIso: payload.end.toISOString(),
        })
        await refreshBlocked(payload.masterId)
        return { ok: true }
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Ошибка.'
        return { ok: false, error: msg }
      }
    },
    [refreshBlocked],
  )

  const removeMasterBlockedInterval = useCallback(
    async (id: string) => {
      await api.removeBlocked(id)
      if (masterSession) await refreshBlocked(masterSession.masterId)
    },
    [masterSession, refreshBlocked],
  )

  const fetchSlotsForDay = useCallback(
    async (masterId: string, serviceId: string, day: Date) => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const res = await api.getSlots(masterId, serviceId, dayStr)
      return res.slots.map((iso) => parseISO(iso))
    },
    [],
  )

  const value = useMemo(
    () => ({
      ready,
      apiError,
      catalog,
      viewer,
      demoUser,
      masterSession,
      login,
      registerClient,
      logout,
      bookings,
      blockedIntervals,
      refreshBookings,
      draft,
      setDraft,
      resetDraft,
      checkExistingClient,
      addBooking,
      updateBookingStatus,
      updateBookingMasterNote,
      cancelClientBooking,
      addMasterBlockedInterval,
      removeMasterBlockedInterval,
      fetchSlotsForDay,
    }),
    [
      ready,
      apiError,
      catalog,
      viewer,
      demoUser,
      masterSession,
      login,
      registerClient,
      logout,
      bookings,
      blockedIntervals,
      refreshBookings,
      draft,
      setDraft,
      resetDraft,
      checkExistingClient,
      addBooking,
      updateBookingStatus,
      updateBookingMasterNote,
      cancelClientBooking,
      addMasterBlockedInterval,
      removeMasterBlockedInterval,
      fetchSlotsForDay,
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
