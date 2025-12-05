import { useState, useEffect } from 'react'
import { XMarkIcon, DevicePhoneMobileIcon, ArrowUpOnSquareIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true
    setIsStandalone(standalone)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

    // Show prompt if not standalone, not dismissed in last 7 days
    if (!standalone && daysSinceDismissed > 7) {
      // Delay showing the prompt for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
      return () => clearTimeout(timer)
    }

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome/Android - use native prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    } else {
      // iOS or other - show instructions
      setShowInstructions(true)
    }
  }

  if (isStandalone || !showPrompt) return null

  return (
    <>
      {/* Floating sticker/banner */}
      {!showInstructions && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-4 text-white">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DevicePhoneMobileIcon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Get the App!</h3>
                <p className="text-white/80 text-sm">Install for the best experience</p>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full bg-white text-blue-600 font-semibold py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Install Now
            </button>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Install the App</h3>
                <button
                  onClick={() => {
                    setShowInstructions(false)
                    handleDismiss()
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {isIOS ? (
                // iOS Instructions
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Add this app to your home screen for quick access and a native app experience.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-blue-600">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Tap the Share button</p>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowUpOnSquareIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm text-gray-500">at the bottom of Safari</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-blue-600">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Scroll and tap "Add to Home Screen"</p>
                        <div className="flex items-center gap-1 mt-1">
                          <PlusIcon className="h-5 w-5 text-gray-600" />
                          <span className="text-sm text-gray-500">in the share menu</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-blue-600">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Tap "Add" to confirm</p>
                        <span className="text-sm text-gray-500">The app will appear on your home screen</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-3 mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Open the app from your home screen for a full-screen experience without Safari bars!
                    </p>
                  </div>
                </div>
              ) : (
                // Android/Other Instructions
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Add this app to your home screen for quick access.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-blue-600">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Tap the menu button</p>
                        <span className="text-sm text-gray-500">Three dots (⋮) in your browser</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-blue-600">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Select "Add to Home screen"</p>
                        <span className="text-sm text-gray-500">or "Install app"</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-blue-600">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Confirm installation</p>
                        <span className="text-sm text-gray-500">The app will be added to your home screen</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowInstructions(false)
                  handleDismiss()
                }}
                className="w-full mt-4 bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </>
  )
}
