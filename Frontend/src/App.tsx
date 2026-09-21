import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import ErrorBoundary from '@/components/ErrorBoundary'

// Auth pages
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Admin / shared pages
import DashboardPage from '@/pages/DashboardPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import Layout from '@/components/Layout'
import AdminRestaurantsPage from '@/pages/RestaurantsPage'
import CategoriesPage from '@/pages/CategoriesPage'
import AdminOrdersPage from '@/pages/OrdersPage'
import UsersPage from '@/pages/UsersPage'
import ApplicationsPage from '@/pages/ApplicationsPage'
import SettingsPage from '@/pages/SettingsPage'
import StatisticsPage from '@/pages/StatisticsPage'

// Customer layout
import CustomerLayout from '@/components/customer/CustomerLayout'

// Customer pages
import HomePage from '@/pages/customer/HomePage'
import SearchPage from '@/pages/customer/SearchPage'
import CustomerRestaurantsPage from '@/pages/customer/RestaurantsPage'
import RestaurantDetailPage from '@/pages/customer/RestaurantDetailPage'
import CartPage from '@/pages/customer/CartPage'
import CheckoutPage from '@/pages/customer/CheckoutPage'
import CustomerOrdersPage from '@/pages/customer/OrdersPage'
import OrderDetailPage from '@/pages/customer/OrderDetailPage'
import ProfilePage from '@/pages/customer/ProfilePage'
import EditProfilePage from '@/pages/customer/EditProfilePage'
import AddressesPage from '@/pages/customer/AddressesPage'
import NotificationSettingsPage from '@/pages/customer/NotificationSettingsPage'
import AccountSettingsPage from '@/pages/customer/AccountSettingsPage'
import ChangePasswordPage from '@/pages/customer/ChangePasswordPage'
import NotificationsPage from '@/pages/customer/NotificationsPage'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/home" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Guest-only routes */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestRoute>
                  <ForgotPasswordPage />
                </GuestRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <GuestRoute>
                  <ResetPasswordPage />
                </GuestRoute>
              }
            />

            {/* Dashboard (generic protected) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes — protected under Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
              <Route path="/admin/categories" element={<CategoriesPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/applications" element={<ApplicationsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/admin/statistics" element={<StatisticsPage />} />
            </Route>

            {/* Customer routes — protected under CustomerLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<HomePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/restaurants" element={<CustomerRestaurantsPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<CustomerOrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/profile/addresses" element={<AddressesPage />} />
              <Route
                path="/profile/notification-settings"
                element={<NotificationSettingsPage />}
              />
              <Route
                path="/profile/account-settings"
                element={<AccountSettingsPage />}
              />
              <Route
                path="/profile/account-settings/change-password"
                element={<ChangePasswordPage />}
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
