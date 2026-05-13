import { parseISO } from 'date-fns'

import { SALON_WORK } from '@/data/salonHours'
import { SERVICES } from '@/data/services'
import type { Booking } from '@/types/models'

import { bookingsToBusyIntervals } from './bookingIntervals'
import { getAvailableSlotStarts, intervalsOverlap } from './slots'

export function getSlotsForBooking(params: {
  day: Date
  masterId: string
  serviceId: string
  bookings: Booking[]
}) {
  const service = SERVICES.find((s) => s.id === params.serviceId)
  if (!service) return []

  const busy = bookingsToBusyIntervals(
    params.bookings,
    params.masterId,
    params.day,
  )

  return getAvailableSlotStarts({
    day: params.day,
    workStartHour: SALON_WORK.startHour,
    workStartMinute: SALON_WORK.startMinute,
    workEndHour: SALON_WORK.endHour,
    workEndMinute: SALON_WORK.endMinute,
    slotStepMinutes: SALON_WORK.slotStepMinutes,
    serviceDurationMinutes: service.durationMinutes,
    busyIntervals: busy,
  })
}

export function bookingOverlapsExisting(
  candidate: { start: Date; end: Date },
  bookings: Booking[],
  masterId: string,
): boolean {
  return bookings
    .filter((b) => b.masterId === masterId && b.status !== 'cancelled')
    .some((b) =>
      intervalsOverlap(candidate, {
        start: parseISO(b.startIso),
        end: parseISO(b.endIso),
      }),
    )
}
