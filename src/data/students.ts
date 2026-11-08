import type { Admission, Lecturer, Level, Major, MajorCode, Student } from '../types'

export const MAJORS: Major[] = [
  { code: 'CNTT', name: 'Công nghệ thông tin', faculty: 'Khoa Công nghệ thông tin' },
  { code: 'QTKD', name: 'Quản trị kinh doanh', faculty: 'Khoa Quản trị kinh doanh' },
  { code: 'KT', name: 'Kế toán', faculty: 'Khoa Kế toán – Tài chính' },
  { code: 'LKT', name: 'Luật kinh tế', faculty: 'Khoa Luật' },
  { code: 'NNA', name: 'Ngôn ngữ Anh', faculty: 'Khoa Ngoại ngữ' },
]

export const LEVEL_LABEL: Record<Level, string> = {
  DH: 'Đại học',
  THS: 'Thạc sĩ',
  TS: 'Tiến sĩ',
}

export const LEVEL_SHORT: Record<Level, string> = {
  DH: 'ĐH',
  THS: 'ThS',
  TS: 'TS',
}

export const ADMISSION_TARGETS: Record<Level, number> = { DH: 10, THS: 5, TS: 2 }

type Row = [string, string, Student['gender'], string, Level, MajorCode, string, Student['status']?]

const rows: Row[] = [
  ['DH23CN001', 'Nguyễn Hoàng Minh', 'Nam', '2005-03-14', 'DH', 'CNTT', '23CNTT1'],
  ['DH23CN002', 'Trần Thu Trang', 'Nữ', '2005-07-02', 'DH', 'CNTT', '23CNTT1'],
  ['DH23CN003', 'Lê Quang Huy', 'Nam', '2005-11-21', 'DH', 'CNTT', '23CNTT1', 'Cảnh báo học vụ'],
  ['DH23CN004', 'Phạm Ngọc Ánh', 'Nữ', '2005-01-09', 'DH', 'CNTT', '23CNTT1'],
  ['DH23CN005', 'Vũ Đức Thắng', 'Nam', '2005-05-30', 'DH', 'CNTT', '23CNTT1'],
  ['DH23QT001', 'Đặng Thảo Vy', 'Nữ', '2005-02-17', 'DH', 'QTKD', '23QTKD1'],
  ['DH23QT002', 'Bùi Gia Bảo', 'Nam', '2005-08-25', 'DH', 'QTKD', '23QTKD1'],
  ['DH23QT003', 'Ngô Khánh Linh', 'Nữ', '2005-12-03', 'DH', 'QTKD', '23QTKD1'],
  ['DH23QT004', 'Đỗ Tuấn Kiệt', 'Nam', '2005-06-11', 'DH', 'QTKD', '23QTKD1', 'Bảo lưu'],
  ['DH23KT001', 'Hồ Mai Phương', 'Nữ', '2005-04-19', 'DH', 'KT', '23KT1'],
  ['DH23KT002', 'Lý Thanh Tâm', 'Nam', '2005-09-08', 'DH', 'KT', '23KT1'],
  ['DH23KT003', 'Trịnh Bảo Ngọc', 'Nữ', '2005-10-27', 'DH', 'KT', '23KT1'],
  ['DH23LK001', 'Mai Anh Khoa', 'Nam', '2005-03-05', 'DH', 'LKT', '23LKT1'],
  ['DH23LK002', 'Phan Thùy Dung', 'Nữ', '2005-07-16', 'DH', 'LKT', '23LKT1'],
  ['DH23NA001', 'Võ Minh Thư', 'Nữ', '2005-01-28', 'DH', 'NNA', '23NNA1'],
  ['DH23NA002', 'Đinh Hải Nam', 'Nam', '2005-11-12', 'DH', 'NNA', '23NNA1'],
  ['CH25CN001', 'Lương Văn Tài', 'Nam', '1996-06-20', 'THS', 'CNTT', 'CH25CNTT'],
  ['CH25CN002', 'Tạ Thị Hồng', 'Nữ', '1998-02-14', 'THS', 'CNTT', 'CH25CNTT'],
  ['CH25QT001', 'Cao Minh Đức', 'Nam', '1994-09-01', 'THS', 'QTKD', 'CH25QTKD'],
  ['CH25QT002', 'Kiều Phương Thảo', 'Nữ', '1997-12-22', 'THS', 'QTKD', 'CH25QTKD'],
  ['CH25KT001', 'Châu Ngọc Lan', 'Nữ', '1995-05-07', 'THS', 'KT', 'CH25KT'],
  ['CH25KT002', 'Hà Văn Sơn', 'Nam', '1993-08-18', 'THS', 'KT', 'CH25KT'],
  ['NCS25QT01', 'Lâm Quốc Bảo', 'Nam', '1988-04-10', 'TS', 'QTKD', 'NCS25'],
  ['NCS25CN01', 'Doãn Thị Yến', 'Nữ', '1990-10-05', 'TS', 'CNTT', 'NCS25'],
]

const ADVISOR: Record<MajorCode, string> = {
  CNTT: 'TS. Nguyễn Văn An',
  QTKD: 'PGS.TS Trần Thị Bình',
  KT: 'ThS. Lê Minh Châu',
  LKT: 'TS. Phạm Quốc Dũng',
  NNA: 'ThS. Hoàng Thu Hà',
}

const COHORT: Record<Level, string> = { DH: 'Khóa 2023–2027', THS: 'Khóa 2025–2027', TS: 'Khóa 2025–2029' }

export const SEED_STUDENTS: Student[] = rows.map(([id, name, gender, dob, level, major, homeClass, status], i) => ({
  id,
  name,
  gender,
  dob,
  level,
  major,
  cohort: COHORT[level],
  homeClass,
  email: `${id.toLowerCase()}@st.edu.vn`,
  phone: `09${String(12345670 + i * 7919).slice(0, 8)}`,
  status: status ?? 'Đang học',
  advisor: ADVISOR[major],
}))

export const SEED_LECTURERS: Lecturer[] = [
  { id: 'GV01', name: 'TS. Nguyễn Văn An', degree: 'TS', faculty: 'Khoa Công nghệ thông tin', email: 'an.nv@edu.vn' },
  { id: 'GV02', name: 'PGS.TS Trần Thị Bình', degree: 'PGS.TS', faculty: 'Khoa Quản trị kinh doanh', email: 'binh.tt@edu.vn' },
  { id: 'GV03', name: 'ThS. Lê Minh Châu', degree: 'ThS', faculty: 'Khoa Kế toán – Tài chính', email: 'chau.lm@edu.vn' },
  { id: 'GV04', name: 'TS. Phạm Quốc Dũng', degree: 'TS', faculty: 'Khoa Luật', email: 'dung.pq@edu.vn' },
  { id: 'GV05', name: 'ThS. Hoàng Thu Hà', degree: 'ThS', faculty: 'Khoa Ngoại ngữ', email: 'ha.ht@edu.vn' },
  { id: 'GV06', name: 'GS.TS Đỗ Hữu Khang', degree: 'GS.TS', faculty: 'Khoa Quản trị kinh doanh', email: 'khang.dh@edu.vn' },
]

type AdmissionRow = [string, Admission['gender'], Level, MajorCode, number, string, Admission['status']]

const admissionRows: AdmissionRow[] = [
  ['Trần Minh Khôi', 'Nam', 'DH', 'CNTT', 27.5, '2026-10-02', 'nhap_hoc'],
  ['Nguyễn Bảo Châu', 'Nữ', 'DH', 'CNTT', 26.75, '2026-10-03', 'trung_tuyen'],
  ['Lê Hà My', 'Nữ', 'DH', 'QTKD', 25.5, '2026-10-05', 'trung_tuyen'],
  ['Phạm Gia Huy', 'Nam', 'DH', 'KT', 24.25, '2026-10-06', 'cho_duyet'],
  ['Hoàng Anh Thư', 'Nữ', 'DH', 'NNA', 26.0, '2026-10-08', 'cho_duyet'],
  ['Vũ Tiến Đạt', 'Nam', 'DH', 'LKT', 22.5, '2026-10-09', 'tu_choi'],
  ['Đỗ Phương Nhi', 'Nữ', 'DH', 'CNTT', 25.0, '2026-10-12', 'cho_duyet'],
  ['Bùi Quang Vinh', 'Nam', 'DH', 'QTKD', 23.75, '2026-10-14', 'cho_duyet'],
  ['Ngô Thanh Hương', 'Nữ', 'THS', 'QTKD', 8.2, '2026-10-04', 'trung_tuyen'],
  ['Đặng Văn Lực', 'Nam', 'THS', 'CNTT', 7.6, '2026-10-07', 'cho_duyet'],
  ['Trương Mỹ Linh', 'Nữ', 'THS', 'KT', 8.5, '2026-10-10', 'nhap_hoc'],
  ['Phan Đức Mạnh', 'Nam', 'THS', 'QTKD', 6.4, '2026-10-15', 'cho_duyet'],
  ['Lý Hoài Nam', 'Nam', 'TS', 'QTKD', 8.8, '2026-10-11', 'cho_duyet'],
  ['Mạc Thị Quyên', 'Nữ', 'TS', 'CNTT', 8.1, '2026-10-16', 'cho_duyet'],
]

export const SEED_ADMISSIONS: Admission[] = admissionRows.map(([name, gender, level, major, score, submittedAt, status], i) => ({
  id: `HS26${String(i + 1).padStart(3, '0')}`,
  name,
  gender,
  level,
  major,
  score,
  submittedAt,
  phone: `03${String(56781230 + i * 4421).slice(0, 8)}`,
  status,
}))

export const majorName = (code: MajorCode) => MAJORS.find((m) => m.code === code)?.name ?? code
export const majorFaculty = (code: MajorCode) => MAJORS.find((m) => m.code === code)?.faculty ?? code
