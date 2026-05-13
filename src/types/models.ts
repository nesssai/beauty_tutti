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
}

export type DemoUser = {
  id: string
  name: string
  email: string
  phone: string
  firstVisitDiscountUsed: boolean
}

/** Кто сейчас в приложении: выбор на входе, клиент или мастер. */
export type AppViewer = 'landing' | 'client' | 'master'
