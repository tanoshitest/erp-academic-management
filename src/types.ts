export type Role = 'admin' | 'lecturer' | 'accountant' | 'student'

export type Level = 'DH' | 'THS' | 'TS'

export type MajorCode = 'CNTT' | 'QTKD' | 'KT' | 'LKT' | 'NNA'

export interface Major {
  code: MajorCode
  name: string
  faculty: string
}

export type StudentStatus = 'Đang học' | 'Cảnh báo học vụ' | 'Bảo lưu'

export interface Student {
  id: string
  name: string
  gender: 'Nam' | 'Nữ'
  dob: string
  level: Level
  major: MajorCode
  cohort: string
  homeClass: string
  email: string
  phone: string
  status: StudentStatus
  advisor: string
}

export type Degree = 'ThS' | 'TS' | 'PGS.TS' | 'GS.TS'

export interface Lecturer {
  id: string
  name: string
  degree: Degree
  faculty: string
  email: string
}

export interface Course {
  code: string
  name: string
  credits: number
  major: MajorCode
  level: Level
}

export interface Slot {
  day: number
  start: number
  periods: number
  room: string
}

export interface Section {
  id: string
  code: string
  courseCode: string
  lecturerId: string
  semester: string
  studentIds: string[]
  slots: Slot[]
  plannedPeriods: number
  taughtPeriods: number
}

export interface GradeEntry {
  cc: number | null
  gk: number | null
  ck: number | null
}

export type Grades = Record<string, Record<string, GradeEntry>>

export type AdmissionStatus = 'cho_duyet' | 'trung_tuyen' | 'nhap_hoc' | 'tu_choi'

export interface Admission {
  id: string
  name: string
  gender: 'Nam' | 'Nữ'
  level: Level
  major: MajorCode
  score: number
  submittedAt: string
  phone: string
  status: AdmissionStatus
  studentId?: string
}

export interface Invoice {
  id: string
  studentId: string
  semester: string
  title: string
  amount: number
  dueDate: string
}

export type PaymentMethod = 'Tiền mặt' | 'Chuyển khoản' | 'Quẹt thẻ POS'

export interface Payment {
  id: string
  studentId: string
  invoiceId: string
  amount: number
  date: string
  method: PaymentMethod
  collector: string
  note: string
}

export interface LecturerPayout {
  lecturerId: string
  semester: string
  amount: number
  paidAt: string
}

export interface AcademicState {
  students: Student[]
  lecturers: Lecturer[]
  courses: Course[]
  sections: Section[]
  grades: Grades
  admissions: Admission[]
  invoices: Invoice[]
  payments: Payment[]
  payouts: LecturerPayout[]
}
