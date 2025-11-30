import { formatCurrency } from '../../lib/utils'
import { useCartStore } from '../../stores/cartStore'
import { PlusIcon, CheckIcon } from '@heroicons/react/24/outline'

function ProductGridCard({ product, themeColor, showDescription, showStock }) {
  const { items, addItem } = useCartStore()
  const isInCart = items.some(item => item.id === product.id)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    })
  }

  const isOutOfStock = product.stock_quantity === 0
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-gray-100">
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

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {showStock && isLowStock && !isOutOfStock && (
          <div className="absolute top-2 left-2">
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Only {product.stock_quantity} left
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
        {showDescription && product.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        )}

        {showStock && !isOutOfStock && product.stock_quantity >= 0 && (
          <p className="mt-1 text-xs text-green-600">In Stock</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span
            className="text-lg font-bold"
            style={{ color: themeColor }}
          >
            {formatCurrency(product.price)}
          </span>

          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: isInCart ? '#22c55e' : themeColor }}
            >
              {isInCart ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Added
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductListCard({ product, themeColor, showDescription, showStock }) {
  const { items, addItem } = useCartStore()
  const isInCart = items.some(item => item.id === product.id)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    })
  }

  const isOutOfStock = product.stock_quantity === 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex hover:shadow-md transition-shadow">
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 flex-shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{product.name}</h3>
          {showDescription && product.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
          )}
          {showStock && !isOutOfStock && product.stock_quantity >= 0 && (
            <p className="mt-1 text-xs text-green-600">In Stock</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span
            className="text-lg font-bold"
            style={{ color: themeColor }}
          >
            {formatCurrency(product.price)}
          </span>

          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: isInCart ? '#22c55e' : themeColor }}
            >
              {isInCart ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Added
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductGrid({ products, categories, themeColor, layout = 'grid', showDescription = true, showStock = true }) {
  const productsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = products.filter(p => p.category_id === category.id)
    return acc
  }, {})

  const uncategorized = products.filter(p => !p.category_id)

  const ProductCard = layout === 'list' ? ProductListCard : ProductGridCard

  const gridClass = layout === 'list'
    ? 'space-y-4'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'

  return (
    <div className="space-y-8">
      {categories.map(category => {
        const categoryProducts = productsByCategory[category.id]
        if (categoryProducts.length === 0) return null

        return (
          <div key={category.id}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{category.name}</h2>
            <div className={gridClass}>
              {categoryProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  themeColor={themeColor}
                  showDescription={showDescription}
                  showStock={showStock}
                />
              ))}
            </div>
          </div>
        )
      })}

      {uncategorized.length > 0 && (
        <div>
          {categories.length > 0 && (
            <h2 className="text-xl font-bold text-gray-900 mb-4">Other Products</h2>
          )}
          <div className={gridClass}>
            {uncategorized.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                themeColor={themeColor}
                showDescription={showDescription}
                showStock={showStock}
              />
            ))}
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products available yet.</p>
        </div>
      )}
    </div>
  )
}
