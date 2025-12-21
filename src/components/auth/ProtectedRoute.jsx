import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, reseller, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Easter egg for resell shores
  if (reseller?.store_name?.toLowerCase() === 'resell shores') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6 animate-bounce">🚫</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            You really thought you can use this app?? 😂😂😂
          </h1>
          <p className="text-xl text-purple-300 mb-6">
            To use this app send $100 Zelle to
          </p>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
            <p className="text-2xl font-mono font-bold text-green-400">9173929040</p>
          </div>
          <div className="text-4xl animate-pulse">💸💸💸</div>
        </div>
      </div>
    )
  }

  return children
}
