import { ArrowLeftRight, GraduationCap, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CURRENT_SEMESTER } from '../../data/schedule'
import { NAV, ROLE_LABEL } from './nav'

const FIXED_TOP_ROUTES = ['/ke-toan', '/ke-toan/thu-lao', '/admin/tuyen-sinh', '/admin/mon-hoc']

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [drawer, setDrawer] = useState(false)

  useEffect(() => setDrawer(false), [pathname])

  if (!user) return null
  const items = NAV[user.role]
  const current = [...items].sort((a, b) => b.to.length - a.to.length).find((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))

  const switchRole = () => {
    logout()
    navigate('/login')
  }

  const sidebar = (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-800 text-white">
          <GraduationCap size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-navy-800">ERP Đào Tạo</p>
          <p className="truncate text-[11px] text-slate-500">Đại học & Sau Đại học</p>
        </div>
      </div>
      <div className="px-3 pb-2 pt-4">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{ROLE_LABEL[user.role]}</p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {items.map((item) => {
          const active = current?.to === item.to
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                active ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-navy-800'
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-50 text-sm font-semibold text-navy-800">
            {user.name.split(' ').pop()?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="truncate text-[11px] text-slate-500">{user.title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={switchRole}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-navy-800"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-dvh overflow-hidden">
      <div className="hidden lg:flex">{sidebar}</div>
      {drawer && (
        <div className="fixed inset-0 z-30 flex lg:hidden">
          <div className="relative">{sidebar}</div>
          <button type="button" className="flex-1 bg-navy-900/40" aria-label="Đóng menu" onClick={() => setDrawer(false)} />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
          <button type="button" className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setDrawer((v) => !v)} aria-label="Mở menu">
            {drawer ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-navy-800 lg:text-lg">{current?.title}</h1>
            <p className="hidden truncate text-xs text-slate-500 sm:block">Năm học 2026–2027 · {CURRENT_SEMESTER}</p>
          </div>
          <button
            type="button"
            onClick={switchRole}
            className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeftRight size={16} />
            <span className="hidden sm:inline">Đổi vai trò</span>
          </button>
        </header>
        <main className={`min-h-0 flex-1 ${FIXED_TOP_ROUTES.includes(pathname) ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {FIXED_TOP_ROUTES.includes(pathname) ? (
            <Outlet />
          ) : (
            <div className="space-y-5 p-4 lg:p-6">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
