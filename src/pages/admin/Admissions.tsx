import { CheckCircle2, UserCheck, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState, SearchInput, Segmented, Toolbar } from '../../components/common/Controls'
import { PageScroll } from '../../components/layout/PageScroll'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, TableWrap } from '../../components/ui/Card'
import { useAcademic } from '../../context/AcademicContext'
import { LEVEL_SHORT, majorName } from '../../data/students'
import { date, normalize } from '../../lib/format'
import { ADMISSION_STATUS, LEVEL_TONE } from '../../lib/labels'
import type { Admission, AdmissionStatus, Level } from '../../types'

type LevelFilter = 'all' | Level
type StatusFilter = 'all' | AdmissionStatus

export function Admissions() {
  const { state, setAdmissionStatus } = useAcademic()
  const [level, setLevel] = useState<LevelFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [q, setQ] = useState('')
  const [notice, setNotice] = useState('')

  const byLevel = state.admissions.filter((a) => level === 'all' || a.level === level)
  const rows = useMemo(
    () =>
      byLevel
        .filter((a) => status === 'all' || a.status === status)
        .filter((a) => !q || normalize(`${a.id} ${a.name}`).includes(normalize(q))),
    [byLevel, status, q],
  )

  const count = (l: LevelFilter) => state.admissions.filter((a) => l === 'all' || a.level === l).length
  const countStatus = (s: StatusFilter) => byLevel.filter((a) => s === 'all' || a.status === s).length

  const change = (a: Admission, next: AdmissionStatus) => {
    setAdmissionStatus(a.id, next)
    setNotice(
      next === 'nhap_hoc'
        ? `${a.name} đã nhập học — hệ thống tạo hồ sơ học viên và khoản học phí nhập học bên Kế toán.`
        : `${a.name}: chuyển sang "${ADMISSION_STATUS[next].label}".`,
    )
  }

  return (
    <PageScroll
      top={
        <>
          <Toolbar
        left={
          <Segmented
            value={level}
            onChange={setLevel}
            options={[
              { value: 'all', label: 'Tất cả hệ', count: count('all') },
              { value: 'DH', label: 'Đại học', count: count('DH') },
              { value: 'THS', label: 'Thạc sĩ', count: count('THS') },
              { value: 'TS', label: 'Tiến sĩ', count: count('TS') },
            ]}
          />
        }
        right={<SearchInput value={q} onChange={setQ} placeholder="Tìm theo mã hồ sơ, họ tên" />}
      />
      <Segmented
        value={status}
        onChange={setStatus}
        options={[
          { value: 'all', label: 'Mọi trạng thái', count: countStatus('all') },
          ...(Object.keys(ADMISSION_STATUS) as AdmissionStatus[]).map((s) => ({ value: s, label: ADMISSION_STATUS[s].label, count: countStatus(s) })),
        ]}
      />

      {notice && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span className="flex-1">{notice}</span>
          <button type="button" className="text-xs text-emerald-700 hover:underline" onClick={() => setNotice('')}>
            Ẩn
          </button>
        </div>
      )}
        </>
      }
    >
      <Card className="flex min-h-0 flex-1 flex-col">
        <TableWrap>
          <thead>
            <tr>
              <th className="th">Mã hồ sơ</th>
              <th className="th">Họ và tên</th>
              <th className="th">Hệ</th>
              <th className="th">Ngành đăng ký</th>
              <th className="th text-right">Điểm xét tuyển</th>
              <th className="th">Ngày nộp</th>
              <th className="th">Trạng thái</th>
              <th className="th text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="td font-medium text-navy-800">{a.id}</td>
                <td className="td">
                  <div className="font-medium text-slate-800">{a.name}</div>
                  <div className="text-xs text-slate-400">{a.phone}</div>
                </td>
                <td className="td"><Badge tone={LEVEL_TONE[a.level]}>{LEVEL_SHORT[a.level]}</Badge></td>
                <td className="td">{majorName(a.major)}</td>
                <td className="td text-right font-medium">
                  {a.score.toLocaleString('vi-VN')}
                  <span className="text-xs font-normal text-slate-400">/{a.level === 'DH' ? 30 : 10}</span>
                </td>
                <td className="td">{date(a.submittedAt)}</td>
                <td className="td">
                  <Badge tone={ADMISSION_STATUS[a.status].tone}>{ADMISSION_STATUS[a.status].label}</Badge>
                  {a.studentId && <div className="mt-1 text-xs text-slate-500">MSSV {a.studentId}</div>}
                </td>
                <td className="td">
                  <div className="flex justify-end gap-2">
                    {a.status === 'cho_duyet' && (
                      <>
                        <Button size="sm" variant="danger" onClick={() => change(a, 'tu_choi')}>
                          <XCircle size={14} /> Từ chối
                        </Button>
                        <Button size="sm" onClick={() => change(a, 'trung_tuyen')}>
                          <CheckCircle2 size={14} /> Duyệt trúng tuyển
                        </Button>
                      </>
                    )}
                    {a.status === 'trung_tuyen' && (
                      <Button size="sm" variant="success" onClick={() => change(a, 'nhap_hoc')}>
                        <UserCheck size={14} /> Xác nhận nhập học
                      </Button>
                    )}
                    {a.status === 'tu_choi' && (
                      <Button size="sm" variant="secondary" onClick={() => change(a, 'cho_duyet')}>
                        Xét lại
                      </Button>
                    )}
                    {a.status === 'nhap_hoc' && <span className="text-xs text-slate-400">Hoàn tất</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        {!rows.length && <EmptyState>Không có hồ sơ phù hợp bộ lọc.</EmptyState>}
      </Card>
    </PageScroll>
  )
}
