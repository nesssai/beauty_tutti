import { parseISO } from 'date-fns'

import type { Booking, VisitStatus } from '@/types/models'

/** «Завершён» выставляется автоматически после окончания слота, если не отменён. */
export function effectiveVisitStatus(booking: Booking, now = new Date()): VisitStatus {
  if (booking.status === 'cancelled') return 'cancelled'
  const end = parseISO(booking.endIso)
  if (booking.status === 'scheduled' && end.getTime() <= now.getTime()) {
    return 'completed'
  }
  if (booking.status === 'completed') return 'completed'
  return 'scheduled'
}

/** Отмена клиентом: не позднее чем за 24 часа до начала. */
export function canClientCancelBooking(startIso: string, now = new Date()): boolean {
  const start = parseISO(startIso)
  if (start.getTime() <= now.getTime()) return false
  return start.getTime() - now.getTime() >= 24 * 60 * 60 * 1000
}

export function statusLabelRu(status: VisitStatus): string {
  switch (status) {
    case 'scheduled':
      return 'Запланирован'
    case 'completed':
      return 'Завершён'
    case 'cancelled':
      return 'Отменён'
    default:
      return status
  }
}
