import { format, getISODay } from 'date-fns'
import { ru } from 'date-fns/locale'

/** Короткое название дня недели: Пн, Вт, … Вс (ISO: понедельник = 1). */
const WD_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

export function formatRuWeekdayShort(d: Date): string {
  return WD_SHORT[getISODay(d) - 1]
}

/** Например: «Вт, 13 мая» */
export function formatRuDayChip(d: Date): string {
  const w = formatRuWeekdayShort(d)
  const rest = format(d, 'd MMM', { locale: ru })
  return `${w}, ${rest}`
}
