import { BadgeCheck, CalendarClock, Clock, Wallet } from 'lucide-react'
import { useState } from 'react'
import { StatCard, StatGrid } from '../../components/common/StatCard'
import { PageScroll } from '../../components/layout/PageScroll'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, TableWrap } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { useAcademic } from '../../context/AcademicContext'
import { DEGREE_COEFFICIENT, RATE_PER_PERIOD } from '../../data/finances'
import { CURRENT_SEMESTER } from '../../data/schedule'
import { LEVEL_SHORT } from '../../data/students'
import { lecturerPay } from '../../lib/finance'
import { date, money, num, todayIso } from '../../lib/format'

export function LecturerPay() {
  const { state, confirmPayout } = useAcademic()
  const [selected, setSelected] = useState<string | null>(null)

  const rows = state.lecturers.map((l) => ({ lecturer: l, ...lecturerPay(l, state) }))
  const total = rows.reduce((s, r) => s + r.amount, 0)
  const paid = rows.reduce((s, r) => s + (r.payout?.amount ?? 0), 0)
  const periods = rows.reduce((s, r) => s + r.periods, 0)
  const current = rows.find((r) => r.lecturer.id === selected)

  return (
    <PageScroll
      top={
        <>
          <StatGrid>
            <StatCard icon={Wallet} label="Tổng thù lao kỳ này" value={money(total)} sub={CURRENT_SEMESTER} />
            <StatCard icon={BadgeCheck} accent="green" label="Đã thanh toán" value={money(paid)} sub={`${rows.filter((r) => r.payout).length}/${rows.length} giảng viên`} />
            <StatCard icon={CalendarClock} accent="amber" label="Chưa thanh toán" value={money(total - paid)} sub="Chờ kế toán xác nhận" />
            <StatCard icon={Clock} accent="blue" label="Tổng tiết thực dạy" value={num(periods)} sub="Theo sổ đầu bài" />
          </StatGrid>
          <p className="text-xs text-slate-500">
            Hệ số học vị: {Object.entries(DEGREE_COEFFICIENT).map(([k, v]) => `${k} ${v.toFixed(1).replace('.', ',')}`).join(' · ')}
          </p>
        </>
      }
    >
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader
          title="Bảng kê thù lao giờ dạy"
          subtitle={`Thù lao = Tiết thực dạy × Đơn giá theo hệ (ĐH ${num(RATE_PER_PERIOD.DH)} ₫ · ThS ${num(RATE_PER_PERIOD.THS)} ₫ · TS ${num(RATE_PER_PERIOD.TS)} ₫) × Hệ số học vị`}
        />
        <TableWrap>
          <thead>
            <tr>
              <th className="th">Mã GV</th>
              <th className="th">Giảng viên</th>
              <th className="th">Khoa</th>
              <th className="th text-right">Hệ số học vị</th>
              <th className="th text-right">Số lớp</th>
              <th className="th text-right">Tiết thực dạy</th>
              <th className="th text-right">Thù lao</th>
              <th className="th">Trạng thái</th>
              <th className="th text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.lecturer.id} className="hover:bg-slate-50">
                <td className="td font-medium text-navy-800">{r.lecturer.id}</td>
                <td className="td">{r.lecturer.name}</td>
                <td className="td">{r.lecturer.faculty}</td>
                <td className="td text-right">
                  {r.lecturer.degree} · {r.coefficient.toFixed(1).replace('.', ',')}
                </td>
                <td className="td text-right">{r.lines.length}</td>
                <td className="td text-right">{r.periods}</td>
                <td className="td text-right font-semibold">{money(r.amount)}</td>
                <td className="td">{r.payout ? <Badge tone="green">Đã thanh toán {date(r.payout.paidAt)}</Badge> : <Badge tone="amber">Chưa thanh toán</Badge>}</td>
                <td className="td text-right">
                  <Button size="sm" variant={r.payout ? 'secondary' : 'primary'} onClick={() => setSelected(r.lecturer.id)}>
                    {r.payout ? 'Xem chi tiết' : 'Xác nhận thanh toán'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 text-sm font-semibold">
              <td className="px-3 py-2.5" colSpan={5}>
                Tổng cộng
              </td>
              <td className="px-3 py-2.5 text-right">{periods}</td>
              <td className="px-3 py-2.5 text-right">{money(total)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </TableWrap>
      </Card>

      <Modal
        open={!!current}
        onOpenChange={(o) => !o && setSelected(null)}
        title={current?.payout ? 'Chi tiết thù lao' : 'Xác nhận thanh toán thù lao'}
        description={current ? `${current.lecturer.name} · ${CURRENT_SEMESTER}` : undefined}
        width="max-w-2xl"
        footer={
          current && (
            <>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Đóng
              </Button>
              {!current.payout && (
                <Button
                  variant="success"
                  onClick={() => {
                    confirmPayout(current.lecturer.id, current.amount, todayIso())
                    setSelected(null)
                  }}
                >
                  <BadgeCheck size={15} /> Xác nhận đã chi {money(current.amount)}
                </Button>
              )}
            </>
          )
        }
      >
        {current && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="th">Lớp học phần</th>
                  <th className="th">Hệ</th>
                  <th className="th text-right">Tiết</th>
                  <th className="th text-right">Đơn giá</th>
                  <th className="th text-right">Hệ số</th>
                  <th className="th text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {current.lines.map((l) => (
                  <tr key={l.section.id}>
                    <td className="td">
                      <div className="font-medium text-navy-800">{l.section.code}</div>
                      <div className="text-xs text-slate-500">{l.course.name}</div>
                    </td>
                    <td className="td">{LEVEL_SHORT[l.course.level]}</td>
                    <td className="td text-right">{l.section.taughtPeriods}</td>
                    <td className="td text-right">{num(l.rate)}</td>
                    <td className="td text-right">{current.coefficient.toFixed(1).replace('.', ',')}</td>
                    <td className="td text-right font-semibold">{money(l.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-semibold">
                  <td className="px-3 py-2.5 text-sm" colSpan={2}>
                    Tổng
                  </td>
                  <td className="px-3 py-2.5 text-right text-sm">{current.periods}</td>
                  <td colSpan={2} />
                  <td className="px-3 py-2.5 text-right text-sm">{money(current.amount)}</td>
                </tr>
              </tbody>
            </table>
            {current.payout && <p className="mt-3 text-sm text-emerald-700">Đã thanh toán {money(current.payout.amount)} ngày {date(current.payout.paidAt)}.</p>}
          </div>
        )}
      </Modal>
    </PageScroll>
  )
}
