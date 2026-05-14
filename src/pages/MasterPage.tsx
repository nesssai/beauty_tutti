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

import { useBookingApp } from '@/context/BookingContext'
import { SERVICES } from '@/data/services'
import type { Booking, MasterBlockedInterval } from '@/types/models'
import {
  effectiveVisitStatus,
  statusLabelRu,
} from '@/utils/visitStatus'

const weekDayShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function MasterPage() {
  const {
    masterSession,
    bookings,
    blockedIntervals,
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
      const key = format(d, 'yyyy-MM-dd')
      map.set(key, [])
    }
    for (const b of bookings) {
      if (b.masterId !== masterId) continue
      const start = parseISO(b.startIso)
      const key = format(start, 'yyyy-MM-dd')
      if (!map.has(key)) continue
      map.get(key)!.push(b)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => parseISO(a.startIso).getTime() - parseISO(b.startIso).getTime())
    }
    return map
  }, [bookings, masterId, weekDays])

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

  const addBlock = () => {
    setBlockError(null)
    const day = weekDays[blockDayOffset]
    if (!day) return
    const [sh, sm] = blockStart.split(':').map(Number)
    const [eh, em] = blockEnd.split(':').map(Number)
    const start = setMinutes(setHours(startOfDay(day), sh), sm)
    const end = setMinutes(setHours(startOfDay(day), eh), em)
    const res = addMasterBlockedInterval({ masterId, start, end })
    if (!res.ok) setBlockError(res.error)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Записи на день</h1>
        <p className="mt-1 text-sm text-stone-600">
          Календарь недели: выберите месяц и неделю, управляйте статусами и заметками.
          Статус «Завершён» проставляется автоматически после окончания времени записи.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm hover:bg-stone-50"
            onClick={() => {
              setViewMonth((m) => addMonths(m, -1))
              setWeekIndex(0)
            }}
          >
            ←
          </button>
          <span className="min-w-[10rem] text-center text-sm font-semibold capitalize text-stone-900">
            {format(viewMonth, 'LLLL yyyy', { locale: ru })}
          </span>
          <button
            type="button"
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm hover:bg-stone-50"
            onClick={() => {
              setViewMonth((m) => addMonths(m, 1))
              setWeekIndex(0)
            }}
          >
            →
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {weekStarts.map((ws, i) => {
            const we = addDays(ws, 6)
            const active = i === safeWeekIndex
            return (
              <button
                key={ws.toISOString()}
                type="button"
                onClick={() => setWeekIndex(i)}
                className={[
                  'rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition',
                  active
                    ? 'bg-[var(--accent)] text-white ring-[var(--accent)]'
                    : 'bg-stone-50 text-stone-700 ring-stone-200 hover:bg-stone-100',
                ].join(' ')}
              >
                {format(ws, 'd MMM', { locale: ru })} — {format(we, 'd MMM', { locale: ru })}
              </button>
            )
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-sm">
        <div className="grid min-w-[720px] grid-cols-7 divide-x divide-stone-100">
          {weekDays.map((d, col) => (
            <div key={d.toISOString()} className="bg-[var(--page-bg)]/50 p-2">
              <p className="text-center text-xs font-semibold text-stone-500">
                {weekDayShort[col]}
              </p>
              <p
                className={[
                  'text-center text-sm font-semibold',
                  isSameDay(d, new Date()) ? 'text-[var(--accent-strong)]' : 'text-stone-900',
                ].join(' ')}
              >
                {format(d, 'd MMM', { locale: ru })}
              </p>
              <div className="mt-3 space-y-2">
                {(bookingsByDay.get(format(d, 'yyyy-MM-dd')) ?? []).map((b) => {
                  const service = SERVICES.find((s) => s.id === b.serviceId)
                  const start = parseISO(b.startIso)
                  const end = parseISO(b.endIso)
                  const eff = effectiveVisitStatus(b)
                  const manual =
                    b.status !== 'completed' && eff !== 'completed'

                  return (
                    <div
                      key={b.id}
                      className="rounded-xl border border-stone-200/80 bg-white p-2 text-xs shadow-sm"
                    >
                      <p className="font-medium text-stone-900">
                        {format(start, 'HH:mm')}–{format(end, 'HH:mm')}
                      </p>
                      <p className="text-stone-700">{service?.name}</p>
                      <p className="mt-1 text-stone-600">{b.clientName}</p>
                      <p className="mt-1 text-[10px] uppercase text-stone-500">
                        {statusLabelRu(eff)}
                      </p>
                      {manual ? (
                        <select
                          className="mt-2 w-full rounded border border-stone-200 px-1 py-1 text-[11px]"
                          value={b.status === 'cancelled' ? 'cancelled' : 'scheduled'}
                          onChange={(e) =>
                            updateBookingStatus(
                              b.id,
                              e.target.value as 'scheduled' | 'cancelled',
                            )
                          }
                        >
                          <option value="scheduled">Запланирован</option>
                          <option value="cancelled">Отменён</option>
                        </select>
                      ) : (
                        <p className="mt-2 text-[10px] text-stone-500">
                          Завершён автоматически
                        </p>
                      )}
                      <label className="mt-2 block text-[10px] text-stone-500">
                        Заметка
                        <textarea
                          rows={2}
                          className="mt-0.5 w-full resize-none rounded border border-stone-200 px-1 py-1 text-[11px] text-stone-800"
                          defaultValue={b.masterNote ?? ''}
                          onBlur={(e) =>
                            updateBookingMasterNote(b.id, e.target.value.trim())
                          }
                        />
                      </label>
                    </div>
                  )
                })}
                {(blocksByDay.get(format(d, 'yyyy-MM-dd')) ?? []).map((bl) => {
                  const s = parseISO(bl.startIso)
                  const e = parseISO(bl.endIso)
                  return (
                    <div
                      key={bl.id}
                      className="rounded-xl border border-amber-200/80 bg-amber-50/90 p-2 text-[11px] text-amber-950"
                    >
                      <p className="font-semibold">Недоступно</p>
                      <p>
                        {format(s, 'HH:mm')}–{format(e, 'HH:mm')}
                      </p>
                      <button
                        type="button"
                        className="mt-2 w-full rounded border border-amber-300/80 py-1 text-[10px] font-medium hover:bg-amber-100"
                        onClick={() => removeMasterBlockedInterval(bl.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Добавить недоступное время</h2>
        <p className="mt-1 text-xs text-stone-500">
          Клиенты не смогут записаться на пересекающийся интервал.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-xs text-stone-600">
            День недели (в выбранной неделе)
            <select
              className="mt-1 block rounded-lg border border-stone-200 px-2 py-2 text-sm"
              value={blockDayOffset}
              onChange={(e) => setBlockDayOffset(Number(e.target.value))}
            >
              {weekDays.map((d, i) => (
                <option key={d.toISOString()} value={i}>
                  {weekDayShort[i]} {format(d, 'd.MM', { locale: ru })}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-stone-600">
            С
            <input
              type="time"
              className="mt-1 block rounded-lg border border-stone-200 px-2 py-2 text-sm"
              value={blockStart}
              onChange={(e) => setBlockStart(e.target.value)}
            />
          </label>
          <label className="text-xs text-stone-600">
            До
            <input
              type="time"
              className="mt-1 block rounded-lg border border-stone-200 px-2 py-2 text-sm"
              value={blockEnd}
              onChange={(e) => setBlockEnd(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={addBlock}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            Сохранить
          </button>
        </div>
        {blockError && <p className="mt-2 text-sm text-red-600">{blockError}</p>}
      </section>
    </div>
  )
}
