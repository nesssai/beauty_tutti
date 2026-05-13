import { describe, expect, it } from 'vitest'
import { setHours, setMinutes, startOfDay } from 'date-fns'
import { getAvailableSlotStarts, intervalsOverlap } from './slots'

function at(day: Date, h: number, m = 0) {
  return setMinutes(setHours(startOfDay(day), h), m)
}

describe('intervalsOverlap', () => {
  const d = new Date('2026-05-13T12:00:00')

  it('returns false for adjacent half-open intervals', () => {
    const a = { start: at(d, 9, 0), end: at(d, 10, 0) }
    const b = { start: at(d, 10, 0), end: at(d, 11, 0) }
    expect(intervalsOverlap(a, b)).toBe(false)
  })

  it('returns true when one interval contains the other', () => {
    const a = { start: at(d, 9, 0), end: at(d, 12, 0) }
    const b = { start: at(d, 10, 0), end: at(d, 11, 0) }
    expect(intervalsOverlap(a, b)).toBe(true)
  })

  it('returns true on partial overlap', () => {
    const a = { start: at(d, 9, 30), end: at(d, 10, 30) }
    const b = { start: at(d, 10, 0), end: at(d, 11, 0) }
    expect(intervalsOverlap(a, b)).toBe(true)
  })
})

describe('getAvailableSlotStarts', () => {
  const day = new Date('2026-05-20T08:00:00')

  it('returns evenly stepped starts when there are no busy intervals', () => {
    const starts = getAvailableSlotStarts({
      day,
      workStartHour: 9,
      workStartMinute: 0,
      workEndHour: 12,
      workEndMinute: 0,
      slotStepMinutes: 30,
      serviceDurationMinutes: 60,
      busyIntervals: [],
    })
    expect(starts.map((t) => t.getHours() + t.getMinutes() / 60)).toEqual([
      9, 9.5, 10, 10.5, 11,
    ])
  })

  it('excludes starts whose service window overlaps a busy interval', () => {
    const busy = [{ start: at(day, 10, 0), end: at(day, 11, 0) }]
    const starts = getAvailableSlotStarts({
      day,
      workStartHour: 9,
      workStartMinute: 0,
      workEndHour: 13,
      workEndMinute: 0,
      slotStepMinutes: 30,
      serviceDurationMinutes: 90,
      busyIntervals: busy,
    })
    // 90m window: 9:00 ends 10:30 (overlaps 10–11); from 11:00 free until work end
    const hours = starts.map((t) => t.getHours() + t.getMinutes() / 60)
    expect(hours).toEqual([11, 11.5])
    expect(hours).not.toContain(9)
    expect(hours).not.toContain(9.5)
    expect(hours).not.toContain(10)
    expect(hours).not.toContain(10.5)
  })

  it('does not return a slot that would end after work end', () => {
    const starts = getAvailableSlotStarts({
      day,
      workStartHour: 9,
      workStartMinute: 0,
      workEndHour: 10,
      workEndMinute: 30,
      slotStepMinutes: 15,
      serviceDurationMinutes: 60,
      busyIntervals: [],
    })
    const last = starts[starts.length - 1]
    expect(last.getHours()).toBe(9)
    expect(last.getMinutes()).toBe(30)
  })
})
