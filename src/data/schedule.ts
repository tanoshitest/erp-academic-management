import type { Section, Slot, Student } from '../types'

export const CURRENT_SEMESTER = 'HK1 2026–2027'
export const PREVIOUS_SEMESTER = 'HK2 2025–2026'
export const SEMESTER_START = '2026-09-07'
export const SEMESTER_WEEKS = 15

export const PERIOD_TIMES: Record<number, string> = {
  1: '07:00', 2: '07:50', 3: '08:40', 4: '09:40', 5: '10:30',
  6: '13:00', 7: '13:50', 8: '14:40', 9: '15:40', 10: '16:30',
  11: '18:00', 12: '18:50', 13: '19:40',
}

export const SESSIONS = [
  { key: 'sang', label: 'Sáng', from: 1, to: 5 },
  { key: 'chieu', label: 'Chiều', from: 6, to: 10 },
  { key: 'toi', label: 'Tối', from: 11, to: 13 },
] as const

export const DAYS = [
  { day: 2, label: 'Thứ 2' },
  { day: 3, label: 'Thứ 3' },
  { day: 4, label: 'Thứ 4' },
  { day: 5, label: 'Thứ 5' },
  { day: 6, label: 'Thứ 6' },
  { day: 7, label: 'Thứ 7' },
  { day: 8, label: 'Chủ nhật' },
]

export const dayLabel = (d: number) => DAYS.find((x) => x.day === d)?.label ?? ''

type Pick = (s: Student) => boolean
type SectionSeed = [string, string, string, string, Pick, Slot[], number, number]

const dh = (major: Student['major']): Pick => (s) => s.level === 'DH' && s.major === major
const ths = (major: Student['major']): Pick => (s) => s.level === 'THS' && s.major === major
const any = (...picks: Pick[]): Pick => (s) => picks.some((p) => p(s))
const active: Pick = (s) => s.status !== 'Bảo lưu'

const seeds: SectionSeed[] = [
  ['CN305.01', 'CN305', 'GV01', CURRENT_SEMESTER, dh('CNTT'), [{ day: 2, start: 1, periods: 3, room: 'A2-301' }], 45, 27],
  ['CN410.01', 'CN410', 'GV01', CURRENT_SEMESTER, dh('CNTT'), [{ day: 4, start: 6, periods: 3, room: 'A2-305' }, { day: 6, start: 1, periods: 2, room: 'LAB-02' }], 45, 30],
  ['CN601.01', 'CN601', 'GV01', CURRENT_SEMESTER, ths('CNTT'), [{ day: 3, start: 11, periods: 3, room: 'B1-201' }], 45, 24],
  ['QT305.01', 'QT305', 'GV02', CURRENT_SEMESTER, dh('QTKD'), [{ day: 3, start: 1, periods: 3, room: 'C1-102' }], 45, 27],
  ['QT601.01', 'QT601', 'GV06', CURRENT_SEMESTER, ths('QTKD'), [{ day: 5, start: 11, periods: 3, room: 'B1-203' }], 45, 21],
  ['QT801.01', 'QT801', 'GV06', CURRENT_SEMESTER, (s) => s.level === 'TS', [{ day: 7, start: 1, periods: 4, room: 'B2-401' }], 60, 32],
  ['KT202.01', 'KT202', 'GV03', CURRENT_SEMESTER, any(dh('KT'), dh('QTKD'), dh('CNTT')), [{ day: 5, start: 1, periods: 3, room: 'C2-201' }], 45, 27],
  ['KT602.01', 'KT602', 'GV03', CURRENT_SEMESTER, ths('KT'), [{ day: 4, start: 11, periods: 3, room: 'B1-205' }], 45, 21],
  ['LK210.01', 'LK210', 'GV04', CURRENT_SEMESTER, any(dh('LKT'), dh('CNTT')), [{ day: 6, start: 6, periods: 2, room: 'C3-104' }], 30, 18],
  ['NA101.02', 'NA101', 'GV05', CURRENT_SEMESTER, dh('NNA'), [{ day: 2, start: 6, periods: 2, room: 'D1-301' }], 30, 16],
  ['CN201.01', 'CN201', 'GV01', PREVIOUS_SEMESTER, dh('CNTT'), [{ day: 3, start: 1, periods: 3, room: 'A2-301' }], 45, 45],
  ['QT201.01', 'QT201', 'GV02', PREVIOUS_SEMESTER, any(dh('QTKD'), dh('CNTT')), [{ day: 5, start: 6, periods: 3, room: 'C1-102' }], 45, 45],
  ['NA101.01', 'NA101', 'GV05', PREVIOUS_SEMESTER, (s) => s.level === 'DH', [{ day: 6, start: 1, periods: 2, room: 'D1-301' }], 30, 30],
]

export function buildSections(students: Student[]): Section[] {
  return seeds.map(([code, courseCode, lecturerId, semester, pick, slots, plannedPeriods, taughtPeriods]) => ({
    id: code,
    code,
    courseCode,
    lecturerId,
    semester,
    studentIds: students.filter((s) => pick(s) && (semester !== CURRENT_SEMESTER || active(s))).map((s) => s.id),
    slots,
    plannedPeriods,
    taughtPeriods,
  }))
}
