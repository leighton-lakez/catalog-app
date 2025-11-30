import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePublicProducts } from '../../hooks/useProducts'
import { usePublicCategories } from '../../hooks/useCategories'
import { useCartStore } from '../../stores/cartStore'
import StorefrontHeader from '../../components/storefront/StorefrontHeader'
import ProductGrid from '../../components/storefront/ProductGrid'
import CartDrawer from '../../components/storefront/CartDrawer'
import { LoadingPage } from '../../components/ui/Loading'

export default function Store() {
  const { slug } = useParams()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const { setStoreSlug } = useCartStore()

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const { data, error } = await supabase
          .from('resellers')
          .select('*')
          .eq('store_slug', slug)
          .single()

        if (error) throw error
        setStore(data)
        setStoreSlug(slug)
      } catch (err) {
        console.error('Error fetching store:', err)
        setError('Store not found')
      } finally {
        setLoading(false)
      }
    }

    fetchStore()
  }, [slug, setStoreSlug])

  const { products, loading: productsLoading } = usePublicProducts(store?.id)
  const { categories } = usePublicCategories(store?.id)

  if (loading) {
    return <LoadingPage />
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-500">The store you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StorefrontHeader
        store={store}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-xl" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid
            products={products}
            categories={categories}
            themeColor={store.theme_color || '#3B82F6'}
            layout={store.store_layout || 'grid'}
            showDescription={store.show_description !== false}
            showStock={store.show_stock !== false}
          />
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        storeSlug={slug}
        themeColor={store.theme_color || '#3B82F6'}
      />
    </div>
  )
}
