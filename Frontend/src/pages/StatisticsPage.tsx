import {
  ClipboardList,
  BarChart3,
  Store,
  Tags,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import {
  StatCard,
  DashboardChartCard,
  RevenueLineChart,
  OrdersDonutChart,
} from '@/components/admin-dashboard'
import { useAdminOverview } from '@/hooks/useAdminOverview'

export default function StatisticsPage() {
  const {
    totalOrders,
    revenueLabel,
    restaurants,
    categories,
    delivered,
    cancelled,
    revenueSeries,
    statusSegments,
    isLoading,
    isError,
  } = useAdminOverview()

  return (
    <div className="space-y-6">

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load statistics from the API.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={ClipboardList}
          value={isLoading ? '—' : totalOrders.toLocaleString()}
          label="Total Orders"
        />
        <StatCard
          icon={BarChart3}
          value={isLoading ? '—' : revenueLabel}
          label="Total Revenue"
        />
        <StatCard
          icon={Store}
          value={isLoading ? '—' : String(restaurants)}
          label="Restaurants"
        />
        <StatCard
          icon={Tags}
          value={isLoading ? '—' : String(categories)}
          label="Categories"
        />
        <StatCard
          icon={CheckCircle}
          value={isLoading ? '—' : String(delivered)}
          label="Delivered Orders"
        />
        <StatCard
          icon={XCircle}
          value={isLoading ? '—' : String(cancelled)}
          label="Cancelled / Rejected"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardChartCard title="Revenue Over Time" className="lg:col-span-2">
          <RevenueLineChart data={revenueSeries} />
        </DashboardChartCard>
        <DashboardChartCard title="Orders by Status">
          <OrdersDonutChart segments={statusSegments} />
        </DashboardChartCard>
      </div>
    </div>
  )
}
