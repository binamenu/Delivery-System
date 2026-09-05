export function niceMax(value: number, ticks = 4): number {
  if (value <= 0) return ticks
  const padded = value * 1.15
  const magnitude = 10 ** Math.floor(Math.log10(padded))
  const normalized = padded / magnitude
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

export function buildTicks(max: number, count = 5): number[] {
  return Array.from({ length: count }, (_, index) => (max / (count - 1)) * index)
}

export function formatAxisValue(value: number): string {
  if (value === 0) return '0'
  if (value >= 1_000_000) return `${value / 1_000_000}M`
  if (value >= 1_000) return value.toLocaleString()
  return String(Math.round(value))
}
