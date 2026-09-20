export interface OrderStatusSegment {
  label: string
  value: number
  color: string
}

const SIZE = 160
const STROKE = 28
const RADIUS = (SIZE - STROKE) / 2
const CENTER = SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export interface OrdersDonutChartProps {
  segments?: OrderStatusSegment[]
}

export function OrdersDonutChart({ segments = [] }: OrdersDonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-6">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-40 w-40"
        role="img"
        aria-label="Orders by status donut chart"
      >
        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          {total === 0 ? (
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={STROKE}
            />
          ) : (
            segments.map((segment) => {
              const length = (segment.value / total) * CIRCUMFERENCE
              const dashArray = `${length} ${CIRCUMFERENCE - length}`
              const dashOffset = -offset
              offset += length

              return (
                <circle
                  key={segment.label}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={STROKE}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                />
              )
            })
          )}
        </g>
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-xs text-gray-500">
              {segment.label} ({segment.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
