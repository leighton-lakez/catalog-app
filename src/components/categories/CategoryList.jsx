import { useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon } from '@heroicons/react/24/outline'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import EmptyState from '../ui/EmptyState'

export default function CategoryList({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  loading,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const handleOpenModal = (category = null) => {
    setEditingCategory(category)
    setCategoryName(category?.name || '')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setCategoryName('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    setFormLoading(true)
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, { name: categoryName.trim() })
      } else {
        await onCreateCategory(categoryName.trim())
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? Products in this category will become uncategorized.`)) {
      try {
        await onDeleteCategory(category.id)
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Failed to delete category')
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderIcon}
          title="No categories yet"
          description="Create categories to organize your products"
          action={
            <Button onClick={() => handleOpenModal()}>
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Category
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="card flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <FolderIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenModal(category)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <PencilIcon className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
            required
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              {editingCategory ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
