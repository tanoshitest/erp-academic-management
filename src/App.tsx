import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ROLE_HOME, useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { LecturerPay } from './pages/accountant/LecturerPay'
import { Reports } from './pages/accountant/Reports'
import { Tuition } from './pages/accountant/Tuition'
import { Admissions } from './pages/admin/Admissions'
import { Courses } from './pages/admin/Courses'
import { Dashboard } from './pages/admin/Dashboard'
import { Settings } from './pages/admin/Settings'
import { ExamGenerator } from './pages/lecturer/ExamGenerator'
import { Gradebook } from './pages/lecturer/Gradebook'
import { TeachingSchedule } from './pages/lecturer/TeachingSchedule'
import { StudentFinance } from './pages/student/StudentFinance'
import { StudentProfile } from './pages/student/StudentProfile'
import { StudentTimetable } from './pages/student/StudentTimetable'
import { Transcript } from './pages/student/Transcript'
import type { Role } from './types'

function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role]} replace />
  return <AppShell />
}

function Home() {
  const { user } = useAuth()
  return <Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={ROLE_HOME[user.role]} replace /> : <Login />} />
      <Route path="/admin" element={<RequireRole role="admin" />}>
        <Route index element={<Dashboard />} />
        <Route path="tuyen-sinh" element={<Admissions />} />
        <Route path="mon-hoc" element={<Courses />} />
        <Route path="cai-dat" element={<Settings />} />
      </Route>
      <Route path="/giang-vien" element={<RequireRole role="lecturer" />}>
        <Route index element={<TeachingSchedule />} />
        <Route path="so-diem" element={<Gradebook />} />
        <Route path="de-thi" element={<ExamGenerator />} />
      </Route>
      <Route path="/ke-toan" element={<RequireRole role="accountant" />}>
        <Route index element={<Tuition />} />
        <Route path="thu-lao" element={<LecturerPay />} />
        <Route path="bao-cao" element={<Reports />} />
      </Route>
      <Route path="/hoc-vien" element={<RequireRole role="student" />}>
        <Route index element={<StudentProfile />} />
        <Route path="thoi-khoa-bieu" element={<StudentTimetable />} />
        <Route path="bang-diem" element={<Transcript />} />
        <Route path="hoc-phi" element={<StudentFinance />} />
      </Route>
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
