import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const loginSchema = z.object({
    login: z.string().min(1, t('auth.emailRequired')),
    password: z.string().min(1, t('auth.passwordRequired')),
    remember_me: z.boolean().optional(),
  })

  type LoginForm = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data)
      toast.success(t('auth.loginSuccess'))
      navigate('/home')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.loginFailed')
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#f8f8f8]">
      {/* Left Column: Branding Section */}
      <AuthBranding />

      {/* Right Column: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[420px] space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('auth.loginTitle')}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base font-normal">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Address field */}
            <div className="space-y-1.5">
              <Label htmlFor="login" className="text-xs sm:text-sm font-semibold text-gray-700">
                {t('auth.emailOrUsername')}
              </Label>
              <Input
                id="login"
                type="text"
                placeholder="you@example.com"
                aria-label={t('auth.emailOrUsername')}
                className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                {...register('login')}
              />
              {errors.login && (
                <p className="text-xs text-red-500 mt-1">{errors.login.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700">
                {t('auth.password')}
              </Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                aria-label={t('auth.password')}
                className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                {...register('password')}
              />
              {/* Show password toggle */}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="remember_me"
                  className="w-4 h-4 rounded border-gray-300 text-[#f05a24] focus:ring-[#f05a24] cursor-pointer"
                  {...register('remember_me')}
                />
                <span className="text-xs sm:text-sm text-gray-600 font-normal">
                  {t('auth.rememberMe')}
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm font-semibold text-[#f05a24] hover:underline cursor-pointer"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#f05a24] hover:bg-[#d84d1c] text-white font-semibold rounded-full text-base transition-all duration-200 shadow-md shadow-[#f05a24]/20 cursor-pointer"
            >
              {isLoading ? t('common.loading') : t('auth.loginButton')}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-gray-500 font-normal">
              {t('auth.noAccount')}{' '}
              <Link
                to="/register"
                className="text-[#f05a24] font-semibold hover:underline"
              >
                {t('auth.createOne')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
