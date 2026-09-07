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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const registerSchema = z
    .object({
      name: z.string().min(1, 'Name is required'),
      username: z.string().min(3, 'Username must be at least 3 characters'),
      email: z.string().email('Invalid email address'),
      phone: z
        .string()
        .regex(/^09\d{8}$/, 'Phone number must start with 09 and have 10 digits'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      password_confirmation: z.string().min(1, 'Confirm password is required'),
      terms: z.boolean().optional(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: 'Passwords do not match',
      path: ['password_confirmation'],
    })

  type RegisterForm = z.infer<typeof registerSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
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
      toast.success('Account created successfully')
      navigate('/home')
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Registration failed'
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
              Back to Sign In
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-1 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Create your account
            </h2>
            <p className="text-gray-500 text-sm sm:text-base font-normal">
              Join Tenadam and start ordering in minutes.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Tigist Haile"
                aria-label="Full Name"
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
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                aria-label="Username"
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
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tigist@example.com"
                aria-label="Email Address"
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
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0912345678"
                aria-label="Phone Number"
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
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                aria-label="Password"
                className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                {...register('password')}
              />
              <div className="flex items-center mt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer select-none font-medium"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  <span>Show password</span>
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
                Confirm Password
              </Label>
              <Input
                id="password_confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat password"
                aria-label="Confirm Password"
                className="h-11 rounded-full px-4 border-gray-200 focus:border-[#f05a24] focus:ring-[#f05a24] bg-white text-sm"
                {...register('password_confirmation')}
              />
              <div className="flex items-center mt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer select-none font-medium"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  <span>Show</span>
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
                  className="w-4 h-4 rounded border-gray-300 text-[#f05a24] focus:ring-[#f05a24] mt-0.5 cursor-pointer"
                  {...register('terms')}
                />
                <span className="text-xs sm:text-sm text-gray-600 font-normal leading-tight">
                  I agree to the{' '}
                  <a href="#" className="text-[#f05a24] font-semibold hover:underline">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#f05a24] font-semibold hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#f05a24] hover:bg-[#d84d1c] text-white font-semibold rounded-full text-base transition-all duration-200 shadow-md shadow-[#f05a24]/20 cursor-pointer mt-2"
            >
              {isLoading
                ? t('common.loading') || 'Loading...'
                : 'Create Account'}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-1">
            <p className="text-xs sm:text-sm text-gray-500 font-normal">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#f05a24] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
