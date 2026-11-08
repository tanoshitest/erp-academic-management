const vnd = new Intl.NumberFormat('vi-VN')

export const money = (n: number) => `${vnd.format(Math.round(n))} ₫`

export const num = (n: number) => vnd.format(n)

export const percent = (n: number) => `${Math.round(n * 100)}%`

export function date(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
