import { CURRENT_SEMESTER } from '../data/schedule'
import { LEVEL_LABEL, majorName } from '../data/students'
import { finalScore, letter } from '../lib/grades'
import { studentBalance } from '../lib/finance'
import type { AcademicState } from '../types'

export const MUSE_DATASETS = ['admissions', 'students', 'grades', 'finance'] as const
export type MuseDataset = (typeof MUSE_DATASETS)[number]

export const MUSE_DATASET_LABEL: Record<MuseDataset, string> = {
  admissions: 'Hồ sơ tuyển sinh',
  students: 'Danh sách học viên',
  grades: 'Kết quả học tập',
  finance: 'Công nợ học phí',
}

const ADMISSION_LABEL = { cho_duyet: 'Chờ duyệt', trung_tuyen: 'Trúng tuyển', nhap_hoc: 'Nhập học', tu_choi: 'Từ chối' }

const envelope = <T,>(dataset: MuseDataset, records: T[]) => ({
  dataset,
  source: 'erp-dao-tao',
  schemaVersion: 1,
  semester: CURRENT_SEMESTER,
  generatedAt: new Date().toISOString(),
  count: records.length,
  records,
})

export function buildMuseDatasets(state: AcademicState) {
  return {
    admissions: envelope(
      'admissions',
      state.admissions.map((a) => ({
        application_id: a.id,
        full_name: a.name,
        program_level: LEVEL_LABEL[a.level],
        major: majorName(a.major),
        entry_score: a.score,
        submitted_at: a.submittedAt,
        status: ADMISSION_LABEL[a.status],
        student_id: a.studentId ?? null,
      })),
    ),
    students: envelope(
      'students',
      state.students.map((s) => ({
        student_id: s.id,
        full_name: s.name,
        gender: s.gender,
        program_level: LEVEL_LABEL[s.level],
        major: majorName(s.major),
        cohort: s.cohort,
        home_class: s.homeClass,
        academic_status: s.status,
      })),
    ),
    grades: envelope(
      'grades',
      state.sections.flatMap((sec) => {
        const course = state.courses.find((c) => c.code === sec.courseCode)
        return sec.studentIds.map((id) => {
          const g = state.grades[sec.id]?.[id]
          const total = finalScore(g)
          return {
            student_id: id,
            section_code: sec.code,
            course_code: sec.courseCode,
            course_name: course?.name ?? '',
            credits: course?.credits ?? 0,
            semester: sec.semester,
            attendance: g?.cc ?? null,
            midterm: g?.gk ?? null,
            final_exam: g?.ck ?? null,
            total_10: total,
            letter: letter(total)?.letter ?? null,
          }
        })
      }),
    ),
    finance: envelope(
      'finance',
      state.students.map((s) => {
        const b = studentBalance(s.id, state)
        return {
          student_id: s.id,
          full_name: s.name,
          program_level: LEVEL_LABEL[s.level],
          major: majorName(s.major),
          amount_due: b.due,
          amount_paid: b.paid,
          outstanding: b.debt,
          currency: 'VND',
        }
      }),
    ),
  }
}

export function downloadJson(fileName: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
