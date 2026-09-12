import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import AuthBranding from '@/components/auth/AuthBranding'
import { TermsModal } from '@/components/auth/TermsModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [modalConfig, setModalConfig] = useState<{ open: boolean; type: 'terms' | 'privacy' }>({ open: false, type: 'terms' })

  const registerSchema = z
    .object({
      name: z.string().min(1, t('auth.nameRequired')),
      username: z.string().min(3, t('auth.usernameMin')),
      email: z.string().email(t('auth.emailInvalid')),
      phone: z
        .string()
        .regex(/^09\d{8}$/, t('auth.phoneInvalid')),
      password: z.string().min(8, t('auth.passwordMin')),
      password_confirmation: z.string().min(1, t('auth.confirmPasswordRequired')),
      terms: z.boolean().refine((val) => val === true, {
        message: t('auth.termsRequired'),
      }),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t('auth.passwordMatch'),
      path: ['password_confirmation'],
    })

  type RegisterForm = z.infer<typeof registerSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        username: data.username,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      toast.success(t('auth.registerSuccess'))
      navigate('/home')
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t('auth.registerFailed')
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#f8f8f8]">
      {/* Left Column: Branding Section */}
      <AuthBranding />

      {/* Right Column: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-14">
        <div className="w-full max-w-[440px] space-y-5">
          {/* Back link */}
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('auth.backToSignIn')}
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-1 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('auth.registerTitle')}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base font-normal">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-gray-700">
                {t('auth.fullName')}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t('auth.placeholderFullName')}
                aria-label={t('auth.fullName')}
                className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-1">
              <Label htmlFor="username" className="text-xs sm:text-sm font-semibold text-gray-700">
                {t('auth.username')}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={t('auth.placeholderUsername')}
                aria-label={t('auth.username')}
                className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700">
                {t('auth.email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.placeholderEmail')}
                aria-label={t('auth.email')}
                className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-gray-700">
                {t('auth.phone')}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('auth.placeholderPhone')}
                aria-label={t('auth.phone')}
                className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700">
                {t('auth.password')}
              </Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.placeholderPasswordMin')}
                aria-label={t('auth.password')}
                className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                {...register('password')}
              />
              <div className="flex items-center mt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  aria-pressed={showPassword}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer select-none font-medium"
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label
                htmlFor="password_confirmation"
                className="text-xs sm:text-sm font-semibold text-gray-700"
              >
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
              <div className="flex items-center mt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? t('auth.hideConfirmPassword') : t('auth.showConfirmPassword')}
                  aria-pressed={showConfirmPassword}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer select-none font-medium"
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
                <p className="text-xs text-red-500 mt-1">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="terms"
                  aria-label={t('auth.termsAndConditions')}
                  className="w-4 h-4 rounded border-gray-300 text-[#f05a24] focus:ring-[#f05a24] mt-0.5 cursor-pointer"
                  {...register('terms')}
                />
                <span className="text-xs sm:text-sm text-gray-600 font-normal leading-tight">
                  {t('auth.agreeTermsPrefix')}{' '}
                  <button
                    type="button"
                    onClick={() => setModalConfig({ open: true, type: 'terms' })}
                    className="text-[#f05a24] font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 inline"
                  >
                    {t('auth.termsAndConditions')}
                  </button>{' '}
                  {t('auth.and')}{' '}
                  <button
                    type="button"
                    onClick={() => setModalConfig({ open: true, type: 'privacy' })}
                    className="text-[#f05a24] font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 inline"
                  >
                    {t('auth.privacyPolicy')}
                  </button>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-red-500 mt-1">{errors.terms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#f05a24] hover:bg-[#d84d1c] text-white font-semibold rounded-full text-base transition-all duration-200 shadow-md shadow-[#f05a24]/20 cursor-pointer mt-2"
            >
              {isLoading ? t('common.loading') : t('auth.registerButton')}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-1">
            <p className="text-xs sm:text-sm text-gray-500 font-normal">
              {t('auth.hasAccount')}{' '}
              <Link
                to="/login"
                className="text-[#f05a24] font-semibold hover:underline"
              >
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <TermsModal
        open={modalConfig.open}
        type={modalConfig.type}
        onClose={() => setModalConfig({ ...modalConfig, open: false })}
      />
    </div>
  )
}
