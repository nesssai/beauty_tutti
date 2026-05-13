import { MASTERS } from '@/data/masters'
import { SALONS } from '@/data/salons'

export function salonsWithService(serviceId: string) {
  const salonIds = new Set(
    MASTERS.filter((m) => m.serviceIds.includes(serviceId)).map((m) => m.salonId),
  )
  return SALONS.filter((s) => salonIds.has(s.id))
}

export function mastersForSalonAndService(salonId: string, serviceId: string) {
  return MASTERS.filter(
    (m) => m.salonId === salonId && m.serviceIds.includes(serviceId),
  )
}
