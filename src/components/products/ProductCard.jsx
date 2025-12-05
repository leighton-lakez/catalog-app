import { PencilIcon, TrashIcon, DocumentDuplicateIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../../lib/utils'

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  bulkMode = false,
  isSelected = false,
  onToggleSelect,
}) {
  const isLowStock = product.stock_quantity !== -1 &&
    product.stock_quantity <= (product.low_stock_threshold || 5) &&
    product.stock_quantity > 0

  const isOutOfStock = product.stock_quantity === 0

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 group hover:shadow-lg transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      } ${bulkMode ? 'cursor-pointer' : ''}`}
      onClick={bulkMode ? onToggleSelect : undefined}
    >
      <div className="relative aspect-square mb-3 bg-gray-50 rounded-xl overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {/* Bulk selection checkbox */}
        {bulkMode && (
          <div className="absolute top-2 left-2 z-10">
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
              isSelected
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300'
            }`}>
              {isSelected && <CheckIcon className="h-4 w-4 text-white" />}
            </div>
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {!bulkMode && !product.is_active && (
            <span className="bg-gray-800/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg font-medium">
              Inactive
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg font-medium">
              Out of Stock
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-yellow-500/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
              <ExclamationTriangleIcon className="h-3 w-3" />
              Low
            </span>
          )}
        </div>

        {/* Action buttons - always visible on mobile, hover on desktop */}
        {!bulkMode && (
          <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate?.(product) }}
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all"
              title="Duplicate"
            >
              <DocumentDuplicateIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(product) }}
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all"
              title="Edit"
            >
              <PencilIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(product) }}
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:bg-red-50 hover:shadow-md transition-all"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 truncate text-base">{product.name}</h3>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xl font-bold text-blue-600">
          {formatCurrency(product.price)}
        </span>
        {product.stock_quantity !== -1 && (
          <span className="text-sm text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">
            {product.stock_quantity} left
          </span>
        )}
      </div>

      {product.category && (
        <span className="mt-2 inline-block text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-medium">
          {product.category.name}
        </span>
      )}
    </div>
  )
}
