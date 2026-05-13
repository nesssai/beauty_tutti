import { Link } from 'react-router-dom'

export function BookDonePage() {
  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm"
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
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-600 shadow-sm">
        Если нужно изменить время, свяжитесь с салоном или оформите новую запись.
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/home"
          className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
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
