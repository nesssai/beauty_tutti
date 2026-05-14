import { parseISO } from 'date-fns'

import { SALON_WORK } from '@/data/salonHours'
import { SERVICES } from '@/data/services'
import type { Booking, MasterBlockedInterval } from '@/types/models'

import { blockedToBusyIntervals, bookingsToBusyIntervals } from './bookingIntervals'
import { getAvailableSlotStarts, intervalsOverlap } from './slots'

export function getSlotsForBooking(params: {
  day: Date
  masterId: string
  serviceId: string
  bookings: Booking[]
  blocked?: MasterBlockedInterval[]
}) {
  const service = SERVICES.find((s) => s.id === params.serviceId)
  if (!service) return []

  const busyBookings = bookingsToBusyIntervals(
    params.bookings,
    params.masterId,
    params.day,
  )
  const busyBlocked = blockedToBusyIntervals(
    params.blocked ?? [],
    params.masterId,
    params.day,
  )
  const busy = [...busyBookings, ...busyBlocked]

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
  blocked?: MasterBlockedInterval[],
): boolean {
  const fromBookings = bookings
    .filter((b) => b.masterId === masterId && b.status !== 'cancelled')
    .some((b) =>
      intervalsOverlap(candidate, {
        start: parseISO(b.startIso),
        end: parseISO(b.endIso),
      }),
    )
  if (fromBookings) return true
  return (blocked ?? [])
    .filter((b) => b.masterId === masterId)
    .some((b) =>
      intervalsOverlap(candidate, {
        start: parseISO(b.startIso),
        end: parseISO(b.endIso),
      }),
    )
}
