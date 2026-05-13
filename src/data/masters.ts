import type { Master } from '@/types/models'

export const MASTERS: Master[] = [
  {
    id: 'm_anna',
    name: 'Анна',
    salonId: 'sal_center',
    serviceIds: ['svc_mani', 'svc_pedi', 'svc_brow'],
  },
  {
    id: 'm_irina',
    name: 'Ирина',
    salonId: 'sal_center',
    serviceIds: ['svc_cut', 'svc_color'],
  },
  {
    id: 'm_olga',
    name: 'Ольга',
    salonId: 'sal_south',
    serviceIds: ['svc_mani', 'svc_cut', 'svc_brow'],
  },
  {
    id: 'm_kate',
    name: 'Екатерина',
    salonId: 'sal_south',
    serviceIds: ['svc_pedi', 'svc_color'],
  },
]
