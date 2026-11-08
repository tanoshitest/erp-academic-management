import { Download, TrendingUp } from 'lucide-react'
import { Toolbar } from '../../components/common/Controls'
import { StatCard, StatGrid } from '../../components/common/StatCard'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, TableWrap } from '../../components/ui/Card'
import { useAcademic } from '../../context/AcademicContext'
import { CURRENT_SEMESTER } from '../../data/schedule'
import { DEGREE_COEFFICIENT, RATE_PER_PERIOD } from '../../data/finances'
import { MAJORS } from '../../data/students'
import { studentBalance } from '../../lib/finance'
import { money, todayIso } from '../../lib/format'
import type { AcademicState } from '../../types'

interface Row {
  name: string
  students: number
  due: number
  collected: number
  debt: number
  pay: number
  paidOut: number
}

function sectionPay(state: AcademicState, sec: AcademicState['sections'][number]) {
  const course = state.courses.find((c) => c.code === sec.courseCode)!
  const lec = state.lecturers.find((l) => l.id === sec.lecturerId)!
  return sec.taughtPeriods * RATE_PER_PERIOD[course.level] * DEGREE_COEFFICIENT[lec.degree]
}

function buildRows(state: AcademicState): Row[] {
  return MAJORS.map((m) => {
    const students = state.students.filter((s) => s.major === m.code)
    const balances = students.map((s) => studentBalance(s.id, state))
    const due = balances.reduce((s, b) => s + b.due, 0)
    const collected = balances.reduce((s, b) => s + b.paid, 0)
    const current = state.sections.filter((sec) => sec.semester === CURRENT_SEMESTER)
    const sections = current.filter((sec) => state.courses.find((c) => c.code === sec.courseCode)?.major === m.code)
    const pay = sections.reduce((s, sec) => s + sectionPay(state, sec), 0)
    // A lecturer's payout spans several majors; split it by each section's share of their teaching pay.
    const paidOut = state.payouts
      .filter((p) => p.semester === CURRENT_SEMESTER)
      .reduce((s, p) => {
        const owns = current.filter((sec) => sec.lecturerId === p.lecturerId)
        const total = owns.reduce((acc, sec) => acc + sectionPay(state, sec), 0)
        const mine = owns.filter((sec) => state.courses.find((c) => c.code === sec.courseCode)?.major === m.code).reduce((acc, sec) => acc + sectionPay(state, sec), 0)
        return s + (total ? p.amount * (mine / total) : 0)
      }, 0)
    return { name: m.name, students: students.length, due, collected, debt: due - collected, pay, paidOut }
  })
}

const csvCell = (v: string | number) => (typeof v === 'number' ? v : `"${v.replace(/"/g, '""')}"`)

export function Reports() {
  const { state } = useAcademic()
  const rows = buildRows(state)
  const t = rows.reduce(
    (a, r) => ({
      students: a.students + r.students,
      due: a.due + r.due,
      collected: a.collected + r.collected,
      debt: a.debt + r.debt,
      pay: a.pay + r.pay,
      paidOut: a.paidOut + r.paidOut,
    }),
    { students: 0, due: 0, collected: 0, debt: 0, pay: 0, paidOut: 0 },
  )
  const maxCollected = Math.max(...rows.map((r) => r.collected), 1)

  const exportCsv = () => {
    const head = ['Ngành', 'Học viên', 'Phải thu (VND)', 'Đã thu (VND)', 'Còn nợ (VND)', 'Thù lao phát sinh (VND)', 'Đã chi thù lao (VND)', 'Chênh lệch thu chi (VND)']
    const lines = [
      head.map(csvCell).join(','),
      ...rows.map((r) => [r.name, r.students, r.due, r.collected, r.debt, Math.round(r.pay), Math.round(r.paidOut), r.collected - Math.round(r.paidOut)].map(csvCell).join(',')),
      ['Tổng cộng', t.students, t.due, t.collected, t.debt, Math.round(t.pay), Math.round(t.paidOut), t.collected - Math.round(t.paidOut)].map(csvCell).join(','),
    ]
    const blob = new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `bao-cao-thu-chi-${todayIso()}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      <Toolbar
        right={
          <Button variant="secondary" onClick={exportCsv}>
            <Download size={15} /> Xuất Excel (CSV)
          </Button>
        }
      />
      <StatGrid>
        <StatCard icon={TrendingUp} label="Đã thu học phí" value={money(t.collected)} sub={`Trên ${money(t.due)} phải thu`} />
        <StatCard icon={TrendingUp} accent="red" label="Học phí còn nợ" value={money(t.debt)} sub={`${state.students.length} học viên`} />
        <StatCard icon={TrendingUp} accent="amber" label="Thù lao phát sinh" value={money(t.pay)} sub={`Đã chi ${money(t.paidOut)}`} />
        <StatCard icon={TrendingUp} accent="teal" label="Chênh lệch thu – chi" value={money(t.collected - t.paidOut)} sub="Học phí đã thu trừ thù lao đã chi" />
      </StatGrid>

      <Card>
        <CardHeader title="Thu chi theo ngành học" subtitle={`Học phí: toàn bộ khoản thu · Thù lao: tiết thực dạy ${CURRENT_SEMESTER}`} />
        <TableWrap>
          <thead>
            <tr>
              <th className="th">Ngành học</th>
              <th className="th text-right">Học viên</th>
              <th className="th text-right">Phải thu</th>
              <th className="th text-right">Đã thu</th>
              <th className="th text-right">Còn nợ</th>
              <th className="th text-right">Thù lao phát sinh</th>
              <th className="th text-right">Đã chi thù lao</th>
              <th className="th text-right">Chênh lệch thu – chi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-slate-50">
                <td className="td font-medium text-navy-800">{r.name}</td>
                <td className="td text-right">{r.students}</td>
                <td className="td text-right">{money(r.due)}</td>
                <td className="td text-right">{money(r.collected)}</td>
                <td className="td text-right text-red-600">{money(r.debt)}</td>
                <td className="td text-right">{money(r.pay)}</td>
                <td className="td text-right">{money(r.paidOut)}</td>
                <td className="td text-right font-semibold">{money(r.collected - r.paidOut)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 text-sm font-semibold">
              <td className="px-3 py-2.5">Tổng cộng</td>
              <td className="px-3 py-2.5 text-right">{t.students}</td>
              <td className="px-3 py-2.5 text-right">{money(t.due)}</td>
              <td className="px-3 py-2.5 text-right">{money(t.collected)}</td>
              <td className="px-3 py-2.5 text-right text-red-600">{money(t.debt)}</td>
              <td className="px-3 py-2.5 text-right">{money(t.pay)}</td>
              <td className="px-3 py-2.5 text-right">{money(t.paidOut)}</td>
              <td className="px-3 py-2.5 text-right">{money(t.collected - t.paidOut)}</td>
            </tr>
          </tfoot>
        </TableWrap>
      </Card>

      <Card>
        <CardHeader title="Học phí đã thu theo ngành" subtitle="So sánh trực quan tỷ trọng đóng góp" />
        <div className="space-y-3 p-4">
          {rows.map((r) => (
            <div key={r.name} className="grid grid-cols-[160px_1fr] items-center gap-3 sm:grid-cols-[220px_1fr_150px]">
              <span className="truncate text-sm font-medium text-slate-700">{r.name}</span>
              <div className="h-4 overflow-hidden rounded bg-slate-100">
                <div className="h-full bg-navy-800" style={{ width: `${(r.collected / maxCollected) * 100}%` }} />
              </div>
              <span className="hidden text-right text-sm text-slate-600 sm:block">{money(r.collected)}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
