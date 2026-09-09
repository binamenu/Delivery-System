import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface OrderSearchInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function OrderSearchInput({ value, onChange, className }: OrderSearchInputProps) {
  return (
    <div className={cn('relative w-full lg:max-w-md', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by order ID, customer, restaurant..."
        className="rounded-full border-border bg-background pl-9"
      />
    </div>
  )
}