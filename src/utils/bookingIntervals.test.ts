import { describe, expect, it } from 'vitest'
import { bookingsToBusyIntervals } from './bookingIntervals'
import type { Booking } from '@/types/models'

const day = new Date('2026-05-20T12:00:00')

describe('bookingsToBusyIntervals', () => {
  const bookings: Booking[] = [
    {
      id: '1',
      masterId: 'm1',
      salonId: 's1',
      serviceId: 'svc',
      startIso: '2026-05-20T09:00:00',
      endIso: '2026-05-20T10:00:00',
      clientName: 'A',
      status: 'scheduled',
    },
    {
      id: '2',
      masterId: 'm1',
      salonId: 's1',
      serviceId: 'svc',
      startIso: '2026-05-21T09:00:00',
      endIso: '2026-05-21T10:00:00',
      clientName: 'B',
      status: 'scheduled',
    },
    {
      id: '3',
      masterId: 'm1',
      salonId: 's1',
      serviceId: 'svc',
      startIso: '2026-05-20T12:00:00',
      endIso: '2026-05-20T13:00:00',
      clientName: 'C',
      status: 'cancelled',
    },
  ]

  it('filters by master and day and drops cancelled', () => {
    const busy = bookingsToBusyIntervals(bookings, 'm1', day)
    expect(busy).toHaveLength(1)
    expect(busy[0].start.getHours()).toBe(9)
    expect(busy[0].start.getMinutes()).toBe(0)
  })
})
