import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePublicProducts } from '../../hooks/useProducts'
import { usePublicCategories } from '../../hooks/useCategories'
import { useCartStore } from '../../stores/cartStore'
import StorefrontHeader from '../../components/storefront/StorefrontHeader'
import ProductGrid from '../../components/storefront/ProductGrid'
import StorefrontSections from '../../components/storefront/StorefrontSections'
import CartDrawer from '../../components/storefront/CartDrawer'
import { LoadingPage } from '../../components/ui/Loading'

export default function Store() {
  const { slug } = useParams()
  const [store, setStore] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const { setStoreSlug, addItem } = useCartStore()

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

        // Parse store sections
        if (data.store_sections) {
          try {
            const parsed = typeof data.store_sections === 'string'
              ? JSON.parse(data.store_sections)
              : data.store_sections
            setSections(parsed)
          } catch (e) {
            console.error('Error parsing sections:', e)
            setSections([])
          }
        }
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

  const handleAddToCart = (product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
    })
    setIsCartOpen(true)
  }

  // Check if store has custom sections
  const hasSections = sections && sections.length > 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Branding Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-1.5 text-xs font-medium">
        Built with <a href="/" target="_blank" className="underline hover:text-blue-200">Resell Catalog</a>
      </div>

      {/* Only show header if no sections (sections may include their own header/announcement) */}
      {!hasSections && (
        <StorefrontHeader
          store={store}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {hasSections ? (
        <>
          {/* Floating Cart Button when using sections */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg text-white"
            style={{ backgroundColor: store.theme_color || '#3B82F6' }}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>

          {/* Store Header Bar */}
          <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                {store.logo_url ? (
                  <img src={store.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: store.theme_color || '#3B82F6' }}
                  >
                    {store.store_name?.charAt(0) || 'S'}
                  </div>
                )}
                <span className="font-bold text-gray-900">{store.store_name}</span>
              </div>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2"
                style={{ color: store.theme_color || '#3B82F6' }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </header>

          {/* Render Custom Sections */}
          {productsLoading ? (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>
          ) : (
            <StorefrontSections
              sections={sections}
              themeColor={store.theme_color || '#3B82F6'}
              products={products}
              categories={categories}
              onAddToCart={handleAddToCart}
            />
          )}
        </>
      ) : (
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
      )}

      {/* Footer Branding */}
      <footer className="mt-auto bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            Built with{' '}
            <a
              href="/"
              target="_blank"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Resell Catalog
            </a>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Create your own online store for free
          </p>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        storeSlug={slug}
        themeColor={store.theme_color || '#3B82F6'}
      />
    </div>
  )
}
