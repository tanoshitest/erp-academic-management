import { BookOpenCheck, Calculator, GraduationCap, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROLE_HOME, ROLE_USERS, useAuth } from '../context/AuthContext'
import type { Role } from '../types'

interface RoleCard {
  role: Role
  label: string
  icon: LucideIcon
  color: string
  desc: string
}

const CARDS: RoleCard[] = [
  { role: 'admin', label: 'Quản Trị Viên (Admin)', icon: ShieldCheck, color: 'bg-navy-800 hover:bg-navy-700', desc: 'Dashboard toàn trường, hồ sơ tuyển sinh, danh mục môn học, cài đặt API.' },
  { role: 'lecturer', label: 'Giảng Viên', icon: BookOpenCheck, color: 'bg-blue-700 hover:bg-blue-800', desc: 'Lịch giảng dạy, lớp phụ trách, sổ nhập điểm, soạn đề thi với OpenAI.' },
  { role: 'accountant', label: 'Kế Toán', icon: Calculator, color: 'bg-teal-700 hover:bg-teal-800', desc: 'Công nợ học phí, lập biên lai thu tiền, bảng kê thù lao giảng viên.' },
  { role: 'student', label: 'Học Viên', icon: UserRound, color: 'bg-slate-600 hover:bg-slate-700', desc: 'Hồ sơ học vụ, thời khóa biểu, bảng điểm cá nhân, tra cứu học phí.' },
]

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const enter = (role: Role) => {
    login(role)
    navigate(ROLE_HOME[role], { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-100">
      <div className="h-1.5 bg-navy-800" />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-navy-800 text-white">
              <GraduationCap size={30} />
            </div>
            <h1 className="text-2xl font-bold leading-tight text-navy-800 sm:text-3xl">Hệ Thống Quản Lý Đào Tạo Đại Học & Sau Đại Học</h1>
            <p className="mt-2 text-sm text-slate-500">Chọn vai trò để đăng nhập nhanh vào bản trải nghiệm MVP</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {CARDS.map((c) => (
              <button
                key={c.role}
                type="button"
                onClick={() => enter(c.role)}
                className={`group flex items-start gap-4 rounded-lg p-5 text-left text-white transition ${c.color} focus:outline-none focus-visible:ring-4 focus-visible:ring-navy-200`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/15">
                  <c.icon size={26} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">Đăng nhập với vai trò</p>
                  <p className="mt-0.5 text-lg font-semibold">{c.label}</p>
                  <p className="mt-1.5 text-sm leading-snug text-white/80">{c.desc}</p>
                  <p className="mt-3 text-xs text-white/60">Tài khoản demo: {ROLE_USERS[c.role].name}</p>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">Built with Tanoshi Vietnam.</p>
        </div>
      </main>
    </div>
  )
}
