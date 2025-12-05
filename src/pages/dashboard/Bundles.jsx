import { useState } from 'react'
import { useBundles, calculateBundlePrice } from '../../hooks/useBundles'
import { useProducts } from '../../hooks/useProducts'
import { formatCurrency } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import {
  CubeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export default function Bundles() {
  const { bundles, loading, createBundle, updateBundle, deleteBundle, toggleBundleActive } = useBundles()
  const { products } = useProducts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bundle_price: '',
    is_active: true,
  })
  const [selectedItems, setSelectedItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const openModal = (bundle = null) => {
    if (bundle) {
      setEditingBundle(bundle)
      setFormData({
        name: bundle.name,
        description: bundle.description || '',
        bundle_price: bundle.bundle_price || '',
        is_active: bundle.is_active,
      })
      setSelectedItems(bundle.bundle_items?.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.products,
      })) || [])
    } else {
      setEditingBundle(null)
      setFormData({
        name: '',
        description: '',
        bundle_price: '',
        is_active: true,
      })
      setSelectedItems([])
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBundle(null)
    setSearchQuery('')
  }

  const addProduct = (product) => {
    const existing = selectedItems.find(item => item.product_id === product.id)
    if (existing) {
      setSelectedItems(selectedItems.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setSelectedItems([...selectedItems, {
        product_id: product.id,
        quantity: 1,
        product,
      }])
    }
    setSearchQuery('')
  }

  const updateItemQuantity = (productId, delta) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const removeItem = (productId) => {
    setSelectedItems(selectedItems.filter(item => item.product_id !== productId))
  }

  const originalPrice = selectedItems.reduce((sum, item) => {
    return sum + ((item.product?.price || 0) * item.quantity)
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedItems.length < 2) {
      alert('A bundle must have at least 2 products')
      return
    }

    setFormLoading(true)
    try {
      const bundleData = {
        name: formData.name,
        description: formData.description || null,
        bundle_price: formData.bundle_price ? parseFloat(formData.bundle_price) : originalPrice,
        is_active: formData.is_active,
      }
      const items = selectedItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }))

      if (editingBundle) {
        await updateBundle(editingBundle.id, bundleData, items)
      } else {
        await createBundle(bundleData, items)
      }
      closeModal()
    } catch (error) {
      console.error('Error saving bundle:', error)
      alert('Failed to save bundle')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (bundleId) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return
    try {
      await deleteBundle(bundleId)
    } catch (error) {
      console.error('Error deleting bundle:', error)
      alert('Failed to delete bundle')
    }
  }

  const handleToggleActive = async (bundle) => {
    try {
      await toggleBundleActive(bundle.id, !bundle.is_active)
    } catch (error) {
      console.error('Error toggling bundle:', error)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    p.is_active
  ).slice(0, 8)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Bundles</h1>
          <p className="text-gray-500 mt-1">
            Create product bundles with special pricing
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-5 w-5 mr-1" />
          Create Bundle
        </Button>
      </div>

      {bundles.length === 0 ? (
        <EmptyState
          icon={CubeIcon}
          title="No bundles yet"
          description="Create product bundles to offer special deals and increase average order value."
          action={
            <Button onClick={() => openModal()}>
              <PlusIcon className="h-5 w-5 mr-1" />
              Create Bundle
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => {
            const pricing = calculateBundlePrice(bundle)
            return (
              <div
                key={bundle.id}
                className={`bg-white rounded-xl border p-5 ${
                  !bundle.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{bundle.name}</h3>
                    {bundle.description && (
                      <p className="text-sm text-gray-500 mt-1">{bundle.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleActive(bundle)}
                    className={`p-1 rounded-full ${
                      bundle.is_active
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    title={bundle.is_active ? 'Active' : 'Inactive'}
                  >
                    {bundle.is_active ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <XMarkIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Bundle Items */}
                <div className="space-y-2 mb-4">
                  {bundle.bundle_items?.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.products?.image_url ? (
                          <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                      </div>
                      <span className="text-gray-700 truncate flex-1">{item.products?.name}</span>
                      <span className="text-gray-500">x{item.quantity}</span>
                    </div>
                  ))}
                  {bundle.bundle_items?.length > 3 && (
                    <p className="text-xs text-gray-500">+{bundle.bundle_items.length - 3} more items</p>
                  )}
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 line-through">
                        {formatCurrency(pricing.originalPrice)}
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(pricing.bundlePrice)}
                      </p>
                    </div>
                    {pricing.savings > 0 && (
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm font-medium">
                        Save {pricing.savingsPercent}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(bundle)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bundle.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBundle ? 'Edit Bundle' : 'Create Bundle'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Product Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Products</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {searchQuery && (
              <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">No products found</div>
                ) : (
                  filteredProducts.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 text-left"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
                        )}
                      </div>
                      <span className="flex-1 text-sm truncate">{product.name}</span>
                      <span className="text-sm text-gray-500">{formatCurrency(product.price)}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bundle Items ({selectedItems.length})
              </label>
              <div className="border rounded-lg divide-y">
                {selectedItems.map(item => (
                  <div key={item.product_id} className="flex items-center gap-2 p-2">
                    <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.product?.image_url ? (
                        <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
                      )}
                    </div>
                    <span className="flex-1 text-sm truncate">{item.product?.name}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => updateItemQuantity(item.product_id, -1)} className="p-1 hover:bg-gray-100 rounded">
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => updateItemQuantity(item.product_id, 1)} className="p-1 hover:bg-gray-100 rounded">
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <button type="button" onClick={() => removeItem(item.product_id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                {formatCurrency(originalPrice)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.bundle_price}
                onChange={(e) => setFormData({ ...formData, bundle_price: e.target.value })}
                placeholder={originalPrice.toString()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {formData.bundle_price && parseFloat(formData.bundle_price) < originalPrice && (
            <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
              Customers save {formatCurrency(originalPrice - parseFloat(formData.bundle_price))} ({Math.round((1 - parseFloat(formData.bundle_price) / originalPrice) * 100)}% off)
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible on store)</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading || selectedItems.length < 2}>
              {formLoading ? 'Saving...' : editingBundle ? 'Update Bundle' : 'Create Bundle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
