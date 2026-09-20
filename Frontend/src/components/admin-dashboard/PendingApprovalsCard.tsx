import { ChevronRight } from 'lucide-react'
import { ApprovalListItem, type ApprovalListItemProps } from './ApprovalListItem'

export interface PendingApproval extends Omit<ApprovalListItemProps, 'onApprove' | 'onReject'> {
  id: string
}

export interface PendingApprovalsCardProps {
  items: PendingApproval[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onViewAll?: () => void
}

export function PendingApprovalsCard({
  items,
  onApprove,
  onReject,
  onViewAll,
}: PendingApprovalsCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Pending Restaurant Approvals</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-0.5 text-sm font-medium text-orange-500 transition-colors hover:text-orange-600"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No pending restaurant approvals.
          </p>
        ) : (
          items.map((item) => (
            <ApprovalListItem
              key={item.id}
              name={item.name}
              owner={item.owner}
              category={item.category}
              avatarInitial={item.avatarInitial}
              onApprove={() => onApprove?.(item.id)}
              onReject={() => onReject?.(item.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
