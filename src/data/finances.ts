import type { Course, Invoice, Level, Payment, Section, Student } from '../types'
import { CURRENT_SEMESTER, PREVIOUS_SEMESTER } from './schedule'

export const PRICE_PER_CREDIT: Record<Level, number> = { DH: 450_000, THS: 1_200_000, TS: 2_000_000 }
export const ENROLLMENT_FEE: Record<Level, number> = { DH: 8_500_000, THS: 15_000_000, TS: 30_000_000 }

// Teaching rate per period by programme level, multiplied by the lecturer's degree coefficient.
export const RATE_PER_PERIOD: Record<Level, number> = { DH: 250_000, THS: 350_000, TS: 450_000 }
export const DEGREE_COEFFICIENT = { ThS: 1.0, TS: 1.3, 'PGS.TS': 1.5, 'GS.TS': 1.8 } as const

export const COLLECTORS = ['Trương Thị Mai', 'Phòng Kế toán']

function creditsFor(studentId: string, semester: string, sections: Section[], courses: Course[]) {
  return sections
    .filter((s) => s.semester === semester && s.studentIds.includes(studentId))
    .reduce((sum, s) => sum + (courses.find((c) => c.code === s.courseCode)?.credits ?? 0), 0)
}

export function buildFinances(students: Student[], sections: Section[], courses: Course[]) {
  const invoices: Invoice[] = []
  const payments: Payment[] = []
  let receipt = 1
  const nextReceipt = () => `BL${String(receipt++).padStart(5, '0')}`

  students.forEach((st, i) => {
    for (const [semester, due, paidAt] of [
      [PREVIOUS_SEMESTER, '2026-03-15', '2026-03-02'],
      [CURRENT_SEMESTER, '2026-10-31', '2026-10-12'],
    ] as const) {
      const credits = creditsFor(st.id, semester, sections, courses)
      if (!credits) continue
      const invoice: Invoice = {
        id: `HP-${st.id}-${semester === CURRENT_SEMESTER ? '261' : '252'}`,
        studentId: st.id,
        semester,
        title: `Học phí ${semester} (${credits} tín chỉ)`,
        amount: credits * PRICE_PER_CREDIT[st.level],
        dueDate: due,
      }
      invoices.push(invoice)
      // Previous term fully settled; current term mixes paid, partial and unpaid to exercise the debt views.
      const share = semester === PREVIOUS_SEMESTER ? 1 : [1, 0.5, 0, 1, 1, 0.3][i % 6]
      const amount = Math.round((invoice.amount * share) / 1000) * 1000
      if (amount > 0) {
        payments.push({
          id: nextReceipt(),
          studentId: st.id,
          invoiceId: invoice.id,
          amount,
          date: paidAt,
          method: i % 3 === 0 ? 'Tiền mặt' : 'Chuyển khoản',
          collector: COLLECTORS[i % 2],
          note: share < 1 ? 'Nộp một phần' : '',
        })
      }
    }
  })

  return { invoices, payments }
}
