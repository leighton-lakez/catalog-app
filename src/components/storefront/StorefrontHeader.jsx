import { ShoppingCartIcon, MegaphoneIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '../../stores/cartStore'

export default function StorefrontHeader({ store, onOpenCart }) {
  const itemCount = useCartStore(state => state.getItemCount())
  const themeColor = store?.theme_color || '#3B82F6'

  return (
    <div className="sticky top-0 z-40">
      {/* Announcement Banner */}
      {store?.announcement && (
        <div
          className="py-2 px-4 text-center text-sm font-medium text-white"
          style={{ backgroundColor: themeColor }}
        >
          <div className="flex items-center justify-center gap-2">
            <MegaphoneIcon className="h-4 w-4" />
            {store.announcement}
          </div>
        </div>
      )}

      {/* Banner Image */}
      {store?.banner_url && (
        <div className="relative h-32 sm:h-48 overflow-hidden">
          <img
            src={store.banner_url}
            alt="Store Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Header */}
      <header
        className="bg-white border-b border-gray-200"
        style={{ borderBottomColor: themeColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {store?.logo_url && (
                <img
                  src={store.logo_url}
                  alt={store.store_name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                  style={{ marginTop: store?.banner_url ? '-24px' : '0' }}
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {store?.store_name || 'Store'}
                </h1>
                {store?.store_description && (
                  <p className="text-sm text-gray-500 line-clamp-1 max-w-md">
                    {store.store_description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              style={{ color: themeColor }}
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-medium text-white rounded-full"
                  style={{ backgroundColor: themeColor }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </div>
  )
}
