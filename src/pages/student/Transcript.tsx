import { Award, BookCheck, BookOpen, GraduationCap } from 'lucide-react'
import { StatCard, StatGrid } from '../../components/common/StatCard'
import { Badge } from '../../components/ui/Badge'
import { Card, CardHeader, TableWrap } from '../../components/ui/Card'
import { useAcademic } from '../../context/AcademicContext'
import { useAuth } from '../../context/AuthContext'
import { finalScore, gpa, letter, transcriptFor } from '../../lib/grades'

const fmt = (v: number | null | undefined) => (v == null ? <span className="text-slate-300">—</span> : String(v).replace('.', ','))

export function Transcript() {
  const { state } = useAcademic()
  const { user } = useAuth()
  const rows = transcriptFor(user?.id ?? '', state)
  const semesters = [...new Set(rows.map((r) => r.section.semester))].sort().reverse()
  const overall = gpa(rows)
  const classification =
    overall.gpa == null ? null : overall.gpa >= 3.6 ? 'Xuất sắc' : overall.gpa >= 3.2 ? 'Giỏi' : overall.gpa >= 2.5 ? 'Khá' : overall.gpa >= 2 ? 'Trung bình' : 'Yếu'

  return (
    <>
      <StatGrid>
        <StatCard icon={GraduationCap} label="GPA tích lũy (thang 4)" value={overall.gpa == null ? '—' : overall.gpa.toFixed(2).replace('.', ',')} sub={classification ? `Xếp loại: ${classification}` : 'Chưa có điểm'} />
        <StatCard icon={BookCheck} accent="green" label="Tín chỉ tích lũy" value={overall.earned} sub={`${overall.credits} tín chỉ đã có điểm`} />
        <StatCard icon={BookOpen} accent="blue" label="Học phần đã học" value={rows.length} sub={`${rows.filter((r) => r.total == null).length} học phần chưa có điểm tổng kết`} />
        <StatCard icon={Award} accent="amber" label="Học phần đạt" value={`${rows.filter((r) => r.total != null && letter(r.total)!.passed).length}/${rows.filter((r) => r.total != null).length}`} sub="Điểm tổng kết ≥ 4,0" />
      </StatGrid>

      {semesters.map((sem) => {
        const list = rows.filter((r) => r.section.semester === sem)
        const s = gpa(list)
        return (
          <Card key={sem}>
            <CardHeader
              title={`Học kỳ ${sem}`}
              subtitle={`${list.length} học phần · ${list.reduce((a, r) => a + r.course.credits, 0)} tín chỉ`}
              actions={<Badge tone="navy">GPA học kỳ: {s.gpa == null ? '—' : s.gpa.toFixed(2).replace('.', ',')}</Badge>}
            />
            <TableWrap>
              <thead>
                <tr>
                  <th className="th">Mã môn</th>
                  <th className="th">Học phần</th>
                  <th className="th text-right">Tín chỉ</th>
                  <th className="th text-center">Chuyên cần</th>
                  <th className="th text-center">Giữa kỳ</th>
                  <th className="th text-center">Cuối kỳ</th>
                  <th className="th text-center">Tổng kết</th>
                  <th className="th text-center">Điểm chữ</th>
                  <th className="th">Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => {
                  const l = letter(finalScore(r.grade))
                  return (
                    <tr key={r.section.id} className="hover:bg-slate-50">
                      <td className="td font-medium text-navy-800">{r.course.code}</td>
                      <td className="td">{r.course.name}</td>
                      <td className="td text-right">{r.course.credits}</td>
                      <td className="td text-center">{fmt(r.grade?.cc)}</td>
                      <td className="td text-center">{fmt(r.grade?.gk)}</td>
                      <td className="td text-center">{fmt(r.grade?.ck)}</td>
                      <td className="td text-center font-semibold">{fmt(r.total)}</td>
                      <td className="td text-center font-medium">{l?.letter ?? <span className="text-slate-300">—</span>}</td>
                      <td className="td">{l ? <Badge tone={l.passed ? 'green' : 'red'}>{l.passed ? 'Đạt' : 'Học lại'}</Badge> : <Badge tone="gray">Đang học</Badge>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </TableWrap>
          </Card>
        )
      })}
      <p className="text-xs text-slate-500">Điểm tổng kết = Chuyên cần × 10% + Giữa kỳ × 30% + Cuối kỳ × 60%. A ≥ 8,5 · B+ ≥ 8,0 · B ≥ 7,0 · C+ ≥ 6,5 · C ≥ 5,5 · D+ ≥ 5,0 · D ≥ 4,0 · F &lt; 4,0.</p>
    </>
  )
}
