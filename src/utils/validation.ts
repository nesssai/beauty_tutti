/** Локальная валидация для MVP (без сервера). */

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/** Имя/ФИО: буквы (в т.ч. кириллица), пробелы, дефис, апостроф. */
const PERSON_NAME_RE = /^[\p{L}\s\-']{2,80}$/u

export function isValidEmail(value: string): boolean {
  const v = value.trim()
  if (v.length < 5 || v.length > 254) return false
  return EMAIL_RE.test(v)
}

export function isValidPersonName(value: string): boolean {
  const v = value.trim()
  return PERSON_NAME_RE.test(v)
}

/** Только цифры после +7 для российского мобильного (10 цифр). */
export function isCompleteRuMobile(value: string): boolean {
  return /^\+7\d{10}$/.test(value.trim())
}

/** Из ввода оставляем только цифры, ограничиваем 10 цифрами национальной части. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** Нормализованный номер +7 и ровно 10 следующих цифр. */
export function normalizeRuPhoneFromDigits(digits: string): string {
  let d = digitsOnly(digits)
  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (d.startsWith('7')) d = d.slice(1)
  d = d.slice(0, 10)
  return `+7${d}`
}

/** Отображение с пробелами; длина фиксирована при полном номере: +7 XXX XXX XX XX */
export function formatRuPhoneDisplay(normalized: string): string {
  const base = normalized.startsWith('+7')
    ? normalized
    : normalizeRuPhoneFromDigits(normalized)
  const rest = base.slice(2)
  if (rest.length === 0) return '+7'
  const a = rest.slice(0, 3)
  const b = rest.slice(3, 6)
  const c = rest.slice(6, 8)
  const e = rest.slice(8, 10)
  const parts = ['+7']
  if (a) parts.push(' ', a)
  if (b) parts.push(' ', b)
  if (c) parts.push(' ', c)
  if (e) parts.push(' ', e)
  return parts.join('')
}

export function parseRuPhoneInputToNormalized(displayValue: string): string {
  const d = digitsOnly(displayValue)
  let national = d
  if (national.startsWith('8')) national = national.slice(1)
  if (national.startsWith('7')) national = national.slice(1)
  national = national.slice(0, 10)
  return `+7${national}`
}

export function isValidLoginId(value: string): boolean {
  const v = value.trim()
  return /^[a-zA-Z0-9._-]{2,32}$/.test(v)
}

export function isValidPassword(value: string): boolean {
  return value.length >= 4 && value.length <= 128
}
