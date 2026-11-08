const K = {
  openaiKey: 'erp-dao-tao:openai-key',
  openaiModel: 'erp-dao-tao:openai-model',
  museToken: 'erp-dao-tao:muse-token',
}

export const OPENAI_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1']

export const getOpenAIKey = () => localStorage.getItem(K.openaiKey) ?? ''
export const setOpenAIKey = (v: string) => (v ? localStorage.setItem(K.openaiKey, v) : localStorage.removeItem(K.openaiKey))

export const getOpenAIModel = () => localStorage.getItem(K.openaiModel) ?? OPENAI_MODELS[0]
export const setOpenAIModel = (v: string) => localStorage.setItem(K.openaiModel, v)

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return `edu_erp_live_sec_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
}

export function getMuseToken() {
  let t = localStorage.getItem(K.museToken)
  if (!t) {
    t = randomToken()
    localStorage.setItem(K.museToken, t)
  }
  return t
}

export function rotateMuseToken() {
  const t = randomToken()
  localStorage.setItem(K.museToken, t)
  return t
}

export const maskKey = (k: string) => (k.length > 10 ? `${k.slice(0, 5)}…${k.slice(-4)}` : '••••')
