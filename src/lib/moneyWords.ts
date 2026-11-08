const D = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
const UNITS = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ']

function triple(n: number, full: boolean) {
  const h = Math.floor(n / 100)
  const t = Math.floor((n % 100) / 10)
  const u = n % 10
  const out: string[] = []
  if (full || h > 0) out.push(`${D[h]} trăm`)
  if (t > 1) {
    out.push(`${D[t]} mươi`)
    if (u === 1) out.push('mốt')
    else if (u === 5) out.push('lăm')
    else if (u > 0) out.push(D[u])
  } else if (t === 1) {
    out.push('mười')
    if (u === 5) out.push('lăm')
    else if (u > 0) out.push(D[u])
  } else if (u > 0) {
    if (full || h > 0) out.push('linh')
    out.push(D[u])
  }
  return out.join(' ')
}

export function moneyInWords(amount: number) {
  let n = Math.round(Math.abs(amount))
  if (n === 0) return 'Không đồng'
  const groups: number[] = []
  while (n > 0) {
    groups.push(n % 1000)
    n = Math.floor(n / 1000)
  }
  const parts: string[] = []
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue
    parts.push(triple(groups[i], i < groups.length - 1) + UNITS[i])
  }
  const text = parts.join(' ')
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} đồng`
}
