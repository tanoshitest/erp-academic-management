import { Download, KeyRound, Loader2, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { CopyButton, Segmented } from '../../components/common/Controls'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { useAcademic } from '../../context/AcademicContext'
import { useAuth } from '../../context/AuthContext'
import { getOpenAIKey, getOpenAIModel, maskKey, setOpenAIKey } from '../../lib/settings'
import { examToText, generateWithOpenAI, sampleCapacity, sampleExam, type Difficulty, type Exam, type ExamRequest } from '../../services/openaiService'

const L = 'ABCD'
const clamp = (v: number, max: number) => Math.min(max, Math.max(0, Math.round(v) || 0))

export function ExamGenerator() {
  const { state } = useAcademic()
  const { user } = useAuth()
  const courseCodes = [...new Set(state.sections.filter((s) => s.lecturerId === user?.id).map((s) => s.courseCode))]
  const courses = courseCodes.map((c) => state.courses.find((x) => x.code === c)!).filter(Boolean)

  const [courseCode, setCourseCode] = useState(courses[0]?.code ?? '')
  const [mcqCount, setMcqCount] = useState(5)
  const [essayCount, setEssayCount] = useState(2)
  const [difficulty, setDifficulty] = useState<Difficulty>('Trung bình')
  const [topic, setTopic] = useState('')
  const [apiKey, setApiKey] = useState(getOpenAIKey)
  const [draftKey, setDraftKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exam, setExam] = useState<Exam | null>(null)
  const [answers, setAnswers] = useState(true)
  const abort = useRef<AbortController | null>(null)

  const course = courses.find((c) => c.code === courseCode)
  const cap = sampleCapacity(courseCode)

  const request = (): ExamRequest => ({ courseCode, courseName: course?.name ?? courseCode, mcqCount, essayCount, difficulty, topic })

  const generate = async () => {
    setError('')
    if (!mcqCount && !essayCount) return setError('Chọn ít nhất 1 câu hỏi.')
    if (!apiKey) return setExam(sampleExam(request()))
    abort.current?.abort()
    abort.current = new AbortController()
    setLoading(true)
    try {
      setExam(await generateWithOpenAI(request(), apiKey, getOpenAIModel(), abort.current.signal))
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message || 'Không gọi được OpenAI.')
    } finally {
      setLoading(false)
    }
  }

  const saveKey = () => {
    const v = draftKey.trim()
    if (!v) return
    setOpenAIKey(v)
    setApiKey(v)
    setDraftKey('')
  }

  const downloadTxt = () => {
    if (!exam) return
    const blob = new Blob([examToText(exam, answers)], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `de-thi-${exam.request.courseCode}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const essayPoints = exam?.essay.reduce((s, q) => s + q.points, 0) ?? 0

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card>
        <CardHeader title="Thiết lập đề thi" subtitle="Chọn học phần và cấu trúc đề" />
        <div className="space-y-4 p-4">
          <Field label="Môn học">
            <select className="input" value={courseCode} onChange={(e) => setCourseCode(e.target.value)}>
              {courses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} – {c.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Số câu trắc nghiệm">
              <input className="input" type="number" min={0} max={30} value={mcqCount} onChange={(e) => setMcqCount(clamp(Number(e.target.value), 30))} />
            </Field>
            <Field label="Số câu tự luận">
              <input className="input" type="number" min={0} max={10} value={essayCount} onChange={(e) => setEssayCount(clamp(Number(e.target.value), 10))} />
            </Field>
          </div>
          <Field label="Mức độ">
            <Segmented
              value={difficulty}
              onChange={setDifficulty}
              options={(['Cơ bản', 'Trung bình', 'Nâng cao'] as Difficulty[]).map((d) => ({ value: d, label: d }))}
            />
          </Field>
          <Field label="Phạm vi / chủ đề (tùy chọn)">
            <textarea className="input h-20 resize-none py-2" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="VD: Chương 3–5, chuẩn hóa dữ liệu và SQL nâng cao" />
          </Field>

          {apiKey ? (
            <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <span className="flex items-center gap-1.5">
                <KeyRound size={14} /> OpenAI: {maskKey(apiKey)} · {getOpenAIModel()}
              </span>
            </div>
          ) : (
            <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">
                Chưa có API Key — hệ thống dùng <b>bộ đề mẫu</b> (tối đa {cap.mcq} trắc nghiệm, {cap.essay} tự luận cho môn này).
              </p>
              <div className="flex gap-2">
                <input className="input h-8 font-mono text-xs" type="password" value={draftKey} onChange={(e) => setDraftKey(e.target.value)} placeholder="Dán khóa sk-..." autoComplete="off" />
                <Button size="sm" variant="secondary" onClick={saveKey} disabled={!draftKey.trim()}>
                  Lưu khóa
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p>{error}</p>
              {apiKey && (
                <Button size="sm" variant="secondary" onClick={() => setExam(sampleExam(request()))}>
                  Dùng bộ đề mẫu
                </Button>
              )}
            </div>
          )}

          <Button className="w-full" onClick={generate} disabled={loading || !courseCode}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? 'OpenAI đang soạn đề…' : 'Tạo đề thi với OpenAI'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={exam ? `Đề thi: ${exam.request.courseName}` : 'Xem trước đề thi'}
          subtitle={exam ? `${exam.mcq.length} câu trắc nghiệm · ${exam.essay.length} câu tự luận · ${exam.request.difficulty}` : 'Đề thi và đáp án sẽ hiển thị tại đây'}
          actions={
            exam && (
              <>
                {exam.source === 'openai' ? <Badge tone="green">OpenAI · {exam.model}</Badge> : <Badge tone="amber">Bộ đề mẫu</Badge>}
                <label className="flex items-center gap-1.5 text-xs text-slate-600">
                  <input type="checkbox" checked={answers} onChange={(e) => setAnswers(e.target.checked)} className="accent-navy-800" />
                  Hiện đáp án
                </label>
                <CopyButton text={examToText(exam, answers)} />
                <Button variant="secondary" onClick={downloadTxt}>
                  <Download size={15} /> .txt
                </Button>
              </>
            )
          }
        />
        {!exam ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-slate-500">
            <Sparkles size={32} className="text-navy-200" />
            <p className="max-w-sm text-sm">Chọn môn học, số lượng câu hỏi rồi bấm “Tạo đề thi với OpenAI”.</p>
          </div>
        ) : (
          <div className="space-y-6 p-5">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đề thi kết thúc học phần</p>
              <p className="mt-1 text-lg font-bold text-navy-800">
                {exam.request.courseName} ({exam.request.courseCode})
              </p>
              {exam.request.topic && <p className="mt-0.5 text-sm text-slate-500">Phạm vi: {exam.request.topic}</p>}
            </div>
            {!!exam.mcq.length && (
              <section>
                <h3 className="mb-3 border-b border-slate-200 pb-1 text-sm font-bold uppercase text-navy-800">Phần I. Trắc nghiệm</h3>
                <ol className="space-y-4">
                  {exam.mcq.map((q, i) => (
                    <li key={i}>
                      <p className="text-sm font-medium text-slate-800">
                        Câu {i + 1}. {q.question}
                      </p>
                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {q.options.map((o, j) => (
                          <div
                            key={j}
                            className={`rounded border px-3 py-1.5 text-sm ${answers && j === q.answer ? 'border-emerald-300 bg-emerald-50 font-medium text-emerald-800' : 'border-slate-200 text-slate-700'}`}
                          >
                            {L[j]}. {o}
                          </div>
                        ))}
                      </div>
                      {answers && q.explanation && <p className="mt-1.5 text-xs text-slate-500">Giải thích: {q.explanation}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {!!exam.essay.length && (
              <section>
                <h3 className="mb-3 border-b border-slate-200 pb-1 text-sm font-bold uppercase text-navy-800">
                  Phần II. Tự luận <span className="font-normal normal-case text-slate-500">({essayPoints} điểm)</span>
                </h3>
                <ol className="space-y-4">
                  {exam.essay.map((q, i) => (
                    <li key={i}>
                      <p className="text-sm font-medium text-slate-800">
                        Câu {i + 1} ({q.points} điểm). {q.question}
                      </p>
                      {answers && <p className="mt-1.5 rounded bg-slate-50 px-3 py-2 text-xs text-slate-600">Hướng dẫn chấm: {q.guide}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {exam.source === 'sample' && (exam.mcq.length < exam.request.mcqCount || exam.essay.length < exam.request.essayCount) && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Bộ đề mẫu chỉ có {cap.mcq} trắc nghiệm và {cap.essay} tự luận cho môn này. Thêm API Key OpenAI để sinh đủ số câu yêu cầu.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
