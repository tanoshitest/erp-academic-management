import type { AcademicState, Grades, Section } from '../types'
import { SEED_COURSES } from './courses'
import { buildFinances } from './finances'
import { buildSections, PREVIOUS_SEMESTER } from './schedule'
import { SEED_ADMISSIONS, SEED_LECTURERS, SEED_STUDENTS } from './students'

function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967295
}

const score = (key: string, min: number, max: number) => Math.round((min + hash(key) * (max - min)) * 2) / 2

function buildGrades(sections: Section[]): Grades {
  const grades: Grades = {}
  for (const sec of sections) {
    grades[sec.id] = {}
    const done = sec.semester === PREVIOUS_SEMESTER
    sec.studentIds.forEach((id, i) => {
      const weak = id === 'DH23CN003'
      const lo = weak ? 3 : 5.5
      grades[sec.id][id] = {
        cc: score(`${sec.id}${id}cc`, weak ? 5 : 8, 10),
        gk: done || i % 4 !== 3 ? score(`${sec.id}${id}gk`, lo, 9.5) : null,
        ck: done ? score(`${sec.id}${id}ck`, lo, 9.5) : null,
      }
    })
  }
  return grades
}

export function createSeedState(): AcademicState {
  const students = SEED_STUDENTS.map((s) => ({ ...s }))
  const sections = buildSections(students)
  const { invoices, payments } = buildFinances(students, sections, SEED_COURSES)
  return {
    students,
    lecturers: SEED_LECTURERS.map((l) => ({ ...l })),
    courses: SEED_COURSES.map((c) => ({ ...c })),
    sections,
    grades: buildGrades(sections),
    admissions: SEED_ADMISSIONS.map((a) => ({ ...a })),
    invoices,
    payments,
    payouts: [{ lecturerId: 'GV05', semester: 'HK1 2026–2027', amount: 4_000_000, paidAt: '2026-10-30' }],
  }
}
