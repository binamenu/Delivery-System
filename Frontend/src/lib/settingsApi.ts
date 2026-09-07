import api from '@/lib/api'
import type { AdminPasswordForm, AdminProfileForm } from '@/types/Settings'

export async function updateAdminPassword(form: AdminPasswordForm) {
  await api.put('/change-password', {
    current_password: form.currentPassword,
    password: form.newPassword,
    password_confirmation: form.confirmPassword,
  })
}

export async function updateAdminProfile(form: AdminProfileForm) {
  await api.put('/profile', {
    name: form.name,
    email: form.email,
    phone: form.phone,
  })
}
