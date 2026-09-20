import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { RegisterDriverInput } from '@/types/Users'
import { UserFormModal } from './UserFormModal'
import { UserFormField, UserFormSelect } from './UserFormField'
import { VEHICLE_TYPE_OPTIONS } from './userConfig'

const driverSchema = z.object({
  name: z.string().trim().min(1, 'Full name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^(09\d{8}|\+?2519\d{8}|9\d{8})$/, 'Use 09xxxxxxxx format'),
  vehicleType: z.string().min(1, 'Select a vehicle type'),
  vehicleModel: z.string().trim().min(1, 'Vehicle model is required'),
  plateNumber: z.string().trim().min(1, 'Plate number is required'),
})

export interface RegisterDriverModalProps {
  open: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (values: RegisterDriverInput) => Promise<void> | void
}

export function RegisterDriverModal({
  open,
  isSubmitting = false,
  onClose,
  onSubmit,
}: RegisterDriverModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterDriverInput>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      vehicleType: '',
      vehicleModel: '',
      plateNumber: '',
    },
  })

  const closeAndReset = () => {
    reset()
    onClose()
  }

  return (
    <UserFormModal
      open={open}
      title="Register New Driver"
      subtitle="The driver can sign in immediately after registration."
      onClose={closeAndReset}
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values)
          reset()
        })}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UserFormField
            label="Full Name"
            placeholder="Dawit Bekele"
            error={errors.name?.message}
            {...register('name')}
          />
          <UserFormField
            label="Email Address"
            type="email"
            placeholder="driver@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <UserFormField
            label="Phone Number"
            type="tel"
            placeholder="+251 92 345 6789"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <UserFormSelect
            label="Vehicle Type"
            placeholder="Select vehicle..."
            options={VEHICLE_TYPE_OPTIONS}
            error={errors.vehicleType?.message}
            {...register('vehicleType')}
          />
          <UserFormField
            label="Vehicle Model"
            placeholder="Bajaj Boxer 150"
            error={errors.vehicleModel?.message}
            {...register('vehicleModel')}
          />
          <UserFormField
            label="Plate Number"
            placeholder="3-AA-XXXXX"
            error={errors.plateNumber?.message}
            {...register('plateNumber')}
          />
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          After registration, the driver can sign in with their email. Any changes to license or
          verification details will require admin approval.
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Driver Account'}
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
