import { Link } from 'react-router-dom'

export function ClientHomePage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 py-4">
      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-100">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
          BEAUTY TUTTI
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
          Добро пожаловать
        </h1>
        <p className="mt-3 text-stone-600">
          Запишитесь на услугу в несколько шагов — без звонка администратору.
        </p>
        <div className="mt-8">
          <Link
            to="/book/service"
            className="inline-flex w-full items-center justify-center rounded-xl bg-rose-600 px-6 py-4 text-center text-base font-semibold text-white shadow-md transition hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 sm:w-auto"
          >
            Записаться
          </Link>
        </div>
      </section>
    </div>
  )
}
