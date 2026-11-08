import { Lock } from 'lucide-react'
import { useEffect, useState, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Card, CardHeader, TableWrap } from '../../components/ui/Card'
import { useAcademic } from '../../context/AcademicContext'
import { useAuth } from '../../context/AuthContext'
import { CURRENT_SEMESTER } from '../../data/schedule'
import { finalScore, letter, WEIGHTS } from '../../lib/grades'
import type { GradeEntry } from '../../types'

const FIELDS: { key: keyof GradeEntry; label: string }[] = [
  { key: 'cc', label: `Chuyên cần (${WEIGHTS.cc * 100}%)` },
  { key: 'gk', label: `Giữa kỳ (${WEIGHTS.gk * 100}%)` },
  { key: 'ck', label: `Cuối kỳ (${WEIGHTS.ck * 100}%)` },
]

const fmt = (v: number | null | undefined) => (v == null ? '' : String(v).replace('.', ','))

function ScoreInput({ value, onCommit, cell, disabled }: { value: number | null; onCommit: (v: number | null) => void; cell: string; disabled: boolean }) {
  const [text, setText] = useState(fmt(value))
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    setText(fmt(value))
    setInvalid(false)
  }, [value])

  const commit = () => {
    const raw = text.trim().replace(',', '.')
    if (raw === '') {
      setInvalid(false)
      if (value != null) onCommit(null)
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n) || n < 0 || n > 10) return setInvalid(true)
    const rounded = Math.round(n * 100) / 100
    setInvalid(false)
    if (rounded !== value) onCommit(rounded)
    setText(fmt(rounded))
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    commit()
    const [col, row] = cell.split(':')
    const next = document.querySelector<HTMLInputElement>(`[data-cell="${col}:${Number(row) + (e.key === 'ArrowUp' ? -1 : 1)}"]`)
    next?.focus()
    next?.select()
  }

  return (
    <input
      data-cell={cell}
      inputMode="decimal"
      disabled={disabled}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={onKey}
      onFocus={(e) => e.target.select()}
      aria-invalid={invalid}
      title={invalid ? 'Điểm phải từ 0 đến 10' : undefined}
      className={`h-8 w-20 rounded border px-2 text-center text-sm outline-none transition focus:ring-2 disabled:border-transparent disabled:bg-transparent ${
        invalid ? 'border-red-400 bg-red-50 focus:ring-red-100' : 'border-slate-300 focus:border-navy-500 focus:ring-navy-100'
      }`}
    />
  )
}

export function Gradebook() {
  const { state, setGrade } = useAcademic()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const mine = state.sections.filter((s) => s.lecturerId === user?.id).sort((a, b) => (a.semester === b.semester ? a.code.localeCompare(b.code) : a.semester === CURRENT_SEMESTER ? -1 : 1))
  const section = mine.find((s) => s.id === params.get('lop')) ?? mine[0]

  if (!section) return null
  const course = state.courses.find((c) => c.code === section.courseCode)!
  const locked = section.semester !== CURRENT_SEMESTER
  const students = section.studentIds.map((id) => state.students.find((s) => s.id === id)!).filter(Boolean)
  const totals = students.map((s) => finalScore(state.grades[section.id]?.[s.id]))
  const graded = totals.filter((t): t is number => t != null)
  const avg = graded.length ? graded.reduce((a, b) => a + b, 0) / graded.length : null
  const passed = graded.filter((t) => t >= 4).length

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <select className="input w-full sm:w-96" value={section.id} onChange={(e) => setParams({ lop: e.target.value })} aria-label="Chọn lớp học phần">
          {mine.map((s) => {
            const c = state.courses.find((x) => x.code === s.courseCode)
            return (
              <option key={s.id} value={s.id}>
                {s.code} – {c?.name} ({s.semester})
              </option>
            )
          })}
        </select>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge tone="navy">Sĩ số {students.length}</Badge>
          <Badge tone="blue">Đủ điểm {graded.length}/{students.length}</Badge>
          <Badge tone="teal">TB lớp {avg == null ? '—' : avg.toFixed(2).replace('.', ',')}</Badge>
          <Badge tone="green">Đạt {passed}/{graded.length || 0}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader
          title={`${course.name} · ${section.code}`}
          subtitle={`${course.credits} tín chỉ · ${section.semester} · Tổng kết = CC×${WEIGHTS.cc} + GK×${WEIGHTS.gk} + CK×${WEIGHTS.ck}`}
          actions={
            locked ? (
              <Badge tone="gray">
                <Lock size={12} className="mr-1" /> Đã khóa sổ điểm
              </Badge>
            ) : (
              <span className="text-xs text-slate-500">Nhập điểm thang 10 · Enter để xuống dòng · tự động lưu</span>
            )
          }
        />
        <TableWrap>
          <thead>
            <tr>
              <th className="th w-12 text-center">STT</th>
              <th className="th">MSSV</th>
              <th className="th">Họ và tên</th>
              {FIELDS.map((f) => (
                <th key={f.key} className="th text-center">
                  {f.label}
                </th>
              ))}
              <th className="th text-center">Tổng kết</th>
              <th className="th text-center">Điểm chữ</th>
              <th className="th">Kết quả</th>
            </tr>
          </thead>
          <tbody key={section.id}>
            {students.map((st, i) => {
              const g = state.grades[section.id]?.[st.id] ?? { cc: null, gk: null, ck: null }
              const total = totals[i]
              const l = letter(total)
              return (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="td text-center text-slate-500">{i + 1}</td>
                  <td className="td font-medium text-navy-800">{st.id}</td>
                  <td className="td">{st.name}</td>
                  {FIELDS.map((f) => (
                    <td key={f.key} className="td py-1.5 text-center">
                      <ScoreInput cell={`${f.key}:${i}`} value={g[f.key]} disabled={locked} onCommit={(v) => setGrade(section.id, st.id, f.key, v)} />
                    </td>
                  ))}
                  <td className="td text-center text-base font-semibold text-slate-900">{total == null ? <span className="text-slate-300">—</span> : fmt(total)}</td>
                  <td className="td text-center font-medium">{l?.letter ?? <span className="text-slate-300">—</span>}</td>
                  <td className="td">{l ? <Badge tone={l.passed ? 'green' : 'red'}>{l.passed ? 'Đạt' : 'Học lại'}</Badge> : <Badge tone="gray">Chưa đủ điểm</Badge>}</td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      </Card>
    </>
  )
}
