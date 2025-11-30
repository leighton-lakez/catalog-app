export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="text-center py-16 px-6">
      {Icon && (
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
          <Icon className="h-10 w-10 text-blue-600" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 max-w-md mx-auto mb-8">{description}</p>
      )}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}
