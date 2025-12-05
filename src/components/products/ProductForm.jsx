import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Input, { Textarea, Select } from '../ui/Input'
import MultiImageUpload from './MultiImageUpload'
import { PlusIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'

export default function ProductForm({
  product,
  categories,
  onSubmit,
  onCancel,
  onUploadImage,
  loading,
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost_price: '',
    price: '',
    category_id: '',
    stock_quantity: '-1',
    low_stock_threshold: '5',
    is_active: true,
    image_url: '',
    images: [],
    variants: [],
  })

  const [showVariants, setShowVariants] = useState(false)

  useEffect(() => {
    if (product) {
      // Parse images from JSON if stored as string
      let images = []
      if (product.images) {
        try {
          images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
        } catch (e) {
          images = []
        }
      }
      // If no images array but has image_url, use that as first image
      if (images.length === 0 && product.image_url) {
        images = [product.image_url]
      }

      // Parse variants
      let variants = []
      if (product.variants) {
        try {
          variants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants
        } catch (e) {
          variants = []
        }
      }

      setFormData({
        name: product.name || '',
        description: product.description || '',
        cost_price: product.cost_price?.toString() || '',
        price: product.price?.toString() || '',
        category_id: product.category_id || '',
        stock_quantity: product.stock_quantity?.toString() || '-1',
        low_stock_threshold: product.low_stock_threshold?.toString() || '5',
        is_active: product.is_active ?? true,
        image_url: product.image_url || '',
        images: images,
        variants: variants,
      })

      if (variants.length > 0) {
        setShowVariants(true)
      }
    }
  }, [product])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Use first image as the main image_url for backwards compatibility
    const mainImage = formData.images.length > 0 ? formData.images[0] : formData.image_url

    const submitData = {
      ...formData,
      cost_price: parseFloat(formData.cost_price) || 0,
      price: parseFloat(formData.price) || 0,
      stock_quantity: parseInt(formData.stock_quantity) || -1,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
      category_id: formData.category_id || null,
      image_url: mainImage,
      images: JSON.stringify(formData.images),
      variants: JSON.stringify(formData.variants),
    }

    onSubmit(submitData)
  }

  // Variant management functions
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', value: '', price_adjustment: 0, stock: -1 }]
    }))
  }

  const updateVariant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => i === index ? { ...v, [field]: value } : v)
    }))
  }

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  // Calculate profit margin
  const costPrice = parseFloat(formData.cost_price) || 0
  const sellPrice = parseFloat(formData.price) || 0
  const profit = sellPrice - costPrice
  const profitMargin = sellPrice > 0 ? ((profit / sellPrice) * 100).toFixed(1) : 0

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const categoryOptions = [
    { value: '', label: 'No category' },
    ...categories.map(c => ({ value: c.id, label: c.name })),
  ]


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MultiImageUpload
        images={formData.images}
        onChange={(images) => setFormData(prev => ({ ...prev, images }))}
        onUpload={onUploadImage}
        maxImages={10}
      />

      <Input
        label="Product Name"
        value={formData.name}
        onChange={handleChange('name')}
        placeholder="Enter product name"
        required
      />

      <Textarea
        label="Description"
        value={formData.description}
        onChange={handleChange('description')}
        placeholder="Enter product description (optional)"
        rows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Cost Price ($)"
          type="number"
          step="0.01"
          min="0"
          value={formData.cost_price}
          onChange={handleChange('cost_price')}
          placeholder="0.00"
          hint="What you paid for it"
        />

        <Input
          label="Sell Price ($)"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handleChange('price')}
          placeholder="0.00"
          required
        />
      </div>

      {/* Profit Preview */}
      {(costPrice > 0 || sellPrice > 0) && (
        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Profit per item:</span>
          <div className="text-right">
            <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${profit.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 ml-2">
              ({profitMargin}% margin)
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stock Quantity"
          type="number"
          min="-1"
          value={formData.stock_quantity}
          onChange={handleChange('stock_quantity')}
          placeholder="-1 for unlimited"
          hint="Use -1 for unlimited stock"
        />

        <Input
          label="Low Stock Alert"
          type="number"
          min="0"
          value={formData.low_stock_threshold}
          onChange={handleChange('low_stock_threshold')}
          placeholder="5"
          hint="Alert when stock falls below"
        />
      </div>

      <Select
        label="Category"
        value={formData.category_id}
        onChange={handleChange('category_id')}
        options={categoryOptions}
      />

      {/* Product Variants */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            Product Variants (Size, Color, etc.)
          </label>
          <button
            type="button"
            onClick={() => setShowVariants(!showVariants)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showVariants ? 'Hide Variants' : 'Add Variants'}
          </button>
        </div>

        {showVariants && (
          <div className="space-y-3">
            {formData.variants.map((variant, index) => (
              <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Type (e.g., Size)"
                    value={variant.name}
                    onChange={(e) => updateVariant(index, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., Large)"
                    value={variant.value}
                    onChange={(e) => updateVariant(index, 'value', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price +/-"
                    value={variant.price_adjustment}
                    onChange={(e) => updateVariant(index, 'price_adjustment', parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Stock (-1 = base)"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || -1)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 py-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Variant
            </button>

            {formData.variants.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No variants added. Click "Add Variant" to create size, color, or other options.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={handleChange('is_active')}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
          Product is active and visible in store
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  )
}
