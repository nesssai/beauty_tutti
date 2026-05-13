import { addDays, setHours, setMinutes, startOfDay } from 'date-fns'

import type { Booking } from '@/types/models'

function at(day: Date, hour: number, minute: number) {
  const d = setMinutes(setHours(startOfDay(day), hour), minute)
  return d.toISOString()
}

/** Динамические даты относительно «сегодня», чтобы MVP было наглядным в любой день. */
export function buildInitialBookings(now = new Date()): Booking[] {
  const d1 = startOfDay(addDays(now, 1))
  const d2 = startOfDay(addDays(now, 2))

  return [
    {
      id: 'b_seed_1',
      masterId: 'm_anna',
      salonId: 'sal_center',
      serviceId: 'svc_mani',
      startIso: at(d1, 10, 0),
      endIso: at(d1, 11, 30),
      clientName: 'Елена С.',
      clientPhone: '+7 900 000-00-01',
      status: 'scheduled',
    },
    {
      id: 'b_seed_2',
      masterId: 'm_anna',
      salonId: 'sal_center',
      serviceId: 'svc_pedi',
      startIso: at(d1, 14, 0),
      endIso: at(d1, 16, 0),
      clientName: 'Олег П.',
      status: 'scheduled',
    },
    {
      id: 'b_seed_3',
      masterId: 'm_olga',
      salonId: 'sal_south',
      serviceId: 'svc_cut',
      startIso: at(d2, 11, 0),
      endIso: at(d2, 12, 0),
      clientName: 'Дарья К.',
      status: 'scheduled',
      userId: 'u_maria',
    },
  ]
}
