import type {
  Booking,
  DemoUser,
  Master,
  MasterBlockedInterval,
  Salon,
  Service,
} from '@/types/models'

const TOKEN_KEY = 'bt_token'
const API_ORIGIN = (import.meta as any).env?.VITE_API_ORIGIN?.toString?.() ?? ''

export function apiOrigin() {
  return API_ORIGIN as string
}

export type Catalog = {
  services: Service[]
  salons: Salon[]
  masters: Master[]
}

export type AuthResult = {
  token: string
  role: 'client' | 'master'
  client?: DemoUser
  master?: { masterId: string; name: string }
}

export type BookingCreateResult =
  | { ok: true; booking: Booking }
  | { ok: false; error: string; requiresLogin?: boolean }

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const url = `${API_ORIGIN}/api${path}`
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    let detail = 'Ошибка сервера.'
    try {
      const body = (await res.json()) as { detail?: string }
      if (body.detail) detail = body.detail
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, res.status)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),

  getCatalog: () => request<Catalog>('/catalog'),

  login: (identifier: string, password: string) =>
    request<AuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  register: (payload: {
    name: string
    email: string
    phone: string
    password: string
  }) =>
    request<AuthResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => request<AuthResult>('/auth/me'),

  checkClient: (email: string, phone: string) =>
    request<{ exists: boolean; requiresLogin: boolean; message?: string }>(
      '/clients/check',
      { method: 'POST', body: JSON.stringify({ email, phone }) },
    ),

  getBookings: () => request<Booking[]>('/bookings'),

  getBlocked: (masterId?: string) => {
    const q = masterId ? `?masterId=${encodeURIComponent(masterId)}` : ''
    return request<MasterBlockedInterval[]>(`/blocked-intervals${q}`)
  },

  getSlots: (masterId: string, serviceId: string, day: string) =>
    request<{ slots: string[] }>(
      `/slots?masterId=${encodeURIComponent(masterId)}&serviceId=${encodeURIComponent(serviceId)}&day=${day}`,
    ),

  createBooking: (payload: {
    serviceId: string
    salonId: string
    masterId: string
    slotStartIso: string
    clientName: string
    clientEmail?: string
    clientPhone?: string
  }) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        serviceId: payload.serviceId,
        salonId: payload.salonId,
        masterId: payload.masterId,
        slotStartIso: payload.slotStartIso,
        clientName: payload.clientName,
        clientEmail: payload.clientEmail,
        clientPhone: payload.clientPhone,
      }),
    }),

  cancelBooking: (id: string) =>
    request<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    }),

  updateBookingStatus: (id: string, status: 'scheduled' | 'cancelled') =>
    request<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateBookingNote: (id: string, note: string) =>
    request<Booking>(`/bookings/${id}/note`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    }),

  addBlocked: (payload: {
    masterId: string
    startIso: string
    endIso: string
  }) =>
    request<MasterBlockedInterval>('/blocked-intervals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  removeBlocked: (id: string) =>
    request<{ ok: boolean }>(`/blocked-intervals/${id}`, { method: 'DELETE' }),
}
