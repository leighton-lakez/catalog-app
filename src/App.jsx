import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { UndoProvider } from './components/ui/UndoToast'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminProtectedRoute from './components/auth/AdminProtectedRoute'
import DashboardLayout from './components/dashboard/DashboardLayout'
import AdminLayout from './components/admin/AdminLayout'
import PWAInstallPrompt from './components/ui/PWAInstallPrompt'

// Public pages
import Home from './pages/Home'

// Auth pages
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard'
import Products from './pages/dashboard/Products'
import Orders from './pages/dashboard/Orders'
import Expenses from './pages/dashboard/Expenses'
import Analytics from './pages/dashboard/Analytics'
import Settings from './pages/dashboard/Settings'
import StoreBuilderPage from './pages/dashboard/StoreBuilderPage'
import DiscountCodes from './pages/dashboard/DiscountCodes'
import Reviews from './pages/dashboard/Reviews'
import Bundles from './pages/dashboard/Bundles'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSettings from './pages/admin/AdminSettings'

// Storefront pages
import Store from './pages/storefront/Store'
import Checkout from './pages/storefront/Checkout'

function App() {
  return (
    <AuthProvider>
      <UndoProvider>
        <BrowserRouter>
          <PWAInstallPrompt />
          <Routes>
          {/* Public home page */}
          <Route path="/" element={<Home />} />

          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Navigate to="/dashboard/products" replace />} />
            <Route path="orders" element={<Orders />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="store-builder" element={<StoreBuilderPage />} />
            <Route path="discounts" element={<DiscountCodes />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="bundles" element={<Bundles />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Public storefront routes */}
          <Route path="/store/:slug" element={<Store />} />
          <Route path="/store/:slug/checkout" element={<Checkout />} />

          {/* 404 - redirect to home */}
          <Route path="*" element={<Home />} />
            </Routes>
        </BrowserRouter>
      </UndoProvider>
    </AuthProvider>
  )
}

export default App
