import { ArrowRight, BookOpen, CircleDollarSign, Target, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard, StatGrid } from '../../components/common/StatCard'
import { Badge } from '../../components/ui/Badge'
import { Card, CardHeader, TableWrap } from '../../components/ui/Card'
import { useAcademic } from '../../context/AcademicContext'
import { CURRENT_SEMESTER } from '../../data/schedule'
import { ADMISSION_TARGETS, LEVEL_LABEL, LEVEL_SHORT, MAJORS } from '../../data/students'
import { money, num, percent } from '../../lib/format'
import { LEVEL_TONE } from '../../lib/labels'
import type { Level } from '../../types'

const LEVELS: Level[] = ['DH', 'THS', 'TS']

export function Dashboard() {
  const { state } = useAcademic()
  const open = state.sections.filter((s) => s.semester === CURRENT_SEMESTER)
  const currentInvoices = state.invoices.filter((i) => i.semester === CURRENT_SEMESTER)
  const expected = currentInvoices.reduce((s, i) => s + i.amount, 0)
  const collected = state.payments.filter((p) => currentInvoices.some((i) => i.id === p.invoiceId)).reduce((s, p) => s + p.amount, 0)
  const admitted = state.admissions.filter((a) => a.status === 'trung_tuyen' || a.status === 'nhap_hoc').length
  const target = LEVELS.reduce((s, l) => s + ADMISSION_TARGETS[l], 0)
  const pending = state.admissions.filter((a) => a.status === 'cho_duyet')
  const byLevel = LEVELS.map((l) => state.students.filter((s) => s.level === l).length)
  const maxMajor = Math.max(...MAJORS.map((m) => state.students.filter((s) => s.major === m.code).length), 1)

  return (
    <>
      <StatGrid>
        <StatCard icon={Users} label="Tổng học viên" value={num(state.students.length)} sub={`ĐH ${byLevel[0]} · ThS ${byLevel[1]} · TS ${byLevel[2]}`} />
        <StatCard icon={BookOpen} accent="blue" label="Lớp học phần đang mở" value={num(open.length)} sub={CURRENT_SEMESTER} />
        <StatCard icon={CircleDollarSign} accent="teal" label="Doanh thu dự kiến" value={money(expected)} sub={`Đã thu ${money(collected)} (${percent(expected ? collected / expected : 0)})`} />
        <StatCard icon={Target} accent="amber" label="Tỷ lệ tuyển sinh đạt" value={percent(admitted / target)} sub={`${admitted}/${target} chỉ tiêu · ${pending.length} hồ sơ chờ duyệt`} />
      </StatGrid>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Học viên theo ngành" subtitle="Toàn bộ hệ đào tạo" />
          <div className="space-y-3 p-4">
            {MAJORS.map((m) => {
              const list = state.students.filter((s) => s.major === m.code)
              const dh = list.filter((s) => s.level === 'DH').length
              return (
                <div key={m.code}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{m.name}</span>
                    <span className="text-slate-500">
                      {list.length} <span className="text-xs">(ĐH {dh} · Sau ĐH {list.length - dh})</span>
                    </span>
                  </div>
                  <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="bg-navy-800" style={{ width: `${(dh / maxMajor) * 100}%` }} />
                    <div className="bg-teal-500" style={{ width: `${((list.length - dh) / maxMajor) * 100}%` }} />
                  </div>
                </div>
              )
            })}
            <div className="flex gap-4 pt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-navy-800" />Đại học</span>
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-teal-500" />Sau đại học</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Tiến độ tuyển sinh 2026"
            subtitle="Trúng tuyển + nhập học so với chỉ tiêu"
            actions={
              <Link to="/admin/tuyen-sinh" className="inline-flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-800">
                Xem hồ sơ <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="space-y-4 p-4">
            {LEVELS.map((l) => {
              const list = state.admissions.filter((a) => a.level === l)
              const ok = list.filter((a) => a.status === 'trung_tuyen' || a.status === 'nhap_hoc').length
              return (
                <div key={l}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{LEVEL_LABEL[l]}</span>
                    <span className="text-slate-500">
                      {ok}/{ADMISSION_TARGETS[l]} chỉ tiêu · {list.length} hồ sơ
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (ok / ADMISSION_TARGETS[l]) * 100)}%` }} />
                  </div>
                </div>
              )
            })}
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Hồ sơ chờ duyệt mới nhất</p>
              <ul className="divide-y divide-slate-100">
                {pending.slice(-3).reverse().map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="truncate">
                      <span className="font-medium text-slate-800">{a.name}</span>
                      <span className="text-slate-400"> · {a.id}</span>
                    </span>
                    <Badge tone={LEVEL_TONE[a.level]}>{LEVEL_SHORT[a.level]}</Badge>
                  </li>
                ))}
                {!pending.length && <li className="py-2 text-sm text-slate-500">Không còn hồ sơ chờ duyệt.</li>}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Lớp học phần đang mở" subtitle={CURRENT_SEMESTER} />
        <TableWrap>
          <thead>
            <tr>
              <th className="th">Mã lớp</th>
              <th className="th">Môn học</th>
              <th className="th">Hệ</th>
              <th className="th">Giảng viên</th>
              <th className="th text-right">Sĩ số</th>
              <th className="th">Tiến độ giảng dạy</th>
            </tr>
          </thead>
          <tbody>
            {open.map((sec) => {
              const course = state.courses.find((c) => c.code === sec.courseCode)!
              const lecturer = state.lecturers.find((l) => l.id === sec.lecturerId)
              const pct = sec.taughtPeriods / sec.plannedPeriods
              return (
                <tr key={sec.id} className="hover:bg-slate-50">
                  <td className="td font-medium text-navy-800">{sec.code}</td>
                  <td className="td">{course.name}</td>
                  <td className="td"><Badge tone={LEVEL_TONE[course.level]}>{LEVEL_SHORT[course.level]}</Badge></td>
                  <td className="td">{lecturer?.name}</td>
                  <td className="td text-right">{sec.studentIds.length}</td>
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full bg-navy-800" style={{ width: `${pct * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">
                        {sec.taughtPeriods}/{sec.plannedPeriods} tiết
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      </Card>
    </>
  )
}
