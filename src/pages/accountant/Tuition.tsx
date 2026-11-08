import { AlertCircle, CircleDollarSign, Printer, Receipt, Users, Wallet } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { EmptyState, SearchInput, Segmented, Toolbar } from '../../components/common/Controls'
import { ReceiptView } from '../../components/common/ReceiptView'
import { StatCard, StatGrid } from '../../components/common/StatCard'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, TableWrap } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { useAcademic } from '../../context/AcademicContext'
import { useAuth } from '../../context/AuthContext'
import { LEVEL_SHORT, majorName } from '../../data/students'
import { invoicePaid, studentBalance } from '../../lib/finance'
import { date, money, normalize, num, todayIso } from '../../lib/format'
import { LEVEL_TONE } from '../../lib/labels'
import type { Level, Payment, PaymentMethod, Student } from '../../types'

type View = 'debts' | 'receipts'
type Filter = 'all' | 'debt' | 'paid'
const METHODS: PaymentMethod[] = ['Chuyển khoản', 'Tiền mặt', 'Quẹt thẻ POS']

interface Draft {
  invoiceId: string
  amount: string
  method: PaymentMethod
  date: string
  note: string
}

export function Tuition() {
  const { state, addPayment } = useAcademic()
  const { user } = useAuth()
  const [view, setView] = useState<View>('debts')
  const [filter, setFilter] = useState<Filter>('all')
  const [level, setLevel] = useState<'all' | Level>('all')
  const [q, setQ] = useState('')
  const [target, setTarget] = useState<Student | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState('')
  const [shown, setShown] = useState<Payment | null>(null)

  const balances = useMemo(() => state.students.map((s) => ({ student: s, ...studentBalance(s.id, state) })), [state])
  const totals = balances.reduce((t, b) => ({ due: t.due + b.due, paid: t.paid + b.paid, debt: t.debt + b.debt }), { due: 0, paid: 0, debt: 0 })
  const debtors = balances.filter((b) => b.debt > 0).length
  const match = (s: Student) => !q || normalize(`${s.id} ${s.name}`).includes(normalize(q))

  const rows = balances
    .filter((b) => level === 'all' || b.student.level === level)
    .filter((b) => filter === 'all' || (filter === 'debt' ? b.debt > 0 : b.debt === 0))
    .filter((b) => match(b.student))
    .sort((a, b) => b.debt - a.debt || a.student.id.localeCompare(b.student.id))

  const receipts = [...state.payments]
    .reverse()
    .filter((p) => {
      const s = state.students.find((x) => x.id === p.studentId)
      return s && (level === 'all' || s.level === level) && match(s)
    })

  const openInvoices = (studentId: string) =>
    state.invoices.filter((i) => i.studentId === studentId).map((i) => ({ ...i, remaining: i.amount - invoicePaid(i.id, state) })).filter((i) => i.remaining > 0)

  const startReceipt = (s: Student) => {
    const inv = openInvoices(s.id)[0]
    setTarget(s)
    setError('')
    setDraft({ invoiceId: inv?.id ?? '', amount: inv ? num(inv.remaining) : '', method: 'Chuyển khoản', date: todayIso(), note: '' })
  }

  const close = () => {
    setTarget(null)
    setDraft(null)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!target || !draft) return
    const inv = openInvoices(target.id).find((i) => i.id === draft.invoiceId)
    const amount = Number(draft.amount.replace(/\D/g, ''))
    if (!inv) return setError('Chọn khoản thu.')
    if (!amount) return setError('Nhập số tiền thu.')
    if (amount > inv.remaining) return setError(`Số tiền vượt quá số còn nợ của khoản này (${money(inv.remaining)}).`)
    const created = addPayment({ studentId: target.id, invoiceId: inv.id, amount, date: draft.date, method: draft.method, collector: user?.name ?? 'Kế toán', note: draft.note.trim() })
    close()
    setShown(created)
  }

  const shownStudent = shown && state.students.find((s) => s.id === shown.studentId)
  const shownInvoice = shown ? state.invoices.find((i) => i.id === shown.invoiceId) : undefined
  const choices = target ? openInvoices(target.id) : []

  return (
    <>
      <StatGrid>
        <StatCard icon={CircleDollarSign} label="Tổng phải thu" value={money(totals.due)} sub={`${state.invoices.length} khoản thu`} />
        <StatCard icon={Wallet} accent="teal" label="Đã thu" value={money(totals.paid)} sub={`${state.payments.length} biên lai`} />
        <StatCard icon={AlertCircle} accent="red" label="Còn nợ" value={money(totals.debt)} sub={`${Math.round((totals.debt / (totals.due || 1)) * 100)}% tổng phải thu`} />
        <StatCard icon={Users} accent="amber" label="Học viên còn nợ" value={`${debtors}/${state.students.length}`} sub="Cần nhắc nộp học phí" />
      </StatGrid>

      <Toolbar
        left={
          <>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: 'debts', label: 'Công nợ học viên' },
                { value: 'receipts', label: 'Biên lai đã lập', count: state.payments.length },
              ]}
            />
            {view === 'debts' && (
              <Segmented
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'debt', label: 'Còn nợ', count: debtors },
                  { value: 'paid', label: 'Đã đóng đủ', count: state.students.length - debtors },
                ]}
              />
            )}
            <select className="input w-36" value={level} onChange={(e) => setLevel(e.target.value as 'all' | Level)} aria-label="Hệ đào tạo">
              <option value="all">Mọi hệ</option>
              <option value="DH">Đại học</option>
              <option value="THS">Thạc sĩ</option>
              <option value="TS">Tiến sĩ</option>
            </select>
          </>
        }
        right={<SearchInput value={q} onChange={setQ} placeholder="Tìm theo MSSV hoặc họ tên" />}
      />

      <Card>
        {view === 'debts' ? (
          <>
            <TableWrap>
              <thead>
                <tr>
                  <th className="th">MSSV</th>
                  <th className="th">Họ và tên</th>
                  <th className="th">Hệ</th>
                  <th className="th">Ngành</th>
                  <th className="th text-right">Phải thu</th>
                  <th className="th text-right">Đã thu</th>
                  <th className="th text-right">Còn nợ</th>
                  <th className="th">Trạng thái</th>
                  <th className="th text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ student: s, due, paid, debt }) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="td font-medium text-navy-800">{s.id}</td>
                    <td className="td">{s.name}</td>
                    <td className="td"><Badge tone={LEVEL_TONE[s.level]}>{LEVEL_SHORT[s.level]}</Badge></td>
                    <td className="td">{majorName(s.major)}</td>
                    <td className="td text-right">{money(due)}</td>
                    <td className="td text-right">{money(paid)}</td>
                    <td className={`td text-right font-semibold ${debt ? 'text-red-600' : 'text-slate-400'}`}>{money(debt)}</td>
                    <td className="td">{debt ? <Badge tone={paid ? 'amber' : 'red'}>{paid ? 'Nộp một phần' : 'Chưa nộp'}</Badge> : <Badge tone="green">Đã đóng đủ</Badge>}</td>
                    <td className="td text-right">
                      <Button size="sm" onClick={() => startReceipt(s)} disabled={!debt}>
                        <Receipt size={14} /> Tạo biên lai thu tiền
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            {!rows.length && <EmptyState>Không tìm thấy học viên phù hợp.</EmptyState>}
          </>
        ) : (
          <>
            <TableWrap>
              <thead>
                <tr>
                  <th className="th">Số biên lai</th>
                  <th className="th">Ngày thu</th>
                  <th className="th">MSSV</th>
                  <th className="th">Họ và tên</th>
                  <th className="th">Khoản thu</th>
                  <th className="th text-right">Số tiền</th>
                  <th className="th">Hình thức</th>
                  <th className="th">Người thu</th>
                  <th className="th text-right" />
                </tr>
              </thead>
              <tbody>
                {receipts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="td font-medium text-navy-800">{p.id}</td>
                    <td className="td">{date(p.date)}</td>
                    <td className="td">{p.studentId}</td>
                    <td className="td">{state.students.find((s) => s.id === p.studentId)?.name}</td>
                    <td className="td max-w-[260px] truncate" title={state.invoices.find((i) => i.id === p.invoiceId)?.title}>
                      {state.invoices.find((i) => i.id === p.invoiceId)?.title}
                    </td>
                    <td className="td text-right font-semibold">{money(p.amount)}</td>
                    <td className="td">{p.method}</td>
                    <td className="td">{p.collector}</td>
                    <td className="td text-right">
                      <Button size="sm" variant="secondary" onClick={() => setShown(p)}>
                        <Printer size={14} /> Xem / In
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            {!receipts.length && <EmptyState>Chưa có biên lai phù hợp.</EmptyState>}
          </>
        )}
      </Card>

      <Modal
        open={!!target}
        onOpenChange={(o) => !o && close()}
        title="Tạo biên lai thu tiền"
        description={target ? `${target.name} · ${target.id}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Hủy
            </Button>
            <Button type="submit" form="receipt-form">
              <Receipt size={15} /> Lập biên lai
            </Button>
          </>
        }
      >
        {draft && (
          <form id="receipt-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Khoản thu" className="sm:col-span-2">
              <select
                className="input"
                value={draft.invoiceId}
                onChange={(e) => {
                  const inv = choices.find((i) => i.id === e.target.value)
                  setDraft({ ...draft, invoiceId: e.target.value, amount: inv ? num(inv.remaining) : draft.amount })
                }}
              >
                {choices.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title} — còn nợ {money(i.remaining)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Số tiền thu (₫)">
              <input
                className="input text-right font-semibold"
                inputMode="numeric"
                value={draft.amount}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '')
                  setDraft({ ...draft, amount: digits ? num(Number(digits)) : '' })
                }}
                autoFocus
              />
            </Field>
            <Field label="Ngày thu">
              <input className="input" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Hình thức thanh toán">
              <select className="input" value={draft.method} onChange={(e) => setDraft({ ...draft, method: e.target.value as PaymentMethod })}>
                {METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Ghi chú">
              <input className="input" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="Không bắt buộc" />
            </Field>
            {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          </form>
        )}
      </Modal>

      <Modal
        open={!!shown}
        onOpenChange={(o) => !o && setShown(null)}
        title="Biên lai thu tiền"
        width="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShown(null)}>
              Đóng
            </Button>
            <Button onClick={() => window.print()}>
              <Printer size={15} /> In biên lai
            </Button>
          </>
        }
      >
        {shown && shownStudent && <ReceiptView payment={shown} student={shownStudent} invoice={shownInvoice} />}
      </Modal>
    </>
  )
}
