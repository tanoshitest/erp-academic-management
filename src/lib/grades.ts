import type { AcademicState, Course, GradeEntry, Section } from '../types'

export const WEIGHTS = { cc: 0.1, gk: 0.3, ck: 0.6 }

export function finalScore(g?: GradeEntry): number | null {
  if (!g || g.cc == null || g.gk == null || g.ck == null) return null
  return Math.round((g.cc * WEIGHTS.cc + g.gk * WEIGHTS.gk + g.ck * WEIGHTS.ck) * 10) / 10
}

const SCALE: [number, string, number][] = [
  [8.5, 'A', 4],
  [8.0, 'B+', 3.5],
  [7.0, 'B', 3],
  [6.5, 'C+', 2.5],
  [5.5, 'C', 2],
  [5.0, 'D+', 1.5],
  [4.0, 'D', 1],
  [0, 'F', 0],
]

export function letter(score: number | null) {
  if (score == null) return null
  const [, l, p] = SCALE.find(([min]) => score >= min)!
  return { letter: l, point: p, passed: score >= 4 }
}

export interface TranscriptRow {
  section: Section
  course: Course
  grade?: GradeEntry
  total: number | null
}

export function transcriptFor(studentId: string, state: AcademicState): TranscriptRow[] {
  return state.sections
    .filter((s) => s.studentIds.includes(studentId))
    .map((section) => {
      const grade = state.grades[section.id]?.[studentId]
      return {
        section,
        course: state.courses.find((c) => c.code === section.courseCode)!,
        grade,
        total: finalScore(grade),
      }
    })
}

export function gpa(rows: TranscriptRow[]) {
  const graded = rows.filter((r) => r.total != null)
  const credits = graded.reduce((s, r) => s + r.course.credits, 0)
  const points = graded.reduce((s, r) => s + letter(r.total)!.point * r.course.credits, 0)
  const earned = graded.filter((r) => letter(r.total)!.passed).reduce((s, r) => s + r.course.credits, 0)
  return { gpa: credits ? Math.round((points / credits) * 100) / 100 : null, credits, earned }
}
