import { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  eachWeekOfInterval,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import { ru } from 'date-fns/locale'

import { MasterBookingCard } from '@/components/master/MasterBookingCard'
import { MasterEmptyState } from '@/components/master/MasterEmptyState'
import { MasterStatCard } from '@/components/master/MasterStatCard'
import { useBookingApp } from '@/context/BookingContext'
import type { Booking, MasterBlockedInterval } from '@/types/models'
import { effectiveVisitStatus } from '@/utils/visitStatus'

const weekDayShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function MasterPage() {
  const {
    masterSession,
    bookings,
    blockedIntervals,
    catalog,
    updateBookingStatus,
    updateBookingMasterNote,
    addMasterBlockedInterval,
    removeMasterBlockedInterval,
  } = useBookingApp()

  const masterId = masterSession?.masterId
  if (!masterId) return null

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()))
  const [weekIndex, setWeekIndex] = useState(0)
  const [blockDayOffset, setBlockDayOffset] = useState(0)
  const [blockStart, setBlockStart] = useState('12:00')
  const [blockEnd, setBlockEnd] = useState('13:00')
  const [blockError, setBlockError] = useState<string | null>(null)

  const masterBookings = useMemo(
    () => bookings.filter((b) => b.masterId === masterId),
    [bookings, masterId],
  )

  const stats = useMemo(() => {
    const now = new Date()
    const today = startOfDay(now)
    let todayCount = 0
    let active = 0
    let completed = 0
    let cancelled = 0
    const upcomingClients: string[] = []

    for (const b of masterBookings) {
      const eff = effectiveVisitStatus(b, now)
      const start = parseISO(b.startIso)
      if (isSameDay(start, today)) todayCount++
      if (eff === 'scheduled') {
        active++
        if (start > now && upcomingClients.length < 5) {
          upcomingClients.push(b.clientName)
        }
      }
      if (eff === 'completed') completed++
      if (eff === 'cancelled') cancelled++
    }

    return { todayCount, active, completed, cancelled, upcomingClients }
  }, [masterBookings])

  const weekStarts = useMemo(() => {
    const start = startOfMonth(viewMonth)
    const end = endOfMonth(viewMonth)
    return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 })
  }, [viewMonth])

  const safeWeekIndex = Math.min(weekIndex, Math.max(0, weekStarts.length - 1))
  const weekStart = weekStarts[safeWeekIndex] ?? startOfMonth(viewMonth)
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const d of weekDays) {
      map.set(format(d, 'yyyy-MM-dd'), [])
    }
    for (const b of masterBookings) {
      const start = parseISO(b.startIso)
      const key = format(start, 'yyyy-MM-dd')
      if (!map.has(key)) continue
      map.get(key)!.push(b)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => parseISO(a.startIso).getTime() - parseISO(b.startIso).getTime())
    }
    return map
  }, [masterBookings, weekDays])

  const blocksByDay = useMemo(() => {
    const map = new Map<string, MasterBlockedInterval[]>()
    for (const d of weekDays) {
      map.set(format(d, 'yyyy-MM-dd'), [])
    }
    for (const bl of blockedIntervals) {
      if (bl.masterId !== masterId) continue
      const start = parseISO(bl.startIso)
      const key = format(start, 'yyyy-MM-dd')
      if (!map.has(key)) continue
      map.get(key)!.push(bl)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => parseISO(a.startIso).getTime() - parseISO(b.startIso).getTime())
    }
    return map
  }, [blockedIntervals, masterId, weekDays])

  const weekHasAny = useMemo(() => {
    for (const d of weekDays) {
      const key = format(d, 'yyyy-MM-dd')
      if ((bookingsByDay.get(key)?.length ?? 0) > 0) return true
      if ((blocksByDay.get(key)?.length ?? 0) > 0) return true
    }
    return false
  }, [weekDays, bookingsByDay, blocksByDay])

  const addBlock = async () => {
    setBlockError(null)
    const day = weekDays[blockDayOffset]
    if (!day) return
    const [sh, sm] = blockStart.split(':').map(Number)
    const [eh, em] = blockEnd.split(':').map(Number)
    const start = setMinutes(setHours(startOfDay(day), sh), sm)
    const end = setMinutes(setHours(startOfDay(day), eh), em)
    const res = await addMasterBlockedInterval({ masterId, start, end })
    if (!res.ok) setBlockError(res.error)
  }

  const salonName =
    catalog.salons.find(
      (s) => s.id === catalog.masters.find((m) => m.id === masterId)?.salonId,
    )?.name ?? ''

  return (
    <div className="master-dashboard space-y-10 animate-fade-in">
      <header className="dashboard-hero master-welcome relative overflow-hidden p-8 sm:p-10">
        <div className="hero-glow hero-glow-1" aria-hidden />
        <div className="hero-glow hero-glow-3" aria-hidden />
        <div className="relative">
          <p className="brand-pill">
            <span className="brand-pill-dot" aria-hidden />
            Рабочий кабинет
          </p>
          <h1 className="page-title mt-4">
            Здравствуйте, {masterSession?.name ?? 'Мастер'}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-stone-600">
            {salonName
              ? `${salonName} · `
              : ''}
            Управляйте расписанием, статусами визитов и недоступным временем в едином
            стиле с клиентским сервисом.
          </p>
        </div>
      </header>

      <section>
        <div className="section-head">
          <h2 className="page-subtitle">Обзор</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MasterStatCard
            icon="◷"
            label="Записей сегодня"
            value={stats.todayCount}
            accent="rose"
          />
          <MasterStatCard
            icon="✦"
            label="Активные записи"
            value={stats.active}
            accent="gold"
          />
          <MasterStatCard
            icon="✓"
            label="Завершённые"
            value={stats.completed}
            accent="emerald"
          />
          <MasterStatCard
            icon="○"
            label="Отменённые"
            value={stats.cancelled}
            accent="slate"
          />
        </div>
        {stats.upcomingClients.length > 0 && (
          <div className="card-panel mt-5 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent-alt-strong)]">
              Ближайшие клиенты
            </p>
            <p className="mt-2 text-base text-stone-700">
              {stats.upcomingClients.join(' · ')}
            </p>
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2 className="page-subtitle">Расписание на неделю</h2>
          <span className="section-pill">{stats.active} активных</span>
        </div>

        <div className="master-calendar-nav card-panel card-panel-glow mt-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="master-nav-btn"
                aria-label="Предыдущий месяц"
                onClick={() => {
                  setViewMonth((m) => addMonths(m, -1))
                  setWeekIndex(0)
                }}
              >
                ←
              </button>
              <span className="min-w-[11rem] text-center text-lg font-bold capitalize text-stone-900">
                {format(viewMonth, 'LLLL yyyy', { locale: ru })}
              </span>
              <button
                type="button"
                className="master-nav-btn"
                aria-label="Следующий месяц"
                onClick={() => {
                  setViewMonth((m) => addMonths(m, 1))
                  setWeekIndex(0)
                }}
              >
                →
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {weekStarts.map((ws, i) => {
              const we = addDays(ws, 6)
              const active = i === safeWeekIndex
              return (
                <button
                  key={ws.toISOString()}
                  type="button"
                  onClick={() => setWeekIndex(i)}
                  className={['master-week-chip', active ? 'master-week-chip-active' : ''].join(
                    ' ',
                  )}
                >
                  {format(ws, 'd MMM', { locale: ru })} — {format(we, 'd MMM', { locale: ru })}
                </button>
              )
            })}
          </div>
        </div>

        {!weekHasAny && masterBookings.length === 0 ? (
          <div className="card-panel mt-6 p-10">
            <MasterEmptyState
              icon="📅"
              title="Пока нет записей"
              description="Когда клиенты запишутся к вам, визиты появятся в календаре недели. Можно заранее закрыть слоты в блоке ниже."
            />
          </div>
        ) : (
          <div className="master-calendar-scroll mt-6">
            <div className="master-calendar-grid">
              {weekDays.map((d, col) => {
                const key = format(d, 'yyyy-MM-dd')
                const dayBookings = bookingsByDay.get(key) ?? []
                const dayBlocks = blocksByDay.get(key) ?? []
                const isToday = isSameDay(d, new Date())

                return (
                  <div
                    key={d.toISOString()}
                    className={['master-day-column', isToday ? 'master-day-today' : ''].join(
                      ' ',
                    )}
                  >
                    <div className="master-day-header">
                      <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
                        {weekDayShort[col]}
                      </span>
                      <span
                        className={[
                          'text-base font-bold',
                          isToday ? 'text-[var(--accent-strong)]' : 'text-stone-900',
                        ].join(' ')}
                      >
                        {format(d, 'd MMM', { locale: ru })}
                      </span>
                    </div>
                    <div className="master-day-body">
                      {dayBookings.length === 0 && dayBlocks.length === 0 ? (
                        <MasterEmptyState
                          compact
                          icon="·"
                          title="Свободно"
                          description="Нет визитов"
                        />
                      ) : (
                        <>
                          {dayBookings.map((b) => (
                            <MasterBookingCard
                              key={b.id}
                              booking={b}
                              service={catalog.services.find((s) => s.id === b.serviceId)}
                              onStatusChange={(id, status) =>
                                void updateBookingStatus(id, status)
                              }
                              onNoteBlur={(id, note) =>
                                void updateBookingMasterNote(id, note)
                              }
                            />
                          ))}
                          {dayBlocks.map((bl) => {
                            const s = parseISO(bl.startIso)
                            const e = parseISO(bl.endIso)
                            return (
                              <div key={bl.id} className="master-block-card">
                                <p className="text-xs font-bold uppercase tracking-wide text-amber-900/80">
                                  Недоступно
                                </p>
                                <p className="mt-1 text-sm font-semibold text-amber-950">
                                  {format(s, 'HH:mm')} — {format(e, 'HH:mm')}
                                </p>
                                <button
                                  type="button"
                                  className="btn-danger-outline mt-3 w-full text-xs"
                                  onClick={() => void removeMasterBlockedInterval(bl.id)}
                                >
                                  Удалить блок
                                </button>
                              </div>
                            )
                          })}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      <section className="card-panel card-panel-alt p-7 sm:p-8">
        <h2 className="text-xl font-bold text-stone-900">Закрыть время для записи</h2>
        <p className="mt-2 text-base text-stone-600">
          Клиенты не смогут выбрать пересекающийся интервал в онлайн-записи.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <label className="master-field-label block">
            День (текущая неделя)
            <select
              className="master-select mt-2 w-full"
              value={blockDayOffset}
              onChange={(e) => setBlockDayOffset(Number(e.target.value))}
            >
              {weekDays.map((d, i) => (
                <option key={d.toISOString()} value={i}>
                  {weekDayShort[i]} {format(d, 'd MMM', { locale: ru })}
                </option>
              ))}
            </select>
          </label>
          <label className="master-field-label block">
            С
            <input
              type="time"
              className="input-field mt-2"
              value={blockStart}
              onChange={(e) => setBlockStart(e.target.value)}
            />
          </label>
          <label className="master-field-label block">
            До
            <input
              type="time"
              className="input-field mt-2"
              value={blockEnd}
              onChange={(e) => setBlockEnd(e.target.value)}
            />
          </label>
          <button type="button" onClick={() => void addBlock()} className="btn-primary w-full">
            Сохранить блок
          </button>
        </div>
        {blockError && (
          <p className="mt-4 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800">
            {blockError}
          </p>
        )}
      </section>
    </div>
  )
}
