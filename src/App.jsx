import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './components/dashboard/DashboardLayout'

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

// Storefront pages
import Store from './pages/storefront/Store'
import Checkout from './pages/storefront/Checkout'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          </Route>

          {/* Public storefront routes */}
          <Route path="/store/:slug" element={<Store />} />
          <Route path="/store/:slug/checkout" element={<Checkout />} />

          {/* 404 - redirect to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
