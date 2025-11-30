import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePublicPaymentMethods } from '../../hooks/usePaymentMethods'
import CheckoutForm from '../../components/storefront/CheckoutForm'
import { LoadingPage } from '../../components/ui/Loading'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function Checkout() {
  const { slug } = useParams()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      } catch (err) {
        console.error('Error fetching store:', err)
        setError('Store not found')
      } finally {
        setLoading(false)
      }
    }

    fetchStore()
  }, [slug])

  const { paymentMethods, loading: paymentLoading } = usePublicPaymentMethods(store?.id)

  if (loading || paymentLoading) {
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
      <header
        className="bg-white border-b"
        style={{ borderBottomColor: store.theme_color }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to={`/store/${slug}`}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to store
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutForm
          store={store}
          paymentMethods={paymentMethods}
        />
      </main>
    </div>
  )
}
