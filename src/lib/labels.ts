import type { BadgeTone } from '../components/ui/Badge'
import type { AdmissionStatus, Level, StudentStatus } from '../types'

export const ADMISSION_STATUS: Record<AdmissionStatus, { label: string; tone: BadgeTone }> = {
  cho_duyet: { label: 'Chờ duyệt', tone: 'amber' },
  trung_tuyen: { label: 'Trúng tuyển', tone: 'blue' },
  nhap_hoc: { label: 'Nhập học', tone: 'green' },
  tu_choi: { label: 'Từ chối', tone: 'gray' },
}

export const LEVEL_TONE: Record<Level, BadgeTone> = { DH: 'navy', THS: 'teal', TS: 'blue' }

export const STUDENT_STATUS_TONE: Record<StudentStatus, BadgeTone> = {
  'Đang học': 'green',
  'Cảnh báo học vụ': 'amber',
  'Bảo lưu': 'gray',
}
