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

/** Отмена клиентом на backend: не позднее чем за 24 часа до начала. */
export function canClientCancelBooking(startIso: string, now = new Date()): boolean {
  const start = parseISO(startIso)
  if (start.getTime() <= now.getTime()) return false
  return start.getTime() - now.getTime() >= 24 * 60 * 60 * 1000
}

/** Показывать кнопку отмены: запись ещё впереди и не отменена. */
export function canShowCancelButton(booking: Booking, now = new Date()): boolean {
  if (booking.status === 'cancelled') return false
  const start = parseISO(booking.startIso)
  if (start.getTime() <= now.getTime()) return false
  return effectiveVisitStatus(booking, now) === 'scheduled'
}

export function statusLabelRu(status: VisitStatus): string {
  switch (status) {
    case 'scheduled':
      return 'Ожидает'
    case 'completed':
      return 'Завершено'
    case 'cancelled':
      return 'Отменено'
    default:
      return status
  }
}

export function statusBadgeClass(status: VisitStatus): string {
  switch (status) {
    case 'scheduled':
      return 'badge badge-scheduled'
    case 'completed':
      return 'badge badge-completed'
    case 'cancelled':
      return 'badge badge-cancelled'
    default:
      return 'badge'
  }
}
