import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { addMinutes } from 'date-fns'

import { buildInitialBookings } from '@/data/bookings'
import {
  CLIENT_DEMO_EMAIL,
  CLIENT_DEMO_PASSWORD,
  MASTER_LOGIN,
  MASTER_PASSWORD,
} from '@/data/authDemo'
import { SERVICES } from '@/data/services'
import { DEMO_USERS } from '@/data/users'
import type { AppViewer, Booking, DemoUser, VisitStatus } from '@/types/models'
import { bookingOverlapsExisting } from '@/utils/schedule'

export type BookingDraft = {
  serviceId?: string
  salonId?: string
  masterId?: string
  day?: Date
  slotStart?: Date
}

type BookingContextValue = {
  viewer: AppViewer
  demoUser: DemoUser | null
  setDemoUser: (u: DemoUser | null) => void
  enterAsGuestClient: () => void
  loginClient: (email: string, password: string) => boolean
  loginMaster: (login: string, password: string) => boolean
  logoutToLanding: () => void
  bookings: Booking[]
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
  updateBookingStatus: (id: string, status: VisitStatus) => void
  markFirstVisitDiscountUsed: () => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<AppViewer>('landing')
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null)
  const [bookings, setBookings] = useState<Booking[]>(() => buildInitialBookings())
  const [draft, setDraftState] = useState<BookingDraft>({})

  const setDraft = useCallback((patch: Partial<BookingDraft>) => {
    setDraftState((s) => ({ ...s, ...patch }))
  }, [])

  const resetDraft = useCallback(() => setDraftState({}), [])

  const enterAsGuestClient = useCallback(() => {
    setDemoUser(null)
    setViewer('client')
  }, [])

  const loginClient = useCallback((email: string, password: string) => {
    const normalized = email.trim().toLowerCase()
    if (
      normalized === CLIENT_DEMO_EMAIL.toLowerCase() &&
      password === CLIENT_DEMO_PASSWORD
    ) {
      const u = DEMO_USERS.find(
        (x) => x.email.toLowerCase() === CLIENT_DEMO_EMAIL.toLowerCase(),
      )
      if (u) {
        setDemoUser({ ...u })
        setViewer('client')
        return true
      }
    }
    return false
  }, [])

  const loginMaster = useCallback((login: string, password: string) => {
    if (login.trim() === MASTER_LOGIN && password === MASTER_PASSWORD) {
      setViewer('master')
      setDemoUser(null)
      return true
    }
    return false
  }, [])

  const logoutToLanding = useCallback(() => {
    setViewer('landing')
    setDemoUser(null)
    setDraftState({})
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
        if (bookingOverlapsExisting(candidate, prev, payload.masterId)) {
          return prev
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
        return [...prev, booking]
      })
      return added
    },
    [],
  )

  const updateBookingStatus = useCallback((id: string, status: VisitStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    )
  }, [])

  const markFirstVisitDiscountUsed = useCallback(() => {
    setDemoUser((u) => (u ? { ...u, firstVisitDiscountUsed: true } : u))
  }, [])

  const value = useMemo(
    () => ({
      viewer,
      demoUser,
      setDemoUser,
      enterAsGuestClient,
      loginClient,
      loginMaster,
      logoutToLanding,
      bookings,
      draft,
      setDraft,
      resetDraft,
      addBooking,
      updateBookingStatus,
      markFirstVisitDiscountUsed,
    }),
    [
      viewer,
      demoUser,
      enterAsGuestClient,
      loginClient,
      loginMaster,
      logoutToLanding,
      bookings,
      draft,
      setDraft,
      resetDraft,
      addBooking,
      updateBookingStatus,
      markFirstVisitDiscountUsed,
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
