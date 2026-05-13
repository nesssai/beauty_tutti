import type { Service } from '@/types/models'

export const SERVICES: Service[] = [
  {
    id: 'svc_mani',
    name: 'Маникюр классический',
    durationMinutes: 90,
    priceRub: 1800,
  },
  {
    id: 'svc_pedi',
    name: 'Педикюр SPA',
    durationMinutes: 120,
    priceRub: 2600,
  },
  {
    id: 'svc_cut',
    name: 'Стрижка',
    durationMinutes: 60,
    priceRub: 1400,
  },
  {
    id: 'svc_color',
    name: 'Окрашивание',
    durationMinutes: 150,
    priceRub: 5200,
  },
  {
    id: 'svc_brow',
    name: 'Коррекция бровей',
    durationMinutes: 45,
    priceRub: 900,
  },
]
