import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Input, { Textarea, Select } from '../ui/Input'
import ImageUpload from './ImageUpload'

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
    is_active: true,
    image_url: '',
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        cost_price: product.cost_price?.toString() || '',
        price: product.price?.toString() || '',
        category_id: product.category_id || '',
        stock_quantity: product.stock_quantity?.toString() || '-1',
        is_active: product.is_active ?? true,
        image_url: product.image_url || '',
      })
    }
  }, [product])

  const handleSubmit = (e) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      cost_price: parseFloat(formData.cost_price) || 0,
      price: parseFloat(formData.price) || 0,
      stock_quantity: parseInt(formData.stock_quantity) || -1,
      category_id: formData.category_id || null,
    }

    onSubmit(submitData)
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
      <ImageUpload
        value={formData.image_url}
        onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
        onUpload={onUploadImage}
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

      <Input
        label="Stock Quantity"
        type="number"
        min="-1"
        value={formData.stock_quantity}
        onChange={handleChange('stock_quantity')}
        placeholder="-1 for unlimited"
        hint="Use -1 for unlimited stock"
      />

      <Select
        label="Category"
        value={formData.category_id}
        onChange={handleChange('category_id')}
        options={categoryOptions}
      />

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
