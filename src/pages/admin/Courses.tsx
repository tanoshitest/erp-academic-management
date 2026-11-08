import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { EmptyState, SearchInput, Segmented, Toolbar } from '../../components/common/Controls'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, TableWrap } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { useAcademic } from '../../context/AcademicContext'
import { CURRENT_SEMESTER } from '../../data/schedule'
import { LEVEL_LABEL, LEVEL_SHORT, MAJORS, majorFaculty } from '../../data/students'
import { normalize } from '../../lib/format'
import { LEVEL_TONE } from '../../lib/labels'
import type { Course, Level, MajorCode } from '../../types'

const EMPTY: Course = { code: '', name: '', credits: 3, major: 'CNTT', level: 'DH' }

export function Courses() {
  const { state, addCourse } = useAcademic()
  const [faculty, setFaculty] = useState<'all' | MajorCode>('all')
  const [level, setLevel] = useState<'all' | Level>('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Course>(EMPTY)
  const [error, setError] = useState('')

  const rows = state.courses
    .filter((c) => faculty === 'all' || c.major === faculty)
    .filter((c) => level === 'all' || c.level === level)
    .filter((c) => !q || normalize(`${c.code} ${c.name}`).includes(normalize(q)))

  const totalCredits = rows.reduce((s, c) => s + c.credits, 0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const code = form.code.trim().toUpperCase()
    if (!/^[A-Z]{2}\d{3}$/.test(code)) return setError('Mã môn gồm 2 chữ cái và 3 chữ số, ví dụ CN502.')
    if (state.courses.some((c) => c.code === code)) return setError(`Mã ${code} đã tồn tại.`)
    if (!form.name.trim()) return setError('Vui lòng nhập tên môn học.')
    addCourse({ ...form, code, name: form.name.trim() })
    setOpen(false)
  }

  const openForm = () => {
    setForm(EMPTY)
    setError('')
    setOpen(true)
  }

  return (
    <>
      <Toolbar
        left={
          <>
            <select className="input w-56" value={faculty} onChange={(e) => setFaculty(e.target.value as 'all' | MajorCode)} aria-label="Khoa phụ trách">
              <option value="all">Tất cả khoa</option>
              {MAJORS.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.faculty}
                </option>
              ))}
            </select>
            <Segmented
              value={level}
              onChange={setLevel}
              options={[
                { value: 'all', label: 'Mọi hệ' },
                { value: 'DH', label: 'Đại học' },
                { value: 'THS', label: 'Thạc sĩ' },
                { value: 'TS', label: 'Tiến sĩ' },
              ]}
            />
          </>
        }
        right={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Tìm mã hoặc tên môn" />
            <Button onClick={openForm}>
              <Plus size={16} /> Thêm môn học
            </Button>
          </>
        }
      />

      <Card>
        <TableWrap>
          <thead>
            <tr>
              <th className="th">Mã môn</th>
              <th className="th">Tên môn học</th>
              <th className="th text-right">Tín chỉ</th>
              <th className="th">Khoa phụ trách</th>
              <th className="th">Hệ đào tạo</th>
              <th className="th">Giảng viên ({CURRENT_SEMESTER})</th>
              <th className="th text-right">Lớp đang mở</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const secs = state.sections.filter((s) => s.courseCode === c.code && s.semester === CURRENT_SEMESTER)
              const lecturers = [...new Set(secs.map((s) => state.lecturers.find((l) => l.id === s.lecturerId)?.name))]
              return (
                <tr key={c.code} className="hover:bg-slate-50">
                  <td className="td font-medium text-navy-800">{c.code}</td>
                  <td className="td">{c.name}</td>
                  <td className="td text-right">{c.credits}</td>
                  <td className="td">{majorFaculty(c.major)}</td>
                  <td className="td"><Badge tone={LEVEL_TONE[c.level]}>{LEVEL_LABEL[c.level]}</Badge></td>
                  <td className="td">{lecturers.length ? lecturers.join(', ') : <span className="text-slate-400">—</span>}</td>
                  <td className="td text-right">{secs.length}</td>
                </tr>
              )
            })}
          </tbody>
          {!!rows.length && (
            <tfoot>
              <tr className="bg-slate-50 text-sm font-semibold">
                <td className="px-3 py-2.5" colSpan={2}>
                  {rows.length} môn học
                </td>
                <td className="px-3 py-2.5 text-right">{totalCredits}</td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          )}
        </TableWrap>
        {!rows.length && <EmptyState>Không có môn học phù hợp.</EmptyState>}
      </Card>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Thêm môn học mới"
        description="Môn học mới sẽ xuất hiện ngay trong danh mục."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="course-form">
              Lưu môn học
            </Button>
          </>
        }
      >
        <form id="course-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Mã môn">
            <input className="input uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: CN502" autoFocus />
          </Field>
          <Field label="Số tín chỉ">
            <input className="input" type="number" min={1} max={6} value={form.credits} onChange={(e) => setForm({ ...form, credits: Math.min(6, Math.max(1, Number(e.target.value) || 1)) })} />
          </Field>
          <Field label="Tên môn học" className="sm:col-span-2">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Điện toán đám mây" />
          </Field>
          <Field label="Khoa phụ trách">
            <select className="input" value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value as MajorCode })}>
              {MAJORS.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.faculty}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hệ đào tạo">
            <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as Level })}>
              {(Object.keys(LEVEL_SHORT) as Level[]).map((l) => (
                <option key={l} value={l}>
                  {LEVEL_LABEL[l]}
                </option>
              ))}
            </select>
          </Field>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        </form>
      </Modal>
    </>
  )
}
