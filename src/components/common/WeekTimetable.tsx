import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DAYS, PERIOD_TIMES, SEMESTER_START, SEMESTER_WEEKS, SESSIONS } from '../../data/schedule'
import { todayIso } from '../../lib/format'
import type { Course, Section } from '../../types'
import { Button } from '../ui/Button'

const PALETTE = [
  'border-l-navy-800 bg-navy-50',
  'border-l-blue-600 bg-blue-50',
  'border-l-teal-600 bg-teal-50',
  'border-l-amber-500 bg-amber-50',
  'border-l-violet-500 bg-violet-50',
  'border-l-rose-500 bg-rose-50',
]

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const dm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

function currentWeek() {
  const diff = (new Date(`${todayIso()}T00:00:00`).getTime() - new Date(`${SEMESTER_START}T00:00:00`).getTime()) / 86_400_000
  return Math.min(Math.max(Math.floor(diff / 7) + 1, 1), SEMESTER_WEEKS)
}

interface Props {
  sections: Section[]
  courses: Course[]
  caption: (section: Section) => string
}

export function WeekTimetable({ sections, courses, caption }: Props) {
  const [week, setWeek] = useState(currentWeek)
  const monday = addDays(SEMESTER_START, (week - 1) * 7)
  const today = todayIso()

  const colorOf = useMemo(() => {
    const map = new Map(sections.map((s, i) => [s.id, PALETTE[i % PALETTE.length]]))
    return (id: string) => map.get(id) ?? PALETTE[0]
  }, [sections])

  const totalPeriods = sections.reduce((s, sec) => s + sec.slots.reduce((a, b) => a + b.periods, 0), 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setWeek((w) => Math.max(1, w - 1))} disabled={week === 1} aria-label="Tuần trước">
            <ChevronLeft size={16} />
          </Button>
          <div className="min-w-[190px] text-center text-sm font-semibold text-navy-800">
            Tuần {week}/{SEMESTER_WEEKS} · {dm(monday)} – {dm(addDays(monday, 6))}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setWeek((w) => Math.min(SEMESTER_WEEKS, w + 1))} disabled={week === SEMESTER_WEEKS} aria-label="Tuần sau">
            <ChevronRight size={16} />
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          {sections.length} lớp học phần · {totalPeriods} tiết/tuần
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] table-fixed border-collapse">
          <thead>
            <tr>
              <th className="th w-20 border-r">Buổi</th>
              {DAYS.map((d, i) => {
                const iso = addDays(monday, i)
                return (
                  <th key={d.day} className={`th border-r text-center last:border-r-0 ${iso === today ? 'bg-navy-800 text-white' : ''}`}>
                    <div>{d.label}</div>
                    <div className={`mt-0.5 font-normal normal-case ${iso === today ? 'text-navy-100' : 'text-slate-400'}`}>{dm(iso)}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {SESSIONS.map((ses) => (
              <tr key={ses.key}>
                <td className="border-b border-r border-slate-200 bg-slate-50 px-2 py-3 text-center align-middle">
                  <div className="text-sm font-semibold text-slate-700">{ses.label}</div>
                  <div className="text-[11px] text-slate-400">
                    Tiết {ses.from}–{ses.to}
                  </div>
                </td>
                {DAYS.map((d) => {
                  const items = sections
                    .flatMap((sec) => sec.slots.filter((sl) => sl.day === d.day && sl.start >= ses.from && sl.start <= ses.to).map((sl) => ({ sec, sl })))
                    .sort((a, b) => a.sl.start - b.sl.start)
                  return (
                    <td key={d.day} className="h-[104px] border-b border-r border-slate-200 p-1.5 align-top last:border-r-0">
                      <div className="space-y-1.5">
                        {items.map(({ sec, sl }) => {
                          const course = courses.find((c) => c.code === sec.courseCode)
                          return (
                            <div key={`${sec.id}-${sl.day}-${sl.start}`} className={`rounded border-l-4 px-2 py-1.5 ${colorOf(sec.id)}`} title={`${course?.name} · ${caption(sec)}`}>
                              <p className="truncate text-xs font-semibold text-slate-800">{course?.name}</p>
                              <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-600">
                                <MapPin size={11} className="shrink-0" />
                                {sl.room} · Tiết {sl.start}–{sl.start + sl.periods - 1}
                              </p>
                              <p className="truncate text-[11px] text-slate-500">
                                {PERIOD_TIMES[sl.start]} · {sl.periods} tiết · {caption(sec)}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
