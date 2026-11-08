import { DEGREE_COEFFICIENT, RATE_PER_PERIOD } from '../data/finances'
import { CURRENT_SEMESTER } from '../data/schedule'
import type { AcademicState, Lecturer } from '../types'

export function studentBalance(studentId: string, state: AcademicState) {
  const invoices = state.invoices.filter((i) => i.studentId === studentId)
  const due = invoices.reduce((s, i) => s + i.amount, 0)
  const paid = state.payments.filter((p) => p.studentId === studentId).reduce((s, p) => s + p.amount, 0)
  return { invoices, due, paid, debt: Math.max(0, due - paid) }
}

export function invoicePaid(invoiceId: string, state: AcademicState) {
  return state.payments.filter((p) => p.invoiceId === invoiceId).reduce((s, p) => s + p.amount, 0)
}

export function lecturerPay(lecturer: Lecturer, state: AcademicState) {
  const coefficient = DEGREE_COEFFICIENT[lecturer.degree]
  const lines = state.sections
    .filter((s) => s.lecturerId === lecturer.id && s.semester === CURRENT_SEMESTER)
    .map((section) => {
      const course = state.courses.find((c) => c.code === section.courseCode)!
      const rate = RATE_PER_PERIOD[course.level]
      return { section, course, rate, amount: section.taughtPeriods * rate * coefficient }
    })
  const periods = lines.reduce((s, l) => s + l.section.taughtPeriods, 0)
  const amount = lines.reduce((s, l) => s + l.amount, 0)
  const payout = state.payouts.find((p) => p.lecturerId === lecturer.id && p.semester === CURRENT_SEMESTER)
  return { coefficient, lines, periods, amount, payout }
}
