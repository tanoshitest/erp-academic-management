import { BookOpen, CircleDollarSign, GraduationCap, Mail, Phone } from 'lucide-react'
import { StatCard, StatGrid } from '../../components/common/StatCard'
import { Badge } from '../../components/ui/Badge'
import { Card, CardHeader } from '../../components/ui/Card'
import { useAcademic } from '../../context/AcademicContext'
import { useAuth } from '../../context/AuthContext'
import { CURRENT_SEMESTER } from '../../data/schedule'
import { LEVEL_LABEL, majorFaculty, majorName } from '../../data/students'
import { studentBalance } from '../../lib/finance'
import { date, money } from '../../lib/format'
import { gpa, transcriptFor } from '../../lib/grades'
import { STUDENT_STATUS_TONE } from '../../lib/labels'

export function StudentProfile() {
  const { state } = useAcademic()
  const { user } = useAuth()
  const me = state.students.find((s) => s.id === user?.id)
  if (!me) return null

  const rows = transcriptFor(me.id, state)
  const { gpa: g, earned } = gpa(rows)
  const registered = rows.filter((r) => r.section.semester === CURRENT_SEMESTER).reduce((s, r) => s + r.course.credits, 0)
  const balance = studentBalance(me.id, state)

  const info: [string, string][] = [
    ['Mã số học viên', me.id],
    ['Họ và tên', me.name],
    ['Giới tính', me.gender],
    ['Ngày sinh', me.dob ? date(me.dob) : '—'],
    ['Hệ đào tạo', LEVEL_LABEL[me.level]],
    ['Ngành học', majorName(me.major)],
    ['Khoa', majorFaculty(me.major)],
    ['Khóa', me.cohort],
    ['Lớp sinh hoạt', me.homeClass],
    ['Cố vấn học tập', me.advisor],
  ]

  return (
    <>
      <StatGrid>
        <StatCard icon={GraduationCap} label="Điểm TB tích lũy (GPA)" value={g == null ? '—' : g.toFixed(2).replace('.', ',')} sub="Thang điểm 4" />
        <StatCard icon={BookOpen} accent="blue" label="Tín chỉ tích lũy" value={earned} sub="Đã đạt" />
        <StatCard icon={BookOpen} accent="teal" label="Đang đăng ký" value={`${registered} tín chỉ`} sub={CURRENT_SEMESTER} />
        <StatCard icon={CircleDollarSign} accent={balance.debt ? 'red' : 'green'} label="Học phí còn nợ" value={money(balance.debt)} sub={balance.debt ? 'Xem mục Tài chính học viên' : 'Đã hoàn thành học phí'} />
      </StatGrid>

      <Card>
        <CardHeader title="Lý lịch học viên" actions={<Badge tone={STUDENT_STATUS_TONE[me.status]}>{me.status}</Badge>} />
        <div className="grid gap-x-8 gap-y-0 p-4 sm:grid-cols-2">
          {info.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2.5 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
              <span className="shrink-0 text-sm text-slate-500">{k}</span>
              <span className="truncate text-sm font-medium text-slate-800" title={v}>
                {v}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <Mail size={15} className="text-slate-400" /> {me.email}
          </span>
          <span className="flex items-center gap-2">
            <Phone size={15} className="text-slate-400" /> {me.phone}
          </span>
        </div>
      </Card>
    </>
  )
}
