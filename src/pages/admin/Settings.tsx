import { Download, Eye, EyeOff, KeyRound, Link2, RefreshCw, RotateCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { CopyButton } from '../../components/common/Controls'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { useAcademic } from '../../context/AcademicContext'
import { getMuseToken, getOpenAIKey, getOpenAIModel, maskKey, OPENAI_MODELS, rotateMuseToken, setOpenAIKey, setOpenAIModel } from '../../lib/settings'
import { buildMuseDatasets, downloadJson, MUSE_DATASET_LABEL, MUSE_DATASETS } from '../../services/museExport'

type Check = { state: 'idle' | 'loading' | 'ok' | 'error'; message?: string }

export function Settings() {
  const { state, reset } = useAcademic()
  const [saved, setSaved] = useState(getOpenAIKey)
  const [key, setKey] = useState(getOpenAIKey)
  const [model, setModel] = useState(getOpenAIModel)
  const [show, setShow] = useState(false)
  const [check, setCheck] = useState<Check>({ state: 'idle' })
  const [token, setToken] = useState(getMuseToken)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  const base = `${window.location.origin}/api/muse`

  const save = () => {
    const v = key.trim()
    setOpenAIKey(v)
    setOpenAIModel(model)
    setSaved(v)
    setCheck({ state: 'idle' })
  }

  const remove = () => {
    setOpenAIKey('')
    setKey('')
    setSaved('')
    setCheck({ state: 'idle' })
  }

  const test = async () => {
    setCheck({ state: 'loading' })
    try {
      const res = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key.trim()}` } })
      setCheck(res.ok ? { state: 'ok', message: 'Kết nối OpenAI thành công.' } : { state: 'error', message: res.status === 401 ? 'API Key không hợp lệ.' : `OpenAI trả lỗi ${res.status}.` })
    } catch {
      setCheck({ state: 'error', message: 'Không gọi được OpenAI (mạng hoặc trình duyệt chặn).' })
    }
  }

  const exportAll = () => downloadJson(`muse-erp-dao-tao-${new Date().toISOString().slice(0, 10)}.json`, buildMuseDatasets(state))
  const exportOne = (k: (typeof MUSE_DATASETS)[number]) => downloadJson(`muse-${k}.json`, buildMuseDatasets(state)[k])

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Kết nối OpenAI"
            subtitle="Dùng cho công cụ soạn đề thi thông minh của giảng viên"
            actions={saved ? <Badge tone="green">Đã cấu hình · {maskKey(saved)}</Badge> : <Badge tone="amber">Chưa cấu hình</Badge>}
          />
          <div className="space-y-4 p-4">
            <Field label="OpenAI API Key" hint="Khóa chỉ lưu trong trình duyệt này (localStorage) và chỉ được gửi tới api.openai.com.">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input pl-9 pr-10 font-mono"
                    type={show ? 'text' : 'password'}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="sk-..."
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600" aria-label={show ? 'Ẩn khóa' : 'Hiện khóa'}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </Field>
            <Field label="Mô hình">
              <select className="input" value={model} onChange={(e) => setModel(e.target.value)}>
                {OPENAI_MODELS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            {check.state !== 'idle' && (
              <p className={`text-sm ${check.state === 'ok' ? 'text-emerald-700' : check.state === 'error' ? 'text-red-600' : 'text-slate-500'}`}>
                {check.state === 'loading' ? 'Đang kiểm tra kết nối…' : check.message}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={save} disabled={!key.trim() && !saved}>
                Lưu cài đặt
              </Button>
              <Button variant="secondary" onClick={test} disabled={!key.trim() || check.state === 'loading'}>
                <ShieldCheck size={16} /> Kiểm tra kết nối
              </Button>
              {saved && (
                <Button variant="danger" onClick={remove}>
                  Xóa khóa
                </Button>
              )}
            </div>
            <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Chưa có khóa: công cụ soạn đề vẫn chạy bằng bộ đề mẫu có sẵn. Bản chính thức nên gọi OpenAI qua máy chủ trung gian để không lộ khóa trên trình duyệt.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Cổng dữ liệu cho Muse" subtitle="Token, endpoint JSON và tệp xuất để dựng dashboard báo cáo" />
          <div className="space-y-4 p-4">
            <Field label="API Token">
              <div className="flex gap-2">
                <input className="input font-mono" readOnly value={token} onFocus={(e) => e.target.select()} />
                <CopyButton text={token} />
                <Button variant="secondary" onClick={() => setToken(rotateMuseToken())} aria-label="Tạo token mới" title="Tạo token mới">
                  <RefreshCw size={15} />
                </Button>
              </div>
            </Field>
            <Field label="Base URL">
              <div className="flex gap-2">
                <input className="input font-mono" readOnly value={base} onFocus={(e) => e.target.select()} />
                <CopyButton text={base} />
              </div>
            </Field>
            <div>
              <p className="mb-1 text-xs font-medium text-slate-600">Data Export Endpoints</p>
              <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
                {MUSE_DATASETS.map((k) => {
                  const url = `${base}/${k}.json`
                  return (
                    <li key={k} className="flex flex-wrap items-center gap-2 px-3 py-2">
                      <Link2 size={15} className="shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">{MUSE_DATASET_LABEL[k]}</p>
                        <a href={url} target="_blank" rel="noreferrer" className="block truncate font-mono text-xs text-navy-600 hover:underline">
                          GET /api/muse/{k}.json
                        </a>
                      </div>
                      <CopyButton text={url} label="URL" />
                      <Button variant="secondary" onClick={() => exportOne(k)} title="Tải dữ liệu hiện tại">
                        <Download size={15} /> JSON
                      </Button>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={exportAll}>
                <Download size={16} /> Tải toàn bộ dữ liệu (1 tệp JSON)
              </Button>
            </div>
            <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Endpoint trả dữ liệu mẫu chuẩn hóa (tĩnh). Nút tải JSON xuất đúng dữ liệu hiện tại trên trình duyệt này, kể cả các thay đổi vừa thao tác. Header gợi ý cho Muse:{' '}
              <code className="font-mono text-slate-700">Authorization: Bearer &lt;API Token&gt;</code>.
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Dữ liệu trải nghiệm"
          subtitle="Mọi thao tác duyệt hồ sơ, nhập điểm, thu tiền… được lưu trên trình duyệt này"
          actions={
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={15} /> Khôi phục dữ liệu mẫu
            </Button>
          }
        />
        <div className="flex flex-wrap gap-x-8 gap-y-2 px-4 py-3 text-sm text-slate-600">
          <span>Học viên: <b className="text-slate-800">{state.students.length}</b></span>
          <span>Hồ sơ tuyển sinh: <b className="text-slate-800">{state.admissions.length}</b></span>
          <span>Môn học: <b className="text-slate-800">{state.courses.length}</b></span>
          <span>Biên lai: <b className="text-slate-800">{state.payments.length}</b></span>
          {resetDone && <span className="text-emerald-700">Đã khôi phục dữ liệu mẫu.</span>}
        </div>
      </Card>

      <Modal
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Khôi phục dữ liệu mẫu?"
        description="Toàn bộ thay đổi trên trình duyệt này (điểm, biên lai, hồ sơ…) sẽ bị xóa. Cài đặt API vẫn được giữ."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                reset()
                setConfirmReset(false)
                setResetDone(true)
              }}
            >
              Khôi phục
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Thao tác này không thể hoàn tác.</p>
      </Modal>
    </>
  )
}
