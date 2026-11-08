import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Role } from '../types'

export interface SessionUser {
  role: Role
  id: string
  name: string
  title: string
}

export const ROLE_USERS: Record<Role, SessionUser> = {
  admin: { role: 'admin', id: 'AD01', name: 'Nguyễn Thị Hạnh', title: 'Quản trị viên · Phòng Đào tạo' },
  lecturer: { role: 'lecturer', id: 'GV01', name: 'TS. Nguyễn Văn An', title: 'Giảng viên · Khoa CNTT' },
  accountant: { role: 'accountant', id: 'KT01', name: 'Trương Thị Mai', title: 'Kế toán · Phòng Tài chính' },
  student: { role: 'student', id: 'DH23CN001', name: 'Nguyễn Hoàng Minh', title: 'Học viên · DH23CN001' },
}

export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  lecturer: '/giang-vien',
  accountant: '/ke-toan',
  student: '/hoc-vien',
}

const KEY = 'erp-dao-tao:session'

interface AuthValue {
  user: SessionUser | null
  login: (role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

function readSession(): SessionUser | null {
  const role = localStorage.getItem(KEY) as Role | null
  return role && role in ROLE_USERS ? ROLE_USERS[role] : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readSession)

  const login = useCallback((role: Role) => {
    localStorage.setItem(KEY, role)
    setUser(ROLE_USERS[role])
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
