import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PieChart,
  PlugZap,
  Receipt,
  Sparkles,
  UserRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '../../types'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  title: string
}

export const NAV: Record<Role, NavItem[]> = {
  admin: [
    { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, title: 'Tổng quan toàn trường' },
    { to: '/admin/tuyen-sinh', label: 'Quản lý tuyển sinh', icon: ClipboardList, title: 'Quản lý hồ sơ tuyển sinh' },
    { to: '/admin/mon-hoc', label: 'Quản lý môn học', icon: BookOpen, title: 'Danh mục môn học' },
    { to: '/admin/cai-dat', label: 'Cài đặt tích hợp', icon: PlugZap, title: 'Cài đặt tích hợp OpenAI & Muse' },
  ],
  lecturer: [
    { to: '/giang-vien', label: 'Lịch giảng dạy', icon: CalendarDays, title: 'Lịch giảng dạy & lớp phụ trách' },
    { to: '/giang-vien/so-diem', label: 'Sổ nhập điểm', icon: FileText, title: 'Sổ nhập điểm học phần' },
    { to: '/giang-vien/de-thi', label: 'Soạn đề thi AI', icon: Sparkles, title: 'Soạn đề thi thông minh với OpenAI' },
  ],
  accountant: [
    { to: '/ke-toan', label: 'Theo dõi học phí', icon: Receipt, title: 'Công nợ học phí học viên' },
    { to: '/ke-toan/thu-lao', label: 'Thù lao giảng viên', icon: Wallet, title: 'Bảng kê thù lao giờ dạy' },
    { to: '/ke-toan/bao-cao', label: 'Báo cáo tài chính', icon: PieChart, title: 'Báo cáo thu chi theo ngành' },
  ],
  student: [
    { to: '/hoc-vien', label: 'Hồ sơ học vụ', icon: UserRound, title: 'Lý lịch học viên' },
    { to: '/hoc-vien/thoi-khoa-bieu', label: 'Thời khóa biểu', icon: CalendarDays, title: 'Thời khóa biểu học kỳ' },
    { to: '/hoc-vien/bang-diem', label: 'Kết quả học tập', icon: GraduationCap, title: 'Bảng điểm & GPA' },
    { to: '/hoc-vien/hoc-phi', label: 'Tài chính học viên', icon: Wallet, title: 'Học phí & lịch sử nộp' },
  ],
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Quản trị viên',
  lecturer: 'Giảng viên',
  accountant: 'Kế toán',
  student: 'Học viên',
}
