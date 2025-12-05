import { classNames } from '../../lib/utils'
import { useCountUp, formatCountedCurrency } from '../../hooks/useCountUp'

const colorSchemes = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    iconBg: 'bg-blue-400/30',
    text: 'text-white',
    subtext: 'text-blue-100',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-400/30',
    text: 'text-white',
    subtext: 'text-emerald-100',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    iconBg: 'bg-purple-400/30',
    text: 'text-white',
    subtext: 'text-purple-100',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    iconBg: 'bg-orange-400/30',
    text: 'text-white',
    subtext: 'text-orange-100',
  },
}

export default function StatsCard({
  title,
  value,
  numericValue,
  isCurrency = false,
  icon: Icon,
  change,
  changeType = 'neutral',
  color = 'blue',
  animate = false,
  delay = 0,
}) {
  const scheme = colorSchemes[color] || colorSchemes.blue

  // Use count up animation if numeric value is provided and animation is enabled
  const countedValue = useCountUp(
    animate && numericValue !== undefined ? numericValue : 0,
    1500 + delay,
    animate && numericValue !== undefined
  )

  // Determine what to display
  const displayValue = animate && numericValue !== undefined
    ? (isCurrency ? formatCountedCurrency(countedValue) : Math.round(countedValue).toLocaleString())
    : value

  return (
    <div
      className={classNames(
        'rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-[1.02] h-full',
        scheme.bg,
        animate ? 'animate-fade-in-up' : ''
      )}
      style={animate ? { animationDelay: `${delay}ms` } : {}}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
          <p className={classNames('text-xs sm:text-sm font-medium', scheme.subtext)}>{title}</p>
          {Icon && (
            <div className={classNames('p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0', scheme.iconBg)}>
              <Icon className={classNames('h-4 w-4 sm:h-5 sm:w-5', scheme.text)} />
            </div>
          )}
        </div>
        <p className={classNames('text-lg sm:text-xl lg:text-2xl font-bold', scheme.text)}>{displayValue}</p>
        {change && (
          <div className="mt-auto pt-2 sm:pt-3">
            <span className={classNames(
              'inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold',
              'bg-white/20 text-white'
            )}>
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
