import { classNames } from '../../lib/utils'

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
  icon: Icon,
  change,
  changeType = 'neutral',
  color = 'blue',
}) {
  const scheme = colorSchemes[color] || colorSchemes.blue

  return (
    <div className={classNames(
      'rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
      scheme.bg
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className={classNames('text-sm font-medium', scheme.subtext)}>{title}</p>
          <p className={classNames('mt-2 text-3xl font-bold', scheme.text)}>{value}</p>
        </div>
        {Icon && (
          <div className={classNames('p-3 rounded-xl', scheme.iconBg)}>
            <Icon className={classNames('h-8 w-8', scheme.text)} />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-4">
          <span className={classNames(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
            'bg-white/20 text-white'
          )}>
            {change}
          </span>
        </div>
      )}
    </div>
  )
}
