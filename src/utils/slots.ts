import { addMinutes, setHours, setMinutes, startOfDay } from 'date-fns'

export type TimeInterval = { start: Date; end: Date }

/** Half-open intervals [start, end). */
export function intervalsOverlap(a: TimeInterval, b: TimeInterval): boolean {
  return a.start < b.end && b.start < a.end
}

export type SlotGenerationParams = {
  day: Date
  workStartHour: number
  workStartMinute: number
  workEndHour: number
  workEndMinute: number
  slotStepMinutes: number
  serviceDurationMinutes: number
  busyIntervals: TimeInterval[]
}

function workBounds(
  day: Date,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
) {
  const d0 = startOfDay(day)
  return {
    workStart: setMinutes(setHours(d0, startHour), startMinute),
    workEnd: setMinutes(setHours(d0, endHour), endMinute),
  }
}

export function getAvailableSlotStarts(p: SlotGenerationParams): Date[] {
  const { workStart, workEnd } = workBounds(
    p.day,
    p.workStartHour,
    p.workStartMinute,
    p.workEndHour,
    p.workEndMinute,
  )
  const result: Date[] = []
  let cursor = workStart
  const step = p.slotStepMinutes
  const duration = p.serviceDurationMinutes

  while (cursor < workEnd) {
    const slotEnd = addMinutes(cursor, duration)
    if (slotEnd > workEnd) break

    const candidate: TimeInterval = { start: cursor, end: slotEnd }
    const clashes = p.busyIntervals.some((b) => intervalsOverlap(candidate, b))
    if (!clashes) result.push(cursor)

    cursor = addMinutes(cursor, step)
  }

  return result
}
