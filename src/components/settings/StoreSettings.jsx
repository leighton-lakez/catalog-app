import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import Button from '../ui/Button'
import Input, { Textarea } from '../ui/Input'
import {
  ClipboardIcon,
  CheckIcon,
  PhotoIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

const LAYOUT_OPTIONS = [
  { id: 'grid', name: 'Grid', icon: Squares2X2Icon, description: 'Products in a grid layout' },
  { id: 'list', name: 'List', icon: ListBulletIcon, description: 'Products in a list layout' },
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

export default function StoreSettings() {
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

  const storeUrl = `${window.location.origin}/store/${formData.store_slug}`

  const handleChange = (field) => (e) => {
    let value = e.target.value

    // Sanitize slug
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
      setMessage('Settings saved successfully!')
    } catch (error) {
      setMessage('Failed to save settings: ' + error.message)
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

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          <EyeIcon className="h-4 w-4" />
          Preview Store
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store URL Card */}
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Store Link</h2>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-lg px-3 py-3">
              <span className="text-gray-500 text-sm">{window.location.origin}/store/</span>
              <input
                type="text"
                value={formData.store_slug}
                onChange={handleChange('store_slug')}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium"
                placeholder="my-store"
                required
              />
            </div>
            <button
              type="button"
              onClick={copyToClipboard}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600 text-sm font-medium">Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Share this unique link with your customers. Only people with this link can access your store.
          </p>
        </div>

        {/* Basic Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h2>
          <div className="space-y-4">
            <Input
              label="Store Name"
              value={formData.store_name}
              onChange={handleChange('store_name')}
              placeholder="My Awesome Store"
              required
            />

            <Textarea
              label="Store Description"
              value={formData.store_description}
              onChange={handleChange('store_description')}
              placeholder="Tell customers about your store..."
              rows={3}
            />

            <Input
              label="Announcement Banner (optional)"
              value={formData.announcement}
              onChange={handleChange('announcement')}
              placeholder="e.g., Free shipping on orders over $50!"
            />
          </div>
        </div>

        {/* Branding */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
              <div className="relative">
                {formData.logo_url ? (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {uploadingLogo ? (
                      <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Upload Logo</span>
                      </>
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
              <p className="text-xs text-gray-500 mt-2">Recommended: 200x200px</p>
            </div>

            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Banner</label>
              <div className="relative">
                {formData.banner_url ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {uploadingBanner ? (
                      <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Upload Banner</span>
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
              <p className="text-xs text-gray-500 mt-2">Recommended: 1200x300px</p>
            </div>
          </div>
        </div>

        {/* Theme Color */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Theme Color</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.color}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, theme_color: preset.color }))}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  formData.theme_color === preset.color
                    ? 'border-gray-900 scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.theme_color}
              onChange={handleChange('theme_color')}
              className="h-10 w-16 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={formData.theme_color}
              onChange={handleChange('theme_color')}
              className="input-field w-32"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
            <span className="text-sm text-gray-500">Custom color</span>
          </div>
        </div>

        {/* Layout Options */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Layout</h2>
          <div className="grid grid-cols-2 gap-4">
            {LAYOUT_OPTIONS.map((layout) => (
              <button
                key={layout.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, store_layout: layout.id }))}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.store_layout === layout.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <layout.icon className={`h-8 w-8 mb-2 ${
                  formData.store_layout === layout.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <p className={`font-medium ${
                  formData.store_layout === layout.id ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {layout.name}
                </p>
                <p className="text-xs text-gray-500">{layout.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Show Product Descriptions</p>
                <p className="text-sm text-gray-500">Display product descriptions in the store</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('show_description')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  formData.show_description ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.show_description ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Show Stock Status</p>
                <p className="text-sm text-gray-500">Show "In Stock" or "Out of Stock" labels</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('show_stock')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  formData.show_stock ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.show_stock ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </label>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Preview Store
          </a>
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
