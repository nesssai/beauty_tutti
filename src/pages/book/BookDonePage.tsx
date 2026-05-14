import { Link, useLocation } from 'react-router-dom'

type DoneState = {
  duplicateToEmail?: boolean
}

export function BookDonePage() {
  const location = useLocation()
  const state = (location.state ?? {}) as DoneState
  const duplicateToEmail = Boolean(state.duplicateToEmail)

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-6 text-center shadow-sm"
        role="status"
      >
        <p className="text-4xl" aria-hidden>
          ✓
        </p>
        <h1 className="mt-3 text-2xl font-bold text-emerald-900">Запись успешно оформлена</h1>
        <p className="mt-3 text-emerald-800">
          Мы зафиксировали ваш визит. Напоминание придёт на указанные контакты. Ждём вас в
          BEAUTY TUTTI.
        </p>
        {duplicateToEmail && (
          <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-100">
            Детали записи также будут продублированы на указанную электронную почту.
          </p>
        )}
      </div>
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 text-center text-sm text-stone-600 shadow-sm">
        Если нужно изменить время, свяжитесь с салоном или оформите новую запись.
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/home"
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
        >
          На главную
        </Link>
        <Link
          to="/book/service"
          className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50"
        >
          Новая запись
        </Link>
      </div>
    </div>
  )
}
