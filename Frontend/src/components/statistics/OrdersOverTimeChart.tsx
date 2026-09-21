import { useMemo, useState } from 'react'
import type { MonthlyPoint } from '@/types/Statistics'
import { buildTicks, formatAxisValue, niceMax } from './chartScale'

const CHART_WIDTH = 560
const CHART_HEIGHT = 240
const PADDING = { top: 16, right: 16, bottom: 36, left: 42 }

export interface OrdersOverTimeChartProps {
  data: MonthlyPoint[]
}

export function OrdersOverTimeChart({ data }: OrdersOverTimeChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const maxValue = niceMax(Math.max(...data.map((point) => point.orders), 0))
  const ticks = buildTicks(maxValue)
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom

  const points = useMemo(() => {
    if (data.length === 0) return []
    return data.map((point, index) => {
      const x = PADDING.left + (index / Math.max(data.length - 1, 1)) * plotWidth
      const y = PADDING.top + plotHeight - (point.orders / Math.max(maxValue, 1)) * plotHeight
      return { ...point, x, y }
    })
  }, [data, maxValue, plotHeight, plotWidth])

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath =
    points.length === 0
      ? ''
      : `${linePath} L ${points[points.length - 1].x} ${PADDING.top + plotHeight} L ${points[0].x} ${PADDING.top + plotHeight} Z`

  const active = activeIndex !== null ? points[activeIndex] : null

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="h-[240px] w-full min-w-[320px]"
        role="img"
        aria-label="Orders over time line chart"
        onMouseLeave={() => setActiveIndex(null)}
      >
        {ticks.map((tick) => {
          const y = PADDING.top + plotHeight - (tick / Math.max(maxValue, 1)) * plotHeight
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={CHART_WIDTH - PADDING.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text x={PADDING.left - 8} y={y + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
                {formatAxisValue(tick)}
              </text>
            </g>
          )
        })}

        <defs>
          <linearGradient id="ordersOverTimeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {areaPath && <path d={areaPath} fill="url(#ordersOverTimeFill)" />}
        {linePath && (
          <path d={linePath} fill="none" stroke="#3B82F6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        )}

        {points.map((point, index) => (
          <g key={point.month}>
            <rect
              x={point.x - plotWidth / Math.max(data.length, 1) / 2}
              y={PADDING.top}
              width={plotWidth / Math.max(data.length, 1)}
              height={plotHeight}
              fill="transparent"
              onMouseEnter={() => setActiveIndex(index)}
            />
            <circle cx={point.x} cy={point.y} r={activeIndex === index ? 4.5 : 0} fill="#3B82F6" />
            <text x={point.x} y={CHART_HEIGHT - 10} textAnchor="middle" className="fill-gray-500 text-[11px]">
              {point.month}
            </text>
          </g>
        ))}

        {active && (
          <g>
            <rect x={active.x - 42} y={active.y - 36} width={84} height={24} rx={6} fill="#111827" />
            <text x={active.x} y={active.y - 20} textAnchor="middle" className="fill-white text-[10px]">
              orders : {active.orders}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
