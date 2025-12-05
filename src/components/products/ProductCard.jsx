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
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!bulkMode && !product.is_active && (
            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
              Inactive
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <ExclamationTriangleIcon className="h-3 w-3" />
              Low Stock
            </span>
          )}
        </div>

        {/* Action buttons - always visible on mobile, hover on desktop */}
        {!bulkMode && (
          <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate?.(product) }}
              className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
              title="Duplicate"
            >
              <DocumentDuplicateIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(product) }}
              className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
              title="Edit"
            >
              <PencilIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(product) }}
              className="p-2 bg-white rounded-lg shadow hover:bg-red-50"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4 text-red-600" />
            </button>
          </div>
        )}
      </div>

      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-lg font-semibold text-blue-600">
          {formatCurrency(product.price)}
        </span>
        {product.stock_quantity !== -1 && (
          <span className="text-sm text-gray-500">
            {product.stock_quantity} in stock
          </span>
        )}
      </div>

      {product.category && (
        <span className="mt-2 inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {product.category.name}
        </span>
      )}
    </div>
  )
}
