import type { CatalogData } from '@/context/BookingContext'

export function salonsWithService(catalog: CatalogData, serviceId: string) {
  const salonIds = new Set(
    catalog.masters
      .filter((m) => m.serviceIds.includes(serviceId))
      .map((m) => m.salonId),
  )
  return catalog.salons.filter((s) => salonIds.has(s.id))
}

export function mastersForSalonAndService(
  catalog: CatalogData,
  salonId: string,
  serviceId: string,
) {
  return catalog.masters.filter(
    (m) => m.salonId === salonId && m.serviceIds.includes(serviceId),
  )
}
