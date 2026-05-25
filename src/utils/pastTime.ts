import { isBefore, startOfDay } from 'date-fns'

/** День полностью в прошлом. */
export function isPastDay(day: Date, now = new Date()): boolean {
  return isBefore(startOfDay(day), startOfDay(now))
}

/** Слот начинается раньше текущего момента. */
export function isPastSlot(slotStart: Date, now = new Date()): boolean {
  return slotStart.getTime() < now.getTime()
}

/** Фильтр для списка слотов с сервера или локального расчёта. */
export function filterFutureSlots(slots: Date[], now = new Date()): Date[] {
  return slots.filter((s) => !isPastSlot(s, now))
}
