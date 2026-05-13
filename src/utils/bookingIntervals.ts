import { isSameDay, parseISO } from 'date-fns'

import type { Booking } from '@/types/models'

import type { TimeInterval } from './slots'

export function bookingsToBusyIntervals(
  bookings: Booking[],
  masterId: string,
  day: Date,
): TimeInterval[] {
  return bookings
    .filter(
      (b) =>
        b.masterId === masterId &&
        b.status !== 'cancelled' &&
        isSameDay(parseISO(b.startIso), day),
    )
    .map((b) => ({ start: parseISO(b.startIso), end: parseISO(b.endIso) }))
}
