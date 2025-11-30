import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../../lib/utils'

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="card group hover:shadow-md transition-shadow">
      <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
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

        {!product.is_active && (
          <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            Inactive
          </div>
        )}

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={() => onEdit(product)}
            className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-2 bg-white rounded-lg shadow hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4 text-red-600" />
          </button>
        </div>
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
