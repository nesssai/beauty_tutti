import { Link } from 'react-router-dom'

export function ClientHomePage() {
  return (
    <div className="space-y-8 py-2">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white via-[#fff5f8] to-[#f3e8ff]/90 p-8 shadow-md ring-1 ring-stone-100">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent)]/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-violet-200/40 blur-3xl"
          aria-hidden
        />
        <p className="relative text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">
          BEAUTY TUTTI · Новосибирск
        </p>
        <h1 className="relative mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Красота без лишних шагов
        </h1>
        <p className="relative mt-3 max-w-xl text-stone-600">
          Онлайн-запись к мастерам сети, мягкий интерьер салонов и забота о вашем времени.
        </p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <Link
            to="/book/service"
            className="inline-flex items-center justify-center rounded-2xl bg-[var(--accent)] px-8 py-4 text-center text-base font-semibold text-white shadow-lg shadow-[var(--accent)]/25 transition hover:opacity-95"
          >
            Записаться
          </Link>
          <Link
            to="/account"
            className="inline-flex items-center justify-center rounded-2xl border border-stone-200/90 bg-white/80 px-6 py-4 text-sm font-semibold text-stone-800 backdrop-blur-sm transition hover:bg-white"
          >
            Личный кабинет
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { t: 'Удобные слоты', d: 'Подбор времени с учётом длительности услуги.' },
          { t: 'Проверенные мастера', d: 'Команда с опытом и тёплым приёмом.' },
          { t: 'Скидка первому гостю', d: '10% на первое посещение для зарегистрированных клиентов.' },
        ].map((x) => (
          <div
            key={x.t}
            className="rounded-2xl border border-stone-100 bg-white/90 p-5 shadow-sm ring-1 ring-stone-50"
          >
            <p className="font-semibold text-stone-900">{x.t}</p>
            <p className="mt-2 text-sm text-stone-600">{x.d}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
