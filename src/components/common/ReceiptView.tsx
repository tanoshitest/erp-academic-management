import { GraduationCap } from 'lucide-react'
import { LEVEL_LABEL, majorName } from '../../data/students'
import { date, money } from '../../lib/format'
import { moneyInWords } from '../../lib/moneyWords'
import type { Invoice, Payment, Student } from '../../types'

export function ReceiptView({ payment, student, invoice }: { payment: Payment; student: Student; invoice?: Invoice }) {
  const rows: [string, string][] = [
    ['Họ và tên người nộp', student.name],
    ['Mã số học viên', student.id],
    ['Hệ / Ngành', `${LEVEL_LABEL[student.level]} · ${majorName(student.major)}`],
    ['Nội dung thu', invoice?.title ?? payment.invoiceId],
    ['Hình thức thanh toán', payment.method],
  ]
  return (
    <div className="print-area rounded-md border border-slate-300 bg-white p-6 text-slate-800">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-800 text-white">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-sm font-bold text-navy-800">TRƯỜNG ĐẠI HỌC – PHÒNG KẾ TOÁN</p>
            <p className="text-xs text-slate-500">Hệ thống ERP Đào tạo</p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>
            Số: <b className="text-slate-800">{payment.id}</b>
          </p>
          <p>Ngày: {date(payment.date)}</p>
        </div>
      </div>
      <h3 className="mt-5 text-center text-xl font-bold tracking-wide text-navy-800">BIÊN LAI THU TIỀN</h3>
      <dl className="mt-5 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[170px_1fr] gap-2">
            <dt className="text-slate-500">{k}:</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
        <div className="grid grid-cols-[170px_1fr] gap-2">
          <dt className="text-slate-500">Số tiền:</dt>
          <dd className="text-lg font-bold text-navy-800">{money(payment.amount)}</dd>
        </div>
        <div className="grid grid-cols-[170px_1fr] gap-2">
          <dt className="text-slate-500">Bằng chữ:</dt>
          <dd className="italic">{moneyInWords(payment.amount)}</dd>
        </div>
        {payment.note && (
          <div className="grid grid-cols-[170px_1fr] gap-2">
            <dt className="text-slate-500">Ghi chú:</dt>
            <dd>{payment.note}</dd>
          </div>
        )}
      </dl>
      <div className="mt-8 grid grid-cols-2 text-center text-sm">
        <div>
          <p className="font-semibold">Người nộp tiền</p>
          <p className="text-xs text-slate-400">(Ký, ghi rõ họ tên)</p>
          <p className="mt-12 font-medium">{student.name}</p>
        </div>
        <div>
          <p className="font-semibold">Người thu tiền</p>
          <p className="text-xs text-slate-400">(Ký, ghi rõ họ tên)</p>
          <p className="mt-12 font-medium">{payment.collector}</p>
        </div>
      </div>
    </div>
  )
}
