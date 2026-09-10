import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth'
import AuthBranding from '@/components/auth/AuthBranding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const { forgotPassword, isLoading } = useAuthStore()
  const [isSent, setIsSent] = useState(false)

  const forgotPasswordSchema = z.object({
    email: z.string().email(t('auth.emailInvalid')).min(1, t('auth.emailRequired')),
  })

  type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await forgotPassword(data.email)
      setIsSent(true)
      toast.success(t('auth.forgotPasswordSuccess'))
    } catch (error: any) {
      const data = error.response?.data
      const message =
        data?.errors?.email?.[0] ||
        data?.message ||
        t('auth.forgotPasswordFailed')
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#f8f8f8]">
      {/* Left Column: Branding Section */}
      <AuthBranding />

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[420px] space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('auth.forgotPasswordTitle')}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base font-normal">
              {t('auth.forgotPasswordSubtitle')}
            </p>
          </div>

          {/* Form */}
          {!isSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700">
                  {t('auth.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  aria-label={t('auth.email')}
                  className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#f05a24] hover:bg-[#d84d1c] text-white font-semibold rounded-full text-base transition-all duration-200 shadow-md shadow-[#f05a24]/20 cursor-pointer"
              >
                {isLoading ? t('common.loading') : t('auth.sendResetLink')}
              </Button>
            </form>
          ) : (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium">
              {t('auth.forgotPasswordSuccess')}. {t('auth.checkEmailMsg', 'Check your email for the reset link.')}
            </div>
          )}

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-gray-500 font-normal">
              <Link
                to="/login"
                className="text-[#f05a24] font-semibold hover:underline"
              >
                {t('auth.backToLogin')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
