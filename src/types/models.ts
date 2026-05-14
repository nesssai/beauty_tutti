export type VisitStatus = 'scheduled' | 'completed' | 'cancelled'

export type Service = {
  id: string
  name: string
  durationMinutes: number
  priceRub: number
}

export type Salon = {
  id: string
  name: string
  address: string
  city: string
}

export type Master = {
  id: string
  name: string
  salonId: string
  serviceIds: string[]
}

export type Booking = {
  id: string
  masterId: string
  salonId: string
  serviceId: string
  startIso: string
  endIso: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  status: VisitStatus
  userId?: string
  /** Заметка мастера к записи (MVP в памяти). */
  masterNote?: string
}

export type DemoUser = {
  id: string
  name: string
  email: string
  phone: string
  firstVisitDiscountUsed: boolean
  /** Пароль хранится только для демо/MVP без бэкенда. */
  password?: string
}

/** Интервал, когда мастер недоступен для записи. */
export type MasterBlockedInterval = {
  id: string
  masterId: string
  startIso: string
  endIso: string
}

/** Кто сейчас в приложении: клиент (в т.ч. гость) или мастер. */
export type AppViewer = 'client' | 'master'
