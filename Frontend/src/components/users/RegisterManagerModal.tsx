import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { RegisterManagerInput } from '@/types/Users'
import { UserFormModal } from './UserFormModal'
import { UserFormField } from './UserFormField'

const managerSchema = z.object({
  name: z.string().trim().min(1, 'Full name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^(09\d{8}|\+?2519\d{8}|9\d{8})$/, 'Use 09xxxxxxxx format'),
})

export interface RegisterManagerModalProps {
  open: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (values: RegisterManagerInput) => Promise<void> | void
}

export function RegisterManagerModal({
  open,
  isSubmitting = false,
  onClose,
  onSubmit,
}: RegisterManagerModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterManagerInput>({
    resolver: zodResolver(managerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  })

  const closeAndReset = () => {
    reset()
    onClose()
  }

  return (
    <UserFormModal
      open={open}
      title="Register Restaurant Manager"
      subtitle="They will set up their restaurant after signing in."
      onClose={closeAndReset}
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values)
          reset()
        })}
      >
        <UserFormField
          label="Full Name"
          placeholder="Sara Tesfaye"
          error={errors.name?.message}
          {...register('name')}
        />
        <UserFormField
          label="Email Address"
          type="email"
          placeholder="manager@restaurant.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <UserFormField
          label="Phone Number"
          type="tel"
          placeholder="+251 91 234 5678"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          After signing in, the manager will complete a setup flow to register their first restaurant.
          Each restaurant submission requires your approval before going live.
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Manager Account'}
          </button>
          <button
            type="button"
            onClick={closeAndReset}
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </UserFormModal>
  )
}
