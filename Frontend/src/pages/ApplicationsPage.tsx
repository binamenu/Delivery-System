import { Building2, FileText } from 'lucide-react'
import { useApplications } from '@/hooks/useApplications'
import {
  ApplicationList,
  ApplicationSummaryCard,
} from '@/components/applications'

export default function ApplicationsPage() {
  const { applications, stats, isLoading, isError, errorMessage, pendingId, approve, reject, reset } =
    useApplications()

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ApplicationSummaryCard
          icon={Building2}
          value={stats.total}
          label="Restaurant Applications"
          badge={`${stats.pending} pending`}
          iconClassName="text-blue-600"
          iconBgClassName="bg-blue-50"
        />
        <ApplicationSummaryCard
          icon={FileText}
          value={stats.pending}
          label="Pending Review"
          badge="Awaiting decision"
          iconClassName="text-orange-500"
          iconBgClassName="bg-orange-50"
        />
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage ?? 'Failed to load applications. Please try again.'}
        </div>
      )}

      <ApplicationList
        applications={applications}
        isLoading={isLoading}
        pendingId={pendingId}
        onApprove={approve}
        onReject={reject}
        onReset={reset}
      />
    </div>
  )
}
