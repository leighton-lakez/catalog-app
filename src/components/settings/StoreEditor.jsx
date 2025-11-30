import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'
import Button from '../ui/Button'
import Input, { Textarea } from '../ui/Input'
import {
  ClipboardIcon,
  CheckIcon,
  PhotoIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ShoppingCartIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline'

const LAYOUT_OPTIONS = [
  { id: 'grid', name: 'Grid', icon: Squares2X2Icon },
  { id: 'list', name: 'List', icon: ListBulletIcon },
]

const THEME_PRESETS = [
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Purple', color: '#8B5CF6' },
  { name: 'Pink', color: '#EC4899' },
  { name: 'Red', color: '#EF4444' },
  { name: 'Orange', color: '#F97316' },
  { name: 'Green', color: '#22C55E' },
  { name: 'Teal', color: '#14B8A6' },
  { name: 'Black', color: '#1F2937' },
]

// Mock products for preview
const PREVIEW_PRODUCTS = [
  { id: 1, name: 'Sample Product', price: 29.99, description: 'This is a sample product description', stock_quantity: 10, image_url: null },
  { id: 2, name: 'Another Item', price: 49.99, description: 'Another great product for your store', stock_quantity: 3, image_url: null },
  { id: 3, name: 'Premium Product', price: 99.99, description: 'Our premium offering', stock_quantity: 0, image_url: null },
]

export default function StoreEditor() {
  const { reseller, updateReseller } = useAuth()
  const [formData, setFormData] = useState({
    store_name: reseller?.store_name || '',
    store_slug: reseller?.store_slug || '',
    store_description: reseller?.store_description || '',
    theme_color: reseller?.theme_color || '#3B82F6',
    logo_url: reseller?.logo_url || '',
    banner_url: reseller?.banner_url || '',
    store_layout: reseller?.store_layout || 'grid',
    show_description: reseller?.show_description !== false,
    show_stock: reseller?.show_stock !== false,
    announcement: reseller?.announcement || '',
  })
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [previewDevice, setPreviewDevice] = useState('desktop')
  const [activeSection, setActiveSection] = useState('info')

  const storeUrl = `${window.location.origin}/store/${formData.store_slug}`

  const handleChange = (field) => (e) => {
    let value = e.target.value
    if (field === 'store_slug') {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await updateReseller(formData)
      setMessage('Saved!')
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      setMessage('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleImageUpload = async (file, type) => {
    if (!file) return

    const isLogo = type === 'logo'
    isLogo ? setUploadingLogo(true) : setUploadingBanner(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${reseller.id}-${type}-${Date.now()}.${fileExt}`
      const filePath = `store-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      const field = isLogo ? 'logo_url' : 'banner_url'
      setFormData(prev => ({ ...prev, [field]: publicUrl }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      isLogo ? setUploadingLogo(false) : setUploadingBanner(false)
    }
  }

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Preview Components
  const PreviewHeader = () => (
    <div className="bg-white">
      {formData.announcement && (
        <div
          className="py-1.5 px-2 text-center text-xs font-medium text-white"
          style={{ backgroundColor: formData.theme_color }}
        >
          <div className="flex items-center justify-center gap-1">
            <MegaphoneIcon className="h-3 w-3" />
            <span className="truncate">{formData.announcement}</span>
          </div>
        </div>
      )}
      {formData.banner_url && (
        <div className="h-16 sm:h-20 overflow-hidden">
          <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderBottomColor: formData.theme_color }}>
        <div className="flex items-center gap-2">
          {formData.logo_url ? (
            <img src={formData.logo_url} alt="Logo" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200" />
          )}
          <div>
            <h1 className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
              {formData.store_name || 'Store Name'}
            </h1>
            {formData.store_description && (
              <p className="text-xs text-gray-500 truncate max-w-[150px]">{formData.store_description}</p>
            )}
          </div>
        </div>
        <div className="relative p-1.5" style={{ color: formData.theme_color }}>
          <ShoppingCartIcon className="h-5 w-5" />
          <span
            className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[10px] font-medium text-white rounded-full"
            style={{ backgroundColor: formData.theme_color }}
          >
            2
          </span>
        </div>
      </div>
    </div>
  )

  const PreviewProduct = ({ product }) => {
    const isOutOfStock = product.stock_quantity === 0
    const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5

    if (formData.store_layout === 'list') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex">
          <div className="w-16 h-16 bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
            No img
          </div>
          <div className="flex-1 p-2 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="text-xs font-medium text-gray-900 truncate">{product.name}</h3>
              {formData.show_description && product.description && (
                <p className="text-[10px] text-gray-500 truncate">{product.description}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: formData.theme_color }}>
                {formatCurrency(product.price)}
              </span>
              {!isOutOfStock && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: formData.theme_color }}
                >
                  Add
                </span>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="relative aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
          No image
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-1.5 py-0.5 rounded text-[10px] font-medium">
                Out of Stock
              </span>
            </div>
          )}
          {formData.show_stock && isLowStock && !isOutOfStock && (
            <div className="absolute top-1 left-1">
              <span className="bg-orange-500 text-white px-1 py-0.5 rounded text-[8px] font-medium">
                Only {product.stock_quantity} left
              </span>
            </div>
          )}
        </div>
        <div className="p-2">
          <h3 className="text-xs font-medium text-gray-900 truncate">{product.name}</h3>
          {formData.show_description && product.description && (
            <p className="text-[10px] text-gray-500 line-clamp-1">{product.description}</p>
          )}
          {formData.show_stock && !isOutOfStock && (
            <p className="text-[8px] text-green-600">In Stock</p>
          )}
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs font-bold" style={{ color: formData.theme_color }}>
              {formatCurrency(product.price)}
            </span>
            {!isOutOfStock && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded text-white"
                style={{ backgroundColor: formData.theme_color }}
              >
                Add
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const sections = [
    { id: 'info', name: 'Info' },
    { id: 'branding', name: 'Branding' },
    { id: 'theme', name: 'Theme' },
    { id: 'layout', name: 'Layout' },
  ]

  return (
    <div className="flex h-[calc(100vh-120px)] -m-6">
      {/* Editor Panel */}
      <div className="w-[400px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Store Editor</h1>
          <p className="text-sm text-gray-500">Customize how your store looks</p>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-gray-200">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activeSection === section.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>

        {/* Editor Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeSection === 'info' && (
            <>
              {/* Store URL */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <label className="block text-xs font-medium text-gray-700 mb-1">Store URL</label>
                <div className="flex gap-1">
                  <div className="flex-1 flex items-center bg-white border border-gray-300 rounded px-2 py-1.5">
                    <span className="text-gray-500 text-xs">/store/</span>
                    <input
                      type="text"
                      value={formData.store_slug}
                      onChange={handleChange('store_slug')}
                      className="flex-1 bg-transparent border-none focus:outline-none text-xs font-medium"
                      placeholder="my-store"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ClipboardIcon className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <Input
                label="Store Name"
                value={formData.store_name}
                onChange={handleChange('store_name')}
                placeholder="My Awesome Store"
              />

              <Textarea
                label="Description"
                value={formData.store_description}
                onChange={handleChange('store_description')}
                placeholder="Tell customers about your store..."
                rows={2}
              />

              <Input
                label="Announcement"
                value={formData.announcement}
                onChange={handleChange('announcement')}
                placeholder="Free shipping on orders over $50!"
              />
            </>
          )}

          {activeSection === 'branding' && (
            <>
              {/* Logo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Logo</label>
                {formData.logo_url ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {uploadingLogo ? (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <PhotoIcon className="h-6 w-6 text-gray-400" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'logo')}
                    />
                  </label>
                )}
              </div>

              {/* Banner */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Banner</label>
                {formData.banner_url ? (
                  <div className="relative w-full h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {uploadingBanner ? (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500">Upload Banner</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
                    />
                  </label>
                )}
              </div>
            </>
          )}

          {activeSection === 'theme' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Theme Color</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, theme_color: preset.color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.theme_color === preset.color
                          ? 'border-gray-900 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme_color}
                    onChange={handleChange('theme_color')}
                    className="h-8 w-12 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={formData.theme_color}
                    onChange={handleChange('theme_color')}
                    className="input-field w-24 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === 'layout' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Product Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  {LAYOUT_OPTIONS.map((layout) => (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, store_layout: layout.id }))}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.store_layout === layout.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <layout.icon className={`h-6 w-6 mx-auto mb-1 ${
                        formData.store_layout === layout.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs font-medium ${
                        formData.store_layout === layout.id ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {layout.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-700">Show Descriptions</span>
                  <button
                    type="button"
                    onClick={() => handleToggle('show_description')}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      formData.show_description ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      formData.show_description ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-700">Show Stock Status</span>
                  <button
                    type="button"
                    onClick={() => handleToggle('show_stock')}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      formData.show_stock ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      formData.show_stock ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </label>
              </div>
            </>
          )}
        </form>

        {/* Save Button */}
        <div className="p-4 border-t border-gray-200">
          <Button onClick={handleSubmit} loading={loading} className="w-full">
            {message || 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 bg-gray-100 flex flex-col">
        {/* Preview Controls */}
        <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Preview</span>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-white shadow-sm' : ''}`}
            >
              <DevicePhoneMobileIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-white shadow-sm' : ''}`}
            >
              <ComputerDesktopIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 p-6 overflow-auto flex items-start justify-center">
          <div
            className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all ${
              previewDevice === 'mobile' ? 'w-[320px]' : 'w-full max-w-[800px]'
            }`}
            style={{ minHeight: previewDevice === 'mobile' ? '568px' : '400px' }}
          >
            <PreviewHeader />
            <div className="p-3 bg-gray-50">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Products</h2>
              <div className={formData.store_layout === 'list' ? 'space-y-2' : `grid ${previewDevice === 'mobile' ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                {PREVIEW_PRODUCTS.map((product) => (
                  <PreviewProduct key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
