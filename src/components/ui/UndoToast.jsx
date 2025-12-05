import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const UndoContext = createContext()

export function UndoProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showUndo = useCallback((message, onUndo, duration = 5000) => {
    const id = Date.now()

    setToasts(prev => [...prev, { id, message, onUndo }])

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)

    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleUndo = useCallback((toast) => {
    if (toast.onUndo) {
      toast.onUndo()
    }
    dismiss(toast.id)
  }, [dismiss])

  return (
    <UndoContext.Provider value={{ showUndo, dismiss }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg animate-slide-up"
          >
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => handleUndo(toast)}
              className="text-blue-400 hover:text-blue-300 font-medium text-sm"
            >
              Undo
            </button>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-gray-400 hover:text-gray-300 ml-1"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </UndoContext.Provider>
  )
}

export function useUndo() {
  const context = useContext(UndoContext)
  if (!context) {
    throw new Error('useUndo must be used within an UndoProvider')
  }
  return context
}

// Simple toast notifications (non-undo)
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()

    setToasts(prev => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)

    return id
  }, [])

  const success = useCallback((message) => showToast(message, 'success'), [showToast])
  const error = useCallback((message) => showToast(message, 'error'), [showToast])
  const info = useCallback((message) => showToast(message, 'info'), [showToast])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const typeStyles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-gray-900',
  }

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, dismiss }}>
      {children}

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 ${typeStyles[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-up`}
          >
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-white/70 hover:text-white"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const ToastContext = createContext()

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
