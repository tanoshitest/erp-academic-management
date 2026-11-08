import { CircleDollarSign, History, Wallet } from 'lucide-react'
import { StatCard, StatGrid } from '../../components/common/StatCard'
import { EmptyState } from '../../components/common/Controls'
import { Badge } from '../../components/ui/Badge'
import { Card, CardHeader, TableWrap } from '../../components/ui/Card'
import { useAcademic } from '../../context/AcademicContext'
import { useAuth } from '../../context/AuthContext'
import { invoicePaid, studentBalance } from '../../lib/finance'
import { date, money } from '../../lib/format'

export function StudentFinance() {
  const { state } = useAcademic()
  const { user } = useAuth()
  const me = state.students.find((s) => s.id === user?.id)
  if (!me) return null

  const b = studentBalance(me.id, state)
  const invoices = [...b.invoices].reverse()
  const payments = [...state.payments].filter((p) => p.studentId === me.id).reverse()

  return (
    <>
      <StatGrid>
        <StatCard icon={CircleDollarSign} label="Tổng phải nộp" value={money(b.due)} sub={`${invoices.length} khoản thu`} />
        <StatCard icon={Wallet} accent="green" label="Đã nộp" value={money(b.paid)} sub={`${payments.length} lần nộp`} />
        <StatCard icon={CircleDollarSign} accent={b.debt ? 'red' : 'green'} label="Còn nợ" value={money(b.debt)} sub={b.debt ? 'Nộp tại Phòng Kế toán hoặc chuyển khoản' : 'Đã hoàn thành nghĩa vụ học phí'} />
        <StatCard icon={History} accent="blue" label="Lần nộp gần nhất" value={payments[0] ? date(payments[0].date) : '—'} sub={payments[0] ? `${money(payments[0].amount)} · ${payments[0].method}` : undefined} />
      </StatGrid>

      <Card>
        <CardHeader title="Các khoản học phí" />
        <TableWrap>
          <thead>
            <tr>
              <th className="th">Mã khoản thu</th>
              <th className="th">Nội dung</th>
              <th className="th">Hạn nộp</th>
              <th className="th text-right">Số tiền</th>
              <th className="th text-right">Đã nộp</th>
              <th className="th text-right">Còn nợ</th>
              <th className="th">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => {
              const paid = invoicePaid(i.id, state)
              const debt = i.amount - paid
              return (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="td font-medium text-navy-800">{i.id}</td>
                  <td className="td">{i.title}</td>
                  <td className="td">{date(i.dueDate)}</td>
                  <td className="td text-right">{money(i.amount)}</td>
                  <td className="td text-right">{money(paid)}</td>
                  <td className={`td text-right font-semibold ${debt ? 'text-red-600' : 'text-slate-400'}`}>{money(debt)}</td>
                  <td className="td">{debt ? <Badge tone={paid ? 'amber' : 'red'}>{paid ? 'Nộp một phần' : 'Chưa nộp'}</Badge> : <Badge tone="green">Đã hoàn thành</Badge>}</td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      </Card>

      <Card>
        <CardHeader title="Lịch sử nộp tiền" />
        <TableWrap>
          <thead>
            <tr>
              <th className="th">Số biên lai</th>
              <th className="th">Ngày nộp</th>
              <th className="th">Khoản thu</th>
              <th className="th text-right">Số tiền</th>
              <th className="th">Hình thức</th>
              <th className="th">Người thu</th>
              <th className="th">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="td font-medium text-navy-800">{p.id}</td>
                <td className="td">{date(p.date)}</td>
                <td className="td">{state.invoices.find((i) => i.id === p.invoiceId)?.title}</td>
                <td className="td text-right font-semibold">{money(p.amount)}</td>
                <td className="td">{p.method}</td>
                <td className="td">{p.collector}</td>
                <td className="td text-slate-500">{p.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        {!payments.length && <EmptyState>Chưa có lần nộp nào.</EmptyState>}
      </Card>
    </>
  )
}
