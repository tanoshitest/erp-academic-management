import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ENROLLMENT_FEE } from '../data/finances'
import { CURRENT_SEMESTER } from '../data/schedule'
import { createSeedState } from '../data/seed'
import { MAJORS } from '../data/students'
import type { AcademicState, Admission, AdmissionStatus, Course, GradeEntry, MajorCode, Payment, Student } from '../types'

const KEY = 'erp-dao-tao:data:v1'

const MAJOR_SHORT: Record<MajorCode, string> = { CNTT: 'CN', QTKD: 'QT', KT: 'KT', LKT: 'LK', NNA: 'NA' }

function load(): AcademicState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as AcademicState
  } catch {
    localStorage.removeItem(KEY)
  }
  return createSeedState()
}

function newStudentId(a: Admission, students: Student[]) {
  const prefix = a.level === 'DH' ? 'DH26' : a.level === 'THS' ? 'CH26' : 'NCS26'
  const base = `${prefix}${MAJOR_SHORT[a.major]}`
  const width = a.level === 'TS' ? 2 : 3
  const used = students.filter((s) => s.id.startsWith(base)).length
  return `${base}${String(used + 1).padStart(width, '0')}`
}

function enroll(state: AcademicState, a: Admission): AcademicState {
  const id = newStudentId(a, state.students)
  const advisor = state.students.find((s) => s.major === a.major)?.advisor ?? ''
  const year = a.level === 'DH' ? 'Khóa 2026–2030' : a.level === 'THS' ? 'Khóa 2026–2028' : 'Khóa 2026–2030'
  const student: Student = {
    id,
    name: a.name,
    gender: a.gender,
    dob: '',
    level: a.level,
    major: a.major,
    cohort: year,
    homeClass: a.level === 'DH' ? `26${a.major}1` : a.level === 'THS' ? `CH26${a.major}` : 'NCS26',
    email: `${id.toLowerCase()}@st.edu.vn`,
    phone: a.phone,
    status: 'Đang học',
    advisor,
  }
  return {
    ...state,
    students: [...state.students, student],
    invoices: [
      ...state.invoices,
      {
        id: `NH-${id}`,
        studentId: id,
        semester: CURRENT_SEMESTER,
        title: `Học phí nhập học ${MAJORS.find((m) => m.code === a.major)?.name ?? ''}`,
        amount: ENROLLMENT_FEE[a.level],
        dueDate: '2026-11-30',
      },
    ],
    admissions: state.admissions.map((x) => (x.id === a.id ? { ...x, status: 'nhap_hoc', studentId: id } : x)),
  }
}

interface AcademicValue {
  state: AcademicState
  setAdmissionStatus: (id: string, status: AdmissionStatus) => void
  addCourse: (course: Course) => void
  setGrade: (sectionId: string, studentId: string, field: keyof GradeEntry, value: number | null) => void
  addPayment: (payment: Omit<Payment, 'id'>) => Payment
  confirmPayout: (lecturerId: string, amount: number, paidAt: string) => void
  reset: () => void
}

const AcademicContext = createContext<AcademicValue | null>(null)

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AcademicState>(load)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const setAdmissionStatus = useCallback((id: string, status: AdmissionStatus) => {
    setState((s) => {
      const a = s.admissions.find((x) => x.id === id)
      if (!a) return s
      if (status === 'nhap_hoc') return a.status === 'nhap_hoc' ? s : enroll(s, a)
      return { ...s, admissions: s.admissions.map((x) => (x.id === id ? { ...x, status } : x)) }
    })
  }, [])

  const addCourse = useCallback((course: Course) => {
    setState((s) => ({ ...s, courses: [...s.courses, course] }))
  }, [])

  const setGrade = useCallback((sectionId: string, studentId: string, field: keyof GradeEntry, value: number | null) => {
    setState((s) => {
      const sec = s.grades[sectionId] ?? {}
      const cur = sec[studentId] ?? { cc: null, gk: null, ck: null }
      return { ...s, grades: { ...s.grades, [sectionId]: { ...sec, [studentId]: { ...cur, [field]: value } } } }
    })
  }, [])

  const addPayment = useCallback((p: Omit<Payment, 'id'>) => {
    const max = stateRef.current.payments.reduce((m, x) => Math.max(m, Number(x.id.slice(2)) || 0), 0)
    const created: Payment = { ...p, id: `BL${String(max + 1).padStart(5, '0')}` }
    stateRef.current = { ...stateRef.current, payments: [...stateRef.current.payments, created] }
    setState((s) => ({ ...s, payments: [...s.payments, created] }))
    return created
  }, [])

  const confirmPayout = useCallback((lecturerId: string, amount: number, paidAt: string) => {
    setState((s) => ({
      ...s,
      payouts: [...s.payouts.filter((p) => !(p.lecturerId === lecturerId && p.semester === CURRENT_SEMESTER)), { lecturerId, semester: CURRENT_SEMESTER, amount, paidAt }],
    }))
  }, [])

  const reset = useCallback(() => setState(createSeedState()), [])

  const value = useMemo(
    () => ({ state, setAdmissionStatus, addCourse, setGrade, addPayment, confirmPayout, reset }),
    [state, setAdmissionStatus, addCourse, setGrade, addPayment, confirmPayout, reset],
  )
  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>
}

export function useAcademic() {
  const ctx = useContext(AcademicContext)
  if (!ctx) throw new Error('useAcademic must be used inside AcademicProvider')
  return ctx
}
