import { useState, useEffect } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

function getMotivationalMessage(stats) {
  const messages = [
    "Let's make today count!",
    "Ready to crush your goals?",
    "Your store is looking great!",
    "Time to grow your business!",
    "Success is waiting for you!",
  ]

  // Contextual messages based on stats
  if (stats.totalOrders > 0 && stats.totalOrders % 10 === 0) {
    return `Congrats on ${stats.totalOrders} orders!`
  }
  if (stats.totalRevenue > 1000) {
    return "You're doing amazing!"
  }

  return messages[Math.floor(Math.random() * messages.length)]
}

function getEmoji() {
  const hour = new Date().getHours()
  if (hour < 12) return '☀️'
  if (hour < 17) return '🌤️'
  if (hour < 21) return '🌆'
  return '🌙'
}

export default function WelcomeAnimation({ storeName, stats, onComplete }) {
  const [phase, setPhase] = useState('entering') // entering, visible, exiting, done
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Phase 1: Card enters
    const enterTimer = setTimeout(() => {
      setShowContent(true)
    }, 100)

    // Phase 2: Show content, then start exit
    const visibleTimer = setTimeout(() => {
      setPhase('exiting')
    }, 2500)

    // Phase 3: Complete animation
    const exitTimer = setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 3200)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(visibleTimer)
      clearTimeout(exitTimer)
    }
  }, [onComplete])

  if (phase === 'done') return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 transition-opacity duration-700 ${
        phase === 'exiting' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 4}s`,
            }}
          />
        ))}
      </div>

      {/* Welcome Card */}
      <div
        className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 max-w-lg mx-4 text-center text-white transform transition-all duration-700 ${
          showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'
        }`}
      >
        {/* Sparkle icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-white/20 animate-pulse">
          <SparklesIcon className="h-8 w-8" />
        </div>

        {/* Greeting */}
        <div className="space-y-2 mb-6">
          <p className="text-white/80 text-lg">
            {getGreeting()} {getEmoji()}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">
            {storeName || 'Welcome back'}!
          </h1>
          <p className="text-white/70 text-lg mt-4">
            {getMotivationalMessage(stats)}
          </p>
        </div>

        {/* Quick Stats Preview */}
        {stats && (stats.totalOrders > 0 || stats.totalRevenue > 0) && (
          <div className="flex justify-center gap-8 mt-8 pt-6 border-t border-white/20">
            <div>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
              <p className="text-white/60 text-sm">Orders</p>
            </div>
            <div>
              <p className="text-3xl font-bold">${Math.round(stats.totalRevenue).toLocaleString()}</p>
              <p className="text-white/60 text-sm">Revenue</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
              <p className="text-white/60 text-sm">Products</p>
            </div>
          </div>
        )}

        {/* Loading dots */}
        <div className="flex justify-center gap-1 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
