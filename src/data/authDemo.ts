/** Учётные данные для MVP (без сервера). */
export const CLIENT_DEMO_EMAIL = 'maria@example.com'
export const CLIENT_DEMO_PASSWORD = 'demo'

/** У каждого мастера свой логин и пароль. */
export const MASTER_CREDENTIALS: Record<
  string,
  { login: string; password: string }
> = {
  m_anna: { login: 'anna', password: 'anna2026' },
  m_irina: { login: 'irina', password: 'irina2026' },
  m_olga: { login: 'olga', password: 'olga2026' },
  m_kate: { login: 'kate', password: 'kate2026' },
}
