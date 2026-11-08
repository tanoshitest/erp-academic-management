import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { WeekTimetable } from '../../components/common/WeekTimetable'
import { Badge } from '../../components/ui/Badge'
import { Card, CardHeader, TableWrap } from '../../components/ui/Card'
import { useAcademic } from '../../context/AcademicContext'
import { useAuth } from '../../context/AuthContext'
import { CURRENT_SEMESTER, dayLabel } from '../../data/schedule'
import { LEVEL_SHORT } from '../../data/students'
import { LEVEL_TONE } from '../../lib/labels'

export function TeachingSchedule() {
  const { state } = useAcademic()
  const { user } = useAuth()
  const mine = state.sections.filter((s) => s.lecturerId === user?.id && s.semester === CURRENT_SEMESTER)

  return (
    <>
      <Card>
        <WeekTimetable sections={mine} courses={state.courses} caption={(s) => `${s.code} · ${s.studentIds.length} HV`} />
      </Card>

      <Card>
        <CardHeader title="Danh sách lớp phụ trách" subtitle={`${CURRENT_SEMESTER} · ${mine.length} lớp học phần`} />
        <TableWrap>
          <thead>
            <tr>
              <th className="th">Mã lớp</th>
              <th className="th">Môn học</th>
              <th className="th">Hệ</th>
              <th className="th text-right">Tín chỉ</th>
              <th className="th text-right">Sĩ số</th>
              <th className="th">Lịch học</th>
              <th className="th">Tiến độ</th>
              <th className="th text-right">Sổ điểm</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((sec) => {
              const course = state.courses.find((c) => c.code === sec.courseCode)!
              return (
                <tr key={sec.id} className="hover:bg-slate-50">
                  <td className="td font-medium text-navy-800">{sec.code}</td>
                  <td className="td">{course.name}</td>
                  <td className="td"><Badge tone={LEVEL_TONE[course.level]}>{LEVEL_SHORT[course.level]}</Badge></td>
                  <td className="td text-right">{course.credits}</td>
                  <td className="td text-right">{sec.studentIds.length}</td>
                  <td className="td">
                    {sec.slots.map((sl) => (
                      <div key={`${sl.day}-${sl.start}`} className="text-xs text-slate-600">
                        {dayLabel(sl.day)} · Tiết {sl.start}–{sl.start + sl.periods - 1} · {sl.room}
                      </div>
                    ))}
                  </td>
                  <td className="td text-xs text-slate-600">
                    {sec.taughtPeriods}/{sec.plannedPeriods} tiết
                  </td>
                  <td className="td text-right">
                    <Link to={`/giang-vien/so-diem?lop=${sec.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-800">
                      <FileText size={14} /> Nhập điểm
                    </Link>
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
