import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import AuthBranding from '@/components/auth/AuthBranding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetPassword, isLoading } = useAuthStore()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      toast.error(t('auth.tokenRequired'))
      navigate('/login')
    }
  }, [token, email, navigate, t])

  const resetPasswordSchema = z.object({
    password: z.string().min(8, t('auth.passwordMin')),
    password_confirmation: z.string().min(1, t('auth.confirmPasswordRequired')),
  }).refine((data) => data.password === data.password_confirmation, {
    message: t('auth.passwordMatch'),
    path: ['password_confirmation'],
  })

  type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token || !email) return

    try {
      await resetPassword({
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation
      })
      toast.success(t('auth.resetPasswordSuccess'))
      navigate('/login')
    } catch (error: any) {
      const message = error.response?.data?.message || t('auth.resetPasswordFailed')
      toast.error(message)
    }
  }

  if (!token || !email) return null

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
              {t('auth.resetPasswordTitle')}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base font-normal">
              {t('auth.resetPasswordSubtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Password field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700">
                {t('auth.newPassword')}
              </Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.placeholderPasswordMin')}
                aria-label={t('auth.newPassword')}
                className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                {...register('password')}
              />
              <div className="flex items-center mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  aria-pressed={showPassword}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer select-none font-medium"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{showPassword ? t('auth.hidePassword') : t('auth.showPassword')}</span>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1.5">
              <Label htmlFor="password_confirmation" className="text-xs sm:text-sm font-semibold text-gray-700">
                {t('auth.confirmPassword')}
              </Label>
              <Input
                id="password_confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('auth.placeholderConfirmPassword')}
                aria-label={t('auth.confirmPassword')}
                className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                {...register('password_confirmation')}
              />
              <div className="flex items-center mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? t('auth.hideConfirmPassword') : t('auth.showConfirmPassword')}
                  aria-pressed={showConfirmPassword}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer select-none font-medium"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{showConfirmPassword ? t('auth.hideConfirmPassword') : t('auth.showConfirmPassword')}</span>
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-xs text-red-500 mt-1">{errors.password_confirmation.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#f05a24] hover:bg-[#d84d1c] text-white font-semibold rounded-full text-base transition-all duration-200 shadow-md shadow-[#f05a24]/20 cursor-pointer"
            >
              {isLoading ? t('common.loading') : t('auth.resetPassword')}
            </Button>
          </form>

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
