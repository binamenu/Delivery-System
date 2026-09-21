import type { MonthlyPoint } from '@/types/Statistics'
import { buildTicks, formatAxisValue, niceMax } from './chartScale'

const CHART_WIDTH = 720
const CHART_HEIGHT = 260
const PADDING = { top: 16, right: 16, bottom: 36, left: 58 }

export interface MonthlyOrdersBarChartProps {
  data: MonthlyPoint[]
}

export function MonthlyOrdersBarChart({ data }: MonthlyOrdersBarChartProps) {
  const maxValue = niceMax(Math.max(...data.map((point) => point.revenue), 0))
  const ticks = buildTicks(maxValue)
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
  const barWidth = data.length === 0 ? 0 : Math.max(18, plotWidth / data.length - 18)

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="h-[260px] w-full min-w-[420px]"
        role="img"
        aria-label="Monthly orders and revenue bar chart"
      >
        {ticks.map((tick) => {
          const y = PADDING.top + plotHeight - (tick / maxValue) * plotHeight
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={CHART_WIDTH - PADDING.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text x={PADDING.left - 8} y={y + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
                {formatAxisValue(tick)}
              </text>
            </g>
          )
        })}

        {data.map((point, index) => {
          const x = PADDING.left + (index + 0.5) * (plotWidth / Math.max(data.length, 1)) - barWidth / 2
          const height = maxValue === 0 ? 0 : (point.revenue / maxValue) * plotHeight
          const y = PADDING.top + plotHeight - height

          return (
            <g key={point.month}>
              <rect x={x} y={y} width={barWidth} height={height} rx={6} fill="#F26522" />
              <text
                x={x + barWidth / 2}
                y={CHART_HEIGHT - 10}
                textAnchor="middle"
                className="fill-gray-500 text-[11px]"
              >
                {point.month}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
