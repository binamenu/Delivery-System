import {
  ClipboardList,
  BarChart3,
  Car,
  Users,
  Store,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  StatCard,
  DashboardChartCard,
  RevenueLineChart,
  OrdersDonutChart,
  PendingApprovalsCard,
} from '@/components/admin-dashboard'
import { useAdminOverview, useApproveRestaurantFromDashboard } from '@/hooks/useAdminOverview'
import { updateRestaurantApproval } from '@/lib/restaurantsApi'
import { getApiErrorMessage } from '@/lib/http'
import { useQueryClient } from '@tanstack/react-query'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    totalOrders,
    revenueLabel,
    drivers,
    customers,
    restaurants,
    pendingCount,
    revenueSeries,
    statusSegments,
    pendingApprovals,
    isLoading,
    isError,
  } = useAdminOverview()
  const approveMutation = useApproveRestaurantFromDashboard()

  const pendingItems = pendingApprovals.map((restaurant) => ({
    id: String(restaurant.id),
    name: restaurant.name,
    owner: restaurant.managerName || restaurant.address || '—',
    category: restaurant.category,
    avatarInitial: restaurant.name.trim().charAt(0).toUpperCase() || 'R',
  }))

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(Number(id))
      toast.success('Restaurant approved.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleReject = async (id: string) => {
    try {
      await updateRestaurantApproval(Number(id), 'rejected')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
        queryClient.invalidateQueries({ queryKey: ['applications'] }),
      ])
      toast.success('Restaurant rejected.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6">
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load dashboard data from the API.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
          icon={Car}
          value={isLoading ? '—' : String(drivers)}
          label="Active Drivers"
        />
        <StatCard
          icon={Users}
          value={isLoading ? '—' : customers.toLocaleString()}
          label="Customers"
        />
        <StatCard
          icon={Store}
          value={isLoading ? '—' : String(restaurants)}
          label="Restaurants"
          trend={pendingCount > 0 ? `${pendingCount} pending` : undefined}
          trendVariant="warning"
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

      <PendingApprovalsCard
        items={pendingItems}
        onApprove={handleApprove}
        onReject={handleReject}
        onViewAll={() => navigate('/admin/applications')}
      />
    </div>
  )
}
