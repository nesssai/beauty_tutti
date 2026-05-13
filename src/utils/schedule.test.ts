import { describe, expect, it } from 'vitest'
import { bookingOverlapsExisting } from './schedule'
import type { Booking } from '@/types/models'

describe('bookingOverlapsExisting', () => {
  const base: Booking = {
    id: 'x',
    masterId: 'm1',
    salonId: 's1',
    serviceId: 'svc',
    startIso: '2026-05-20T10:00:00',
    endIso: '2026-05-20T11:00:00',
    clientName: 'A',
    status: 'scheduled',
  }

  it('returns false when no overlap', () => {
    const hit = bookingOverlapsExisting(
      { start: new Date('2026-05-20T08:00:00'), end: new Date('2026-05-20T09:00:00') },
      [base],
      'm1',
    )
    expect(hit).toBe(false)
  })

  it('returns true on overlap', () => {
    const hit = bookingOverlapsExisting(
      { start: new Date('2026-05-20T10:30:00'), end: new Date('2026-05-20T11:30:00') },
      [base],
      'm1',
    )
    expect(hit).toBe(true)
  })

  it('ignores cancelled bookings', () => {
    const cancelled = { ...base, id: 'c', status: 'cancelled' as const }
    const hit = bookingOverlapsExisting(
      { start: new Date('2026-05-20T10:30:00'), end: new Date('2026-05-20T11:30:00') },
      [cancelled],
      'm1',
    )
    expect(hit).toBe(false)
  })
})
