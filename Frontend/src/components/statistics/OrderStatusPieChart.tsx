import type { StatusShare } from '@/types/Statistics'

const SIZE = 220
const CENTER = SIZE / 2
const RADIUS = 78

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  }
}

function slicePath(startAngle: number, endAngle: number): string {
  const start = polarToCartesian(CENTER, CENTER, RADIUS, endAngle)
  const end = polarToCartesian(CENTER, CENTER, RADIUS, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

export interface OrderStatusPieChartProps {
  segments: StatusShare[]
}

export function OrderStatusPieChart({ segments }: OrderStatusPieChartProps) {
  if (segments.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-500">No order status data yet.</p>
  }

  const total = segments.reduce((sum, segment) => sum + segment.count, 0)
  let cursor = 0
  const slices = segments.map((segment) => {
    const startAngle = cursor
    const sweep = total === 0 ? 0 : (segment.count / total) * 360
    const endAngle = cursor + sweep
    cursor = endAngle
    return { ...segment, startAngle, endAngle: endAngle === startAngle ? startAngle + 0.01 : endAngle }
  })

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-44 w-44" role="img" aria-label="Order status distribution">
        {slices.map((slice) => (
          <path key={slice.key} d={slicePath(slice.startAngle, slice.endAngle)} fill={slice.color} />
        ))}
      </svg>

      <div className="space-y-2">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
            <span>
              {segment.label} {segment.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
