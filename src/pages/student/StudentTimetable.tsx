import { WeekTimetable } from '../../components/common/WeekTimetable'
import { Card, CardHeader, TableWrap } from '../../components/ui/Card'
import { useAcademic } from '../../context/AcademicContext'
import { useAuth } from '../../context/AuthContext'
import { CURRENT_SEMESTER, dayLabel } from '../../data/schedule'

export function StudentTimetable() {
  const { state } = useAcademic()
  const { user } = useAuth()
  const mine = state.sections.filter((s) => s.semester === CURRENT_SEMESTER && s.studentIds.includes(user?.id ?? ''))

  return (
    <>
      <Card>
        <WeekTimetable sections={mine} courses={state.courses} caption={(s) => s.code} />
      </Card>
      <Card>
        <CardHeader title="Học phần đã đăng ký" subtitle={`${CURRENT_SEMESTER} · ${mine.length} học phần · ${mine.reduce((s, sec) => s + (state.courses.find((c) => c.code === sec.courseCode)?.credits ?? 0), 0)} tín chỉ`} />
        <TableWrap>
          <thead>
            <tr>
              <th className="th">Mã lớp</th>
              <th className="th">Học phần</th>
              <th className="th text-right">Tín chỉ</th>
              <th className="th">Giảng viên</th>
              <th className="th">Lịch học</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((sec) => {
              const course = state.courses.find((c) => c.code === sec.courseCode)!
              return (
                <tr key={sec.id} className="hover:bg-slate-50">
                  <td className="td font-medium text-navy-800">{sec.code}</td>
                  <td className="td">{course.name}</td>
                  <td className="td text-right">{course.credits}</td>
                  <td className="td">{state.lecturers.find((l) => l.id === sec.lecturerId)?.name}</td>
                  <td className="td">
                    {sec.slots.map((sl) => (
                      <div key={`${sl.day}-${sl.start}`} className="text-xs text-slate-600">
                        {dayLabel(sl.day)} · Tiết {sl.start}–{sl.start + sl.periods - 1} · {sl.room}
                      </div>
                    ))}
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
