import { Link } from 'react-router-dom'

const features = [
  {
    icon: '◆',
    t: 'Умные слоты',
    d: 'Реальное время и длительность услуги — без накладок в расписании.',
  },
  {
    icon: '✦',
    t: 'Мастера-профи',
    d: 'Каждый специалист работает только в своей зоне услуг.',
  },
  {
    icon: '♡',
    t: 'Первый визит −10%',
    d: 'Персональная скидка для зарегистрированных клиентов.',
  },
]

export function ClientHomePage() {
  return (
    <div className="space-y-16 py-2 animate-fade-in">
      <section className="hero-panel">
        <div className="hero-glow hero-glow-1" aria-hidden />
        <div className="hero-glow hero-glow-2" aria-hidden />
        <div className="hero-glow hero-glow-3" aria-hidden />

        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="relative z-10">
            <p className="brand-pill">
              <span className="brand-pill-dot" aria-hidden />
              BEAUTY TUTTI · Новосибирск
            </p>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl lg:text-[3.25rem]">
              Красота
              <span className="mt-1 block text-gradient-dual">без лишних шагов</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-600">
              Premium онлайн-запись в косметологический кабинет — эстетика ухода,
              проверенные мастера и атмосфера заботы с первого клика.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/book/service" className="btn-primary btn-primary-lg justify-center">
                Записаться онлайн
              </Link>
              <Link
                to="/account"
                className="btn-secondary justify-center px-8 py-4 text-lg"
              >
                Личный кабинет
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm font-medium text-stone-500">
              <span className="flex items-center gap-2">
                <span
                  className="h-1.5 w-8 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-alt)]"
                  aria-hidden
                />
                Косметология
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="h-1.5 w-8 rounded-full bg-gradient-to-r from-[var(--accent-alt)] to-[var(--lavender)]"
                  aria-hidden
                />
                Skincare &amp; уход
              </span>
            </div>
          </div>

          <div className="hero-visual order-first lg:order-none">
            <div className="hero-float-badge">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent-alt-strong)]">
                Premium clinic
              </p>
              <p className="mt-0.5 text-sm font-semibold text-stone-800">Запись открыта</p>
            </div>

            <div className="hero-image-frame">
              <img
                src={`${import.meta.env.BASE_URL}images/hero-beauty.jpg`}
                alt="Эстетичный уход и косметология в салоне BEAUTY TUTTI"
                className="hero-image"
                width={560}
                height={700}
                loading="eager"
                decoding="async"
              />
              <div className="hero-image-overlay" aria-hidden />
              <div className="hero-image-glass">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent-alt-strong)]">
                  Сегодня в салоне
                </p>
                <p className="mt-1 text-lg font-bold text-stone-900">
                  Маникюр · Уход · Брови
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {['Уход', 'Маникюр', 'SPA'].map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-stone-700 ring-1 ring-[var(--accent-alt)]/20"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider-glow" aria-hidden />

      <section className="grid gap-6 sm:grid-cols-3">
        {features.map((x, i) => (
          <div
            key={x.t}
            className="feature-card stagger-item"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="feature-icon-wrap" aria-hidden>
              {x.icon}
            </div>
            <p className="mt-5 text-xl font-bold text-stone-900">{x.t}</p>
            <p className="mt-3 text-base leading-relaxed text-stone-600">{x.d}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-panel-glow card-panel card-panel-alt p-9">
          <span className="text-sm font-bold uppercase tracking-wide text-[var(--accent-alt-strong)]">
            Клиентам
          </span>
          <h2 className="mt-2 text-2xl font-bold text-stone-900">Личный кабинет</h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Управляйте записями: отмена, история, статусы — всё под контролем.
          </p>
          <Link to="/login" className="btn-primary mt-8 inline-flex">
            Войти
          </Link>
        </div>
        <div className="card-panel p-9">
          <span className="text-sm font-bold uppercase tracking-wide text-[var(--lavender)]">
            Специалистам
          </span>
          <h2 className="mt-2 text-2xl font-bold text-stone-900">Кабинет мастера</h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Расписание, записи и заметки к визитам в одном месте.
          </p>
          <Link to="/login" className="btn-secondary mt-8 inline-flex">
            Войти как мастер
          </Link>
        </div>
      </section>
    </div>
  )
}
