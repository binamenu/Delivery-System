import {
  BarChart3,
  ClipboardList,
  Users,
  UserCheck,
  Store,
  CheckCircle2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useStatistics } from '@/hooks/useStatistics'
import {
  MonthlyOrdersBarChart,
  OrderStatusPieChart,
  OrdersOverTimeChart,
  StatisticsChartCard,
  StatisticsSummaryCard,
} from '@/components/statistics'

export default function StatisticsPage() {
  const { data, isLoading, isError, error } = useStatistics()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to load statistics. Please try again.'}
        </div>
      )}

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatisticsSummaryCard
            icon={BarChart3}
            value={data.kpis.totalRevenue.value}
            label={data.kpis.totalRevenue.label}
            badge={data.kpis.totalRevenue.badge}
            iconClassName="text-orange-500"
            iconBgClassName="bg-orange-50"
          />
          <StatisticsSummaryCard
            icon={ClipboardList}
            value={data.kpis.totalOrders.value}
            label={data.kpis.totalOrders.label}
            badge={data.kpis.totalOrders.badge}
            iconClassName="text-emerald-600"
            iconBgClassName="bg-emerald-50"
          />
          <StatisticsSummaryCard
            icon={Users}
            value={data.kpis.activeUsers.value}
            label={data.kpis.activeUsers.label}
            badge={data.kpis.activeUsers.badge}
            iconClassName="text-blue-600"
            iconBgClassName="bg-blue-50"
          />
          <StatisticsSummaryCard
            icon={UserCheck}
            value={data.kpis.activeDrivers.value}
            label={data.kpis.activeDrivers.label}
            badge={data.kpis.activeDrivers.badge}
            iconClassName="text-violet-600"
            iconBgClassName="bg-violet-50"
          />
          <StatisticsSummaryCard
            icon={Store}
            value={data.kpis.restaurants.value}
            label={data.kpis.restaurants.label}
            badge={data.kpis.restaurants.badge}
            iconClassName="text-amber-600"
            iconBgClassName="bg-amber-50"
          />
          <StatisticsSummaryCard
            icon={CheckCircle2}
            value={data.kpis.completionRate.value}
            label={data.kpis.completionRate.label}
            badge={data.kpis.completionRate.badge}
            iconClassName="text-teal-600"
            iconBgClassName="bg-teal-50"
          />
        </div>
      )}

      <StatisticsChartCard title="Monthly Orders & Revenue">
        {isLoading || !data ? (
          <Skeleton className="h-[260px] rounded-xl" />
        ) : (
          <MonthlyOrdersBarChart data={data.monthly} />
        )}
      </StatisticsChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatisticsChartCard title="Orders Over Time">
          {isLoading || !data ? (
            <Skeleton className="h-[240px] rounded-xl" />
          ) : (
            <OrdersOverTimeChart data={data.monthly} />
          )}
        </StatisticsChartCard>

        <StatisticsChartCard title="Order Status Distribution">
          {isLoading || !data ? (
            <Skeleton className="h-[240px] rounded-xl" />
          ) : (
            <OrderStatusPieChart segments={data.statusShares} />
          )}
        </StatisticsChartCard>
      </div>
    </div>
  )
}
