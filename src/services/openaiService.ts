import { EXAM_BANK, type ExamEssay, type ExamMCQ } from '../data/examBank'

export type Difficulty = 'Cơ bản' | 'Trung bình' | 'Nâng cao'

export interface ExamRequest {
  courseCode: string
  courseName: string
  mcqCount: number
  essayCount: number
  difficulty: Difficulty
  topic: string
}

export interface Exam {
  request: ExamRequest
  source: 'openai' | 'sample'
  model?: string
  mcq: ExamMCQ[]
  essay: ExamEssay[]
}

const ENDPOINT = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT = `Bạn là chuyên gia khảo thí của một trường đại học tại Việt Nam.
Soạn đề thi bằng tiếng Việt chuẩn học thuật, câu hỏi rõ ràng, không mơ hồ, bám sát chuẩn đầu ra học phần.
Chỉ trả về JSON hợp lệ theo đúng cấu trúc:
{"mcq":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}],
 "essay":[{"question":"...","guide":"Đáp án/hướng dẫn chấm ngắn gọn","points":3}]}
Trong đó "answer" là chỉ số (0-3) của phương án đúng, mỗi câu trắc nghiệm đúng 4 phương án.`

function userPrompt(r: ExamRequest) {
  return [
    `Học phần: ${r.courseName} (mã ${r.courseCode}).`,
    `Mức độ: ${r.difficulty}.`,
    r.topic.trim() ? `Phạm vi/chủ đề: ${r.topic.trim()}.` : 'Phạm vi: toàn bộ học phần.',
    `Số câu trắc nghiệm: ${r.mcqCount}. Số câu tự luận: ${r.essayCount}.`,
    'Tổng điểm phần tự luận bằng 10 nếu không có trắc nghiệm, nếu có thì phân bổ hợp lý.',
  ].join('\n')
}

function normalizeExam(raw: unknown, r: ExamRequest): Pick<Exam, 'mcq' | 'essay'> {
  const obj = (raw ?? {}) as { mcq?: unknown[]; essay?: unknown[] }
  const mcq = (obj.mcq ?? [])
    .map((q) => q as Partial<ExamMCQ>)
    .filter((q) => typeof q.question === 'string' && Array.isArray(q.options) && q.options.length >= 2)
    .map((q) => ({
      question: q.question!,
      options: q.options!.slice(0, 4).map(String),
      answer: Math.min(Math.max(Number(q.answer) || 0, 0), q.options!.length - 1),
      explanation: q.explanation ? String(q.explanation) : undefined,
    }))
    .slice(0, r.mcqCount)
  const essay = (obj.essay ?? [])
    .map((q) => q as Partial<ExamEssay>)
    .filter((q) => typeof q.question === 'string')
    .map((q) => ({ question: q.question!, guide: String(q.guide ?? ''), points: Number(q.points) || 0 }))
    .slice(0, r.essayCount)
  return { mcq, essay }
}

export async function generateWithOpenAI(r: ExamRequest, apiKey: string, model: string, signal?: AbortSignal): Promise<Exam> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt(r) },
      ],
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = body?.error?.message ?? res.statusText
    throw new Error(res.status === 401 ? 'API Key không hợp lệ hoặc đã bị thu hồi.' : `OpenAI trả lỗi ${res.status}: ${message}`)
  }
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('OpenAI trả về nội dung không đúng định dạng JSON.')
  }
  const exam = normalizeExam(parsed, r)
  if (!exam.mcq.length && !exam.essay.length) throw new Error('OpenAI không trả về câu hỏi nào, vui lòng thử lại.')
  return { request: r, source: 'openai', model, ...exam }
}

export function sampleExam(r: ExamRequest): Exam {
  const bank = EXAM_BANK[r.courseCode] ?? { mcq: [], essay: [] }
  return { request: r, source: 'sample', mcq: bank.mcq.slice(0, r.mcqCount), essay: bank.essay.slice(0, r.essayCount) }
}

export const sampleCapacity = (courseCode: string) => {
  const bank = EXAM_BANK[courseCode]
  return { mcq: bank?.mcq.length ?? 0, essay: bank?.essay.length ?? 0 }
}

export function examToText(exam: Exam, withAnswers: boolean) {
  const L = 'ABCD'
  const lines = [`ĐỀ THI HỌC PHẦN: ${exam.request.courseName.toUpperCase()} (${exam.request.courseCode})`, `Mức độ: ${exam.request.difficulty}`, '']
  if (exam.mcq.length) {
    lines.push('PHẦN I. TRẮC NGHIỆM')
    exam.mcq.forEach((q, i) => {
      lines.push(`Câu ${i + 1}. ${q.question}`)
      q.options.forEach((o, j) => lines.push(`   ${L[j]}. ${o}`))
      if (withAnswers) lines.push(`   → Đáp án: ${L[q.answer]}${q.explanation ? ` — ${q.explanation}` : ''}`)
    })
    lines.push('')
  }
  if (exam.essay.length) {
    lines.push('PHẦN II. TỰ LUẬN')
    exam.essay.forEach((q, i) => {
      lines.push(`Câu ${i + 1} (${q.points} điểm). ${q.question}`)
      if (withAnswers) lines.push(`   → Hướng dẫn chấm: ${q.guide}`)
    })
  }
  return lines.join('\n')
}
