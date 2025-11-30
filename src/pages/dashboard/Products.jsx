import { useState } from 'react'
import ProductList from '../../components/products/ProductList'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { CubeIcon, FolderIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import EmptyState from '../../components/ui/EmptyState'

export default function Products() {
  const [activeTab, setActiveTab] = useState('products')
  const [filterCategory, setFilterCategory] = useState(null)

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryFormLoading, setCategoryFormLoading] = useState(false)

  const {
    products,
    loading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
  } = useProducts()

  const {
    categories,
    loading: categoriesLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories()

  // Count products per category
  const getProductCount = (categoryId) => {
    return products.filter(p => p.category_id === categoryId).length
  }

  // Handle clicking a category to filter products
  const handleCategoryClick = (category) => {
    setFilterCategory(category.id)
    setActiveTab('products')
  }

  // Category modal handlers
  const handleOpenCategoryModal = (category = null) => {
    setEditingCategory(category)
    setCategoryName(category?.name || '')
    setIsCategoryModalOpen(true)
  }

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false)
    setEditingCategory(null)
    setCategoryName('')
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    setCategoryFormLoading(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: categoryName.trim() })
      } else {
        await createCategory(categoryName.trim())
      }
      handleCloseCategoryModal()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    } finally {
      setCategoryFormLoading(false)
    }
  }

  const handleDeleteCategory = async (category, e) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${category.name}"? Products will become uncategorized.`)) {
      try {
        await deleteCategory(category.id)
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Failed to delete category')
      }
    }
  }

  const tabs = [
    { id: 'products', name: 'Products', icon: CubeIcon, count: products.length },
    { id: 'categories', name: 'Categories', icon: FolderIcon, count: categories.length },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              if (tab.id === 'categories') setFilterCategory(null)
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.name}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Category Filter Banner */}
      {filterCategory && activeTab === 'products' && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
          <div className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">
              Showing: {categories.find(c => c.id === filterCategory)?.name}
            </span>
            <span className="text-blue-600 text-sm">
              ({products.filter(p => p.category_id === filterCategory).length} products)
            </span>
          </div>
          <button
            onClick={() => setFilterCategory(null)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <ProductList
          products={products}
          categories={categories}
          onCreateProduct={createProduct}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
          onUploadImage={uploadImage}
          loading={productsLoading}
          initialCategoryFilter={filterCategory}
        />
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Manage Categories</h2>
            <Button onClick={() => handleOpenCategoryModal()}>
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Category
            </Button>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={FolderIcon}
              title="No categories yet"
              description="Create categories to organize your products"
              action={
                <Button onClick={() => handleOpenCategoryModal()}>
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Add Category
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const productCount = getProductCount(category.id)
                return (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                          <FolderIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {productCount} product{productCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenCategoryModal(category)
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg"
                        >
                          <PencilIcon className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCategory(category, e)}
                          className="p-1.5 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-blue-600 font-medium group-hover:underline">
                      Click to view products →
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Category Modal */}
          <Modal
            isOpen={isCategoryModalOpen}
            onClose={handleCloseCategoryModal}
            title={editingCategory ? 'Edit Category' : 'Add Category'}
            size="sm"
          >
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <Input
                label="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
                autoFocus
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleCloseCategoryModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={categoryFormLoading}>
                  {editingCategory ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  )
}
