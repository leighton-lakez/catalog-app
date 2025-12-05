import { useState, useEffect } from 'react'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import ProductCard from './ProductCard'
import ProductForm from './ProductForm'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import { exportProducts } from '../../lib/export'

export default function ProductList({
  products,
  categories,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUploadImage,
  loading,
  initialCategoryFilter = null,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryFilter || '')
  const [formLoading, setFormLoading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [bulkMode, setBulkMode] = useState(false)

  // Sync with external category filter
  useEffect(() => {
    setSelectedCategory(initialCategoryFilter || '')
  }, [initialCategoryFilter])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleOpenModal = (product = null) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (data) => {
    setFormLoading(true)
    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, data)
      } else {
        await onCreateProduct(data)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await onDeleteProduct(product.id)
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product')
      }
    }
  }

  // Duplicate product
  const handleDuplicate = async (product) => {
    const duplicatedData = {
      name: `${product.name} (Copy)`,
      description: product.description,
      price: product.price,
      cost_price: product.cost_price,
      category_id: product.category_id,
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      is_active: false, // Start as inactive
      image_url: product.image_url,
      images: product.images,
      variants: product.variants,
    }
    try {
      await onCreateProduct(duplicatedData)
    } catch (error) {
      console.error('Error duplicating product:', error)
      alert('Failed to duplicate product')
    }
  }

  // Bulk selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedProducts.length} products?`)) return

    for (const id of selectedProducts) {
      try {
        await onDeleteProduct(id)
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
    setSelectedProducts([])
    setBulkMode(false)
  }

  const handleExport = () => {
    const productsWithCategories = products.map(p => ({
      ...p,
      categories: categories.find(c => c.id === p.category_id),
    }))
    exportProducts(productsWithCategories)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="secondary" onClick={() => setBulkMode(!bulkMode)}>
            {bulkMode ? 'Cancel' : 'Bulk Edit'}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={selectAll}
              className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                selectedProducts.length === filteredProducts.length && filteredProducts.length > 0
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-300'
              }`}>
                {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 && (
                  <CheckIcon className="h-3 w-3 text-white" />
                )}
              </div>
              Select All
            </button>
            <span className="text-sm text-gray-600">
              {selectedProducts.length} selected
            </span>
          </div>
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4" />
              Delete Selected
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={CubeIcon}
          title={searchQuery || selectedCategory ? 'No products found' : 'No products yet'}
          description={
            searchQuery || selectedCategory
              ? 'Try adjusting your search or filters'
              : 'Add your first product to get started'
          }
          action={
            !searchQuery && !selectedCategory && (
              <Button onClick={() => handleOpenModal()}>
                <PlusIcon className="h-5 w-5 mr-1" />
                Add Product
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              bulkMode={bulkMode}
              isSelected={selectedProducts.includes(product.id)}
              onToggleSelect={() => toggleProductSelection(product.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="md"
      >
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          onUploadImage={onUploadImage}
          loading={formLoading}
        />
      </Modal>
    </div>
  )
}
