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
        'rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-[1.02]',
        scheme.bg,
        animate ? 'animate-fade-in-up' : ''
      )}
      style={animate ? { animationDelay: `${delay}ms` } : {}}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={classNames('text-xs sm:text-sm font-medium truncate', scheme.subtext)}>{title}</p>
          <p className={classNames('mt-1 sm:mt-2 text-lg sm:text-xl lg:text-3xl font-bold truncate', scheme.text)}>{displayValue}</p>
        </div>
        {Icon && (
          <div className={classNames('p-2 sm:p-3 rounded-xl flex-shrink-0', scheme.iconBg)}>
            <Icon className={classNames('h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8', scheme.text)} />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-2 sm:mt-4">
          <span className={classNames(
            'inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold',
            'bg-white/20 text-white'
          )}>
            {change}
          </span>
        </div>
      )}
    </div>
  )
}
