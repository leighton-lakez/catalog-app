import { useState } from 'react'
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
  DeviceTabletIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ShoppingCartIcon,
  MegaphoneIcon,
  SwatchIcon,
  SparklesIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  CursorArrowRaysIcon,
  Square3Stack3DIcon,
  GlobeAltIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

// Font options
const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
  { id: 'playfair', name: 'Playfair', family: 'Playfair Display, serif' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { id: 'opensans', name: 'Open Sans', family: 'Open Sans, sans-serif' },
  { id: 'lato', name: 'Lato', family: 'Lato, sans-serif' },
  { id: 'raleway', name: 'Raleway', family: 'Raleway, sans-serif' },
]

// Layout options
const LAYOUT_OPTIONS = [
  { id: 'grid', name: 'Grid', icon: Squares2X2Icon, desc: 'Classic grid layout' },
  { id: 'list', name: 'List', icon: ListBulletIcon, desc: 'Vertical list view' },
  { id: 'masonry', name: 'Masonry', icon: Square3Stack3DIcon, desc: 'Pinterest style' },
]

// Card style options
const CARD_STYLES = [
  { id: 'default', name: 'Default', desc: 'Clean with border' },
  { id: 'shadow', name: 'Shadow', desc: 'Elevated with shadow' },
  { id: 'minimal', name: 'Minimal', desc: 'No border, clean' },
  { id: 'rounded', name: 'Rounded', desc: 'Extra rounded corners' },
]

// Button style options
const BUTTON_STYLES = [
  { id: 'filled', name: 'Filled', desc: 'Solid background' },
  { id: 'outline', name: 'Outline', desc: 'Border only' },
  { id: 'rounded', name: 'Pill', desc: 'Fully rounded' },
  { id: 'minimal', name: 'Minimal', desc: 'Text only' },
]

// Header style options
const HEADER_STYLES = [
  { id: 'default', name: 'Default', desc: 'Logo left, cart right' },
  { id: 'centered', name: 'Centered', desc: 'Logo in center' },
  { id: 'minimal', name: 'Minimal', desc: 'Just the essentials' },
]

// Theme presets (full themes)
const THEME_PRESETS = [
  { id: 'ocean', name: 'Ocean', primary: '#3B82F6', secondary: '#0EA5E9', bg: '#F0F9FF' },
  { id: 'forest', name: 'Forest', primary: '#22C55E', secondary: '#16A34A', bg: '#F0FDF4' },
  { id: 'sunset', name: 'Sunset', primary: '#F97316', secondary: '#FB923C', bg: '#FFF7ED' },
  { id: 'berry', name: 'Berry', primary: '#EC4899', secondary: '#F472B6', bg: '#FDF2F8' },
  { id: 'lavender', name: 'Lavender', primary: '#8B5CF6', secondary: '#A78BFA', bg: '#FAF5FF' },
  { id: 'midnight', name: 'Midnight', primary: '#1F2937', secondary: '#374151', bg: '#F9FAFB' },
  { id: 'coral', name: 'Coral', primary: '#EF4444', secondary: '#F87171', bg: '#FEF2F2' },
  { id: 'teal', name: 'Teal', primary: '#14B8A6', secondary: '#2DD4BF', bg: '#F0FDFA' },
]

// Social platforms
const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
  { id: 'facebook', name: 'Facebook', icon: '👤' },
  { id: 'youtube', name: 'YouTube', icon: '▶️' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
]

// Mock products for preview
const PREVIEW_PRODUCTS = [
  { id: 1, name: 'Premium Headphones', price: 299.99, description: 'Wireless noise-canceling headphones', stock_quantity: 10, image_url: null, rating: 4.8 },
  { id: 2, name: 'Smart Watch Pro', price: 449.99, description: 'Advanced fitness tracking', stock_quantity: 3, image_url: null, rating: 4.5 },
  { id: 3, name: 'Vintage Camera', price: 899.99, description: 'Classic film camera', stock_quantity: 0, image_url: null, rating: 4.9 },
  { id: 4, name: 'Designer Bag', price: 159.99, description: 'Luxury leather handbag', stock_quantity: 15, image_url: null, rating: 4.7 },
]

export default function StoreEditor() {
  const { reseller, updateReseller } = useAuth()
  const [formData, setFormData] = useState({
    // Basic
    store_name: reseller?.store_name || '',
    store_slug: reseller?.store_slug || '',
    store_description: reseller?.store_description || '',
    announcement: reseller?.announcement || '',

    // Branding
    logo_url: reseller?.logo_url || '',
    banner_url: reseller?.banner_url || '',
    favicon_url: reseller?.favicon_url || '',

    // Theme
    theme_color: reseller?.theme_color || '#3B82F6',
    secondary_color: reseller?.secondary_color || '#0EA5E9',
    background_color: reseller?.background_color || '#F9FAFB',
    text_color: reseller?.text_color || '#111827',

    // Typography
    font_family: reseller?.font_family || 'inter',
    heading_size: reseller?.heading_size || 'medium',

    // Layout
    store_layout: reseller?.store_layout || 'grid',
    card_style: reseller?.card_style || 'default',
    button_style: reseller?.button_style || 'filled',
    header_style: reseller?.header_style || 'default',
    products_per_row: reseller?.products_per_row || 4,

    // Display options
    show_description: reseller?.show_description !== false,
    show_stock: reseller?.show_stock !== false,
    show_rating: reseller?.show_rating || false,
    show_share_buttons: reseller?.show_share_buttons || false,
    show_wishlist: reseller?.show_wishlist || false,
    show_search: reseller?.show_search !== false,
    show_categories_nav: reseller?.show_categories_nav !== false,

    // Social
    social_instagram: reseller?.social_instagram || '',
    social_tiktok: reseller?.social_tiktok || '',
    social_twitter: reseller?.social_twitter || '',
    social_facebook: reseller?.social_facebook || '',
    social_whatsapp: reseller?.social_whatsapp || '',

    // Footer
    footer_text: reseller?.footer_text || '',
    show_powered_by: reseller?.show_powered_by !== false,

    // Advanced
    custom_css: reseller?.custom_css || '',
  })

  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success') // 'success' or 'error'
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [previewDevice, setPreviewDevice] = useState('desktop')
  const [activeSection, setActiveSection] = useState('info')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [slugError, setSlugError] = useState('')

  const storeUrl = `${window.location.origin}/store/${formData.store_slug}`
  const currentFont = FONT_OPTIONS.find(f => f.id === formData.font_family) || FONT_OPTIONS[0]

  const handleChange = (field) => (e) => {
    let value = e.target.value
    if (field === 'store_slug') {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      setSlugError('') // Clear error when user types
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Check if slug is available
  const checkSlugAvailability = async (slug) => {
    if (!slug || slug === reseller?.store_slug) {
      return true // No change or empty
    }

    const { data, error } = await supabase
      .from('resellers')
      .select('id')
      .eq('store_slug', slug)
      .neq('id', reseller.id)
      .maybeSingle()

    if (error) {
      console.error('Error checking slug:', error)
      return false
    }

    return !data // Available if no data found
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setMessage('')
    setSlugError('')

    try {
      // Check if slug is available (if changed)
      if (formData.store_slug !== reseller?.store_slug) {
        const isAvailable = await checkSlugAvailability(formData.store_slug)
        if (!isAvailable) {
          setSlugError('This URL is already taken. Please choose a different one.')
          setActiveSection('info') // Switch to info section to show error
          setLoading(false)
          return
        }
      }

      // Validate slug is not empty
      if (!formData.store_slug || formData.store_slug.trim() === '') {
        setSlugError('Store URL is required')
        setActiveSection('info')
        setLoading(false)
        return
      }

      await updateReseller(formData)
      setMessage('Saved!')
      setMessageType('success')
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      console.error('Save error:', error)
      setMessage('Failed to save: ' + (error.message || 'Unknown error'))
      setMessageType('error')
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

      const field = type === 'logo' ? 'logo_url' : 'banner_url'
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

  const applyThemePreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      theme_color: preset.primary,
      secondary_color: preset.secondary,
      background_color: preset.bg,
    }))
  }

  // Get button style classes
  const getButtonStyle = () => {
    switch (formData.button_style) {
      case 'outline':
        return { bg: 'transparent', border: formData.theme_color, text: formData.theme_color }
      case 'rounded':
        return { bg: formData.theme_color, border: 'transparent', text: 'white', rounded: 'full' }
      case 'minimal':
        return { bg: 'transparent', border: 'transparent', text: formData.theme_color }
      default:
        return { bg: formData.theme_color, border: 'transparent', text: 'white' }
    }
  }

  // Get card style classes
  const getCardStyle = () => {
    switch (formData.card_style) {
      case 'shadow':
        return 'shadow-lg border-0'
      case 'minimal':
        return 'border-0 shadow-none'
      case 'rounded':
        return 'border border-gray-200 rounded-2xl'
      default:
        return 'border border-gray-200'
    }
  }

  const buttonStyle = getButtonStyle()

  // Preview Components
  const PreviewHeader = () => (
    <div style={{ fontFamily: currentFont.family }}>
      {formData.announcement && (
        <div
          className="py-2 px-3 text-center text-xs font-medium"
          style={{ backgroundColor: formData.theme_color, color: 'white' }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <MegaphoneIcon className="h-3.5 w-3.5" />
            <span>{formData.announcement}</span>
          </div>
        </div>
      )}

      {formData.banner_url && (
        <div className="h-20 sm:h-28 overflow-hidden relative">
          <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      <header
        className="bg-white border-b px-4 py-3"
        style={{ borderBottomColor: formData.theme_color + '40' }}
      >
        <div className={`flex items-center ${formData.header_style === 'centered' ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${formData.header_style === 'centered' ? 'flex-col text-center' : ''}`}>
            {formData.logo_url ? (
              <img
                src={formData.logo_url}
                alt="Logo"
                className={`object-cover ${formData.header_style === 'centered' ? 'h-12 w-12' : 'h-10 w-10'} rounded-full border-2`}
                style={{ borderColor: formData.theme_color + '40' }}
              />
            ) : (
              <div
                className={`${formData.header_style === 'centered' ? 'h-12 w-12' : 'h-10 w-10'} rounded-full flex items-center justify-center text-white font-bold`}
                style={{ backgroundColor: formData.theme_color }}
              >
                {formData.store_name?.charAt(0) || 'S'}
              </div>
            )}
            <div>
              <h1
                className={`font-bold ${formData.heading_size === 'large' ? 'text-xl' : formData.heading_size === 'small' ? 'text-sm' : 'text-base'}`}
                style={{ color: formData.text_color }}
              >
                {formData.store_name || 'Store Name'}
              </h1>
              {formData.store_description && formData.header_style !== 'minimal' && (
                <p className="text-xs text-gray-500 line-clamp-1">{formData.store_description}</p>
              )}
            </div>
          </div>

          {formData.header_style !== 'centered' && (
            <div className="flex items-center gap-2">
              {formData.show_search && (
                <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-gray-400">Search...</span>
                </div>
              )}
              <button
                className="relative p-2 rounded-lg hover:bg-gray-100"
                style={{ color: formData.theme_color }}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] font-bold rounded-full text-white"
                  style={{ backgroundColor: formData.theme_color }}
                >
                  2
                </span>
              </button>
            </div>
          )}
        </div>

        {formData.show_categories_nav && (
          <div className="flex gap-4 mt-3 overflow-x-auto pb-1">
            {['All', 'Electronics', 'Clothing', 'Accessories'].map((cat, i) => (
              <button
                key={cat}
                className={`text-xs font-medium whitespace-nowrap pb-1 border-b-2 transition-colors ${
                  i === 0 ? 'border-current' : 'border-transparent'
                }`}
                style={{ color: i === 0 ? formData.theme_color : '#6B7280' }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>
    </div>
  )

  const PreviewProduct = ({ product }) => {
    const isOutOfStock = product.stock_quantity === 0
    const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5
    const cardClass = getCardStyle()

    if (formData.store_layout === 'list') {
      return (
        <div
          className={`bg-white rounded-lg overflow-hidden flex ${cardClass}`}
          style={{ fontFamily: currentFont.family }}
        >
          <div className="w-20 h-20 bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs relative">
            <PhotoIcon className="h-6 w-6" />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-900 px-1 py-0.5 rounded text-[8px] font-medium">Sold Out</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium truncate" style={{ color: formData.text_color }}>{product.name}</h3>
                {formData.show_wishlist && <HeartIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
              </div>
              {formData.show_description && product.description && (
                <p className="text-[10px] text-gray-500 truncate mt-0.5">{product.description}</p>
              )}
              {formData.show_rating && (
                <div className="flex items-center gap-1 mt-1">
                  <StarIcon className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] text-gray-600">{product.rating}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold" style={{ color: formData.theme_color }}>
                {formatCurrency(product.price)}
              </span>
              {!isOutOfStock && (
                <button
                  className={`text-[10px] px-2 py-1 font-medium transition-all ${formData.button_style === 'rounded' ? 'rounded-full' : 'rounded'}`}
                  style={{
                    backgroundColor: buttonStyle.bg,
                    color: buttonStyle.text,
                    border: `1px solid ${buttonStyle.border}`,
                  }}
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        className={`bg-white rounded-xl overflow-hidden ${cardClass}`}
        style={{ fontFamily: currentFont.family }}
      >
        <div className="relative aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
          <PhotoIcon className="h-8 w-8" />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-2 py-1 rounded-full text-[10px] font-medium">Sold Out</span>
            </div>
          )}
          {formData.show_stock && isLowStock && !isOutOfStock && (
            <div className="absolute top-2 left-2">
              <span
                className="px-1.5 py-0.5 rounded-full text-[8px] font-medium text-white"
                style={{ backgroundColor: formData.secondary_color }}
              >
                Only {product.stock_quantity} left
              </span>
            </div>
          )}
          {formData.show_wishlist && (
            <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white">
              <HeartIcon className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-xs font-medium truncate" style={{ color: formData.text_color }}>{product.name}</h3>
            {formData.show_share_buttons && <ShareIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
          </div>
          {formData.show_description && product.description && (
            <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>
          )}
          {formData.show_rating && (
            <div className="flex items-center gap-1 mt-1">
              <StarIcon className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] text-gray-600">{product.rating}</span>
            </div>
          )}
          {formData.show_stock && !isOutOfStock && product.stock_quantity > 0 && (
            <p className="text-[8px] text-green-600 mt-1">In Stock</p>
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-sm font-bold" style={{ color: formData.theme_color }}>
              {formatCurrency(product.price)}
            </span>
            {!isOutOfStock && (
              <button
                className={`text-[10px] px-2 py-1 font-medium transition-all ${formData.button_style === 'rounded' ? 'rounded-full' : 'rounded'}`}
                style={{
                  backgroundColor: buttonStyle.bg,
                  color: buttonStyle.text,
                  border: `1px solid ${buttonStyle.border}`,
                }}
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const PreviewFooter = () => (
    <footer
      className="mt-6 pt-4 border-t px-4 pb-4"
      style={{ borderColor: formData.theme_color + '20', fontFamily: currentFont.family }}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Social Links */}
        {(formData.social_instagram || formData.social_tiktok || formData.social_twitter) && (
          <div className="flex items-center gap-3">
            {formData.social_instagram && <span className="text-lg">📷</span>}
            {formData.social_tiktok && <span className="text-lg">🎵</span>}
            {formData.social_twitter && <span className="text-lg">🐦</span>}
            {formData.social_facebook && <span className="text-lg">👤</span>}
            {formData.social_whatsapp && <span className="text-lg">💬</span>}
          </div>
        )}

        {formData.footer_text && (
          <p className="text-xs text-gray-500 text-center">{formData.footer_text}</p>
        )}

        {formData.show_powered_by && (
          <p className="text-[10px] text-gray-400">Powered by Catalog</p>
        )}
      </div>
    </footer>
  )

  const sections = [
    { id: 'info', name: 'Info', icon: Cog6ToothIcon },
    { id: 'branding', name: 'Brand', icon: PhotoIcon },
    { id: 'theme', name: 'Theme', icon: SwatchIcon },
    { id: 'typography', name: 'Fonts', icon: PaintBrushIcon },
    { id: 'layout', name: 'Layout', icon: Squares2X2Icon },
    { id: 'cards', name: 'Cards', icon: Square3Stack3DIcon },
    { id: 'features', name: 'Features', icon: SparklesIcon },
    { id: 'social', name: 'Social', icon: GlobeAltIcon },
  ]

  const Toggle = ({ label, description, field }) => (
    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
      <div>
        <span className="text-xs font-medium text-gray-700">{label}</span>
        {description && <p className="text-[10px] text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => handleToggle(field)}
        className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
          formData[field] ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
          formData[field] ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </label>
  )

  return (
    <div className="flex h-[calc(100vh-120px)] -m-6">
      {/* Editor Panel */}
      <div className="w-[420px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Store Editor</h1>
              <p className="text-xs text-gray-500">Design your perfect storefront</p>
            </div>
            <button
              onClick={() => window.open(storeUrl, '_blank')}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
              title="Open Store"
            >
              <GlobeAltIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Section Tabs - Scrollable */}
        <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50 px-2 gap-1 py-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <section.icon className="h-3.5 w-3.5" />
              {section.name}
            </button>
          ))}
        </div>

        {/* Editor Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeSection === 'info' && (
            <>
              {/* Store URL */}
              <div className={`p-3 rounded-xl border ${slugError ? 'bg-red-50 border-red-200' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100'}`}>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Your Store URL</label>
                <div className="flex gap-2">
                  <div className={`flex-1 flex items-center bg-white border rounded-lg px-3 py-2 shadow-sm ${slugError ? 'border-red-300' : 'border-gray-200'}`}>
                    <span className="text-gray-400 text-xs">/store/</span>
                    <input
                      type="text"
                      value={formData.store_slug}
                      onChange={handleChange('store_slug')}
                      className="flex-1 bg-transparent border-none focus:outline-none text-xs font-semibold text-gray-800"
                      placeholder="my-store"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ClipboardIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {slugError && (
                  <p className="mt-2 text-xs text-red-600 font-medium">{slugError}</p>
                )}
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
                label="Announcement Banner"
                value={formData.announcement}
                onChange={handleChange('announcement')}
                placeholder="🎉 Free shipping on orders over $50!"
              />

              <Input
                label="Footer Text"
                value={formData.footer_text}
                onChange={handleChange('footer_text')}
                placeholder="© 2024 My Store. All rights reserved."
              />
            </>
          )}

          {activeSection === 'branding' && (
            <>
              {/* Logo */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Store Logo</label>
                {formData.logo_url ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                    {uploadingLogo ? (
                      <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                        <span className="text-[10px] text-gray-500 mt-1">Upload</span>
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

              {/* Banner */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Store Banner</label>
                {formData.banner_url ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                    <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                    {uploadingBanner ? (
                      <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Upload Banner (1200x300 recommended)</span>
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
                <label className="block text-xs font-semibold text-gray-700 mb-2">Theme Presets</label>
                <div className="grid grid-cols-4 gap-2">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyThemePreset(preset)}
                      className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                        formData.theme_color === preset.primary
                          ? 'border-gray-900 shadow-md'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: preset.bg }}
                    >
                      <div className="flex gap-1 justify-center mb-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                      </div>
                      <span className="text-[10px] font-medium text-gray-700">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.theme_color}
                      onChange={handleChange('theme_color')}
                      className="h-9 w-12 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.theme_color}
                      onChange={handleChange('theme_color')}
                      className="flex-1 input-field text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={handleChange('secondary_color')}
                      className="h-9 w-12 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={handleChange('secondary_color')}
                      className="flex-1 input-field text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.background_color}
                      onChange={handleChange('background_color')}
                      className="h-9 w-12 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.background_color}
                      onChange={handleChange('background_color')}
                      className="flex-1 input-field text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.text_color}
                      onChange={handleChange('text_color')}
                      className="h-9 w-12 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.text_color}
                      onChange={handleChange('text_color')}
                      className="flex-1 input-field text-xs"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === 'typography' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Font Family</label>
                <div className="grid grid-cols-2 gap-2">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, font_family: font.id }))}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.font_family === font.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium" style={{ fontFamily: font.family }}>
                        {font.name}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5" style={{ fontFamily: font.family }}>
                        Aa Bb Cc 123
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Heading Size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, heading_size: size }))}
                      className={`flex-1 py-2 rounded-lg border-2 text-xs font-medium capitalize transition-all ${
                        formData.heading_size === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === 'layout' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Product Layout</label>
                <div className="grid grid-cols-3 gap-2">
                  {LAYOUT_OPTIONS.map((layout) => (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, store_layout: layout.id }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Header Style</label>
                <div className="space-y-2">
                  {HEADER_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, header_style: style.id }))}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        formData.header_style === style.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`text-xs font-medium ${
                        formData.header_style === style.id ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {style.name}
                      </span>
                      <p className="text-[10px] text-gray-500">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Products Per Row: {formData.products_per_row}
                </label>
                <input
                  type="range"
                  min="2"
                  max="5"
                  value={formData.products_per_row}
                  onChange={(e) => setFormData(prev => ({ ...prev, products_per_row: parseInt(e.target.value) }))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            </>
          )}

          {activeSection === 'cards' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Card Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {CARD_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, card_style: style.id }))}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.card_style === style.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`text-xs font-medium ${
                        formData.card_style === style.id ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {style.name}
                      </span>
                      <p className="text-[10px] text-gray-500">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Button Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {BUTTON_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, button_style: style.id }))}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.button_style === style.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`text-xs font-medium ${
                        formData.button_style === style.id ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {style.name}
                      </span>
                      <p className="text-[10px] text-gray-500">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === 'features' && (
            <div className="space-y-2">
              <Toggle label="Show Search Bar" description="Let customers search products" field="show_search" />
              <Toggle label="Show Categories Nav" description="Category tabs in header" field="show_categories_nav" />
              <Toggle label="Show Descriptions" description="Product descriptions visible" field="show_description" />
              <Toggle label="Show Stock Status" description="In stock / low stock labels" field="show_stock" />
              <Toggle label="Show Ratings" description="Star ratings on products" field="show_rating" />
              <Toggle label="Show Wishlist" description="Heart icon to save items" field="show_wishlist" />
              <Toggle label="Show Share Buttons" description="Share product links" field="show_share_buttons" />
              <Toggle label="Powered by Badge" description="Show 'Powered by Catalog'" field="show_powered_by" />
            </div>
          )}

          {activeSection === 'social' && (
            <>
              <p className="text-xs text-gray-500 mb-3">Add your social media links to display in the footer</p>
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform.id} className="flex items-center gap-2">
                  <span className="text-lg w-8">{platform.icon}</span>
                  <input
                    type="text"
                    value={formData[`social_${platform.id}`] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [`social_${platform.id}`]: e.target.value }))}
                    placeholder={`${platform.name} URL or username`}
                    className="flex-1 input-field text-xs"
                  />
                </div>
              ))}
            </>
          )}
        </form>

        {/* Save Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {message && (
            <div className={`mb-3 p-2 rounded-lg text-xs font-medium text-center ${
              messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}
          <Button onClick={handleSubmit} loading={loading} className="w-full">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: formData.background_color }}>
        {/* Preview Controls */}
        <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Preview</span>
            <span className="text-xs text-gray-400">Changes update in real-time</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded transition-all ${previewDevice === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Mobile"
            >
              <DevicePhoneMobileIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-1.5 rounded transition-all ${previewDevice === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Tablet"
            >
              <DeviceTabletIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded transition-all ${previewDevice === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Desktop"
            >
              <ComputerDesktopIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 p-6 overflow-auto flex items-start justify-center">
          <div
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
              previewDevice === 'mobile' ? 'w-[375px]' : previewDevice === 'tablet' ? 'w-[768px]' : 'w-full max-w-[1200px]'
            }`}
            style={{ minHeight: previewDevice === 'mobile' ? '667px' : '500px' }}
          >
            <PreviewHeader />
            <div className="p-4" style={{ backgroundColor: formData.background_color }}>
              <h2
                className={`font-bold mb-4 ${formData.heading_size === 'large' ? 'text-xl' : formData.heading_size === 'small' ? 'text-sm' : 'text-lg'}`}
                style={{ color: formData.text_color, fontFamily: currentFont.family }}
              >
                Products
              </h2>
              <div className={
                formData.store_layout === 'list'
                  ? 'space-y-3'
                  : `grid gap-3 ${
                      previewDevice === 'mobile'
                        ? 'grid-cols-2'
                        : previewDevice === 'tablet'
                        ? `grid-cols-${Math.min(formData.products_per_row, 3)}`
                        : `grid-cols-${formData.products_per_row}`
                    }`
              }>
                {PREVIEW_PRODUCTS.map((product) => (
                  <PreviewProduct key={product.id} product={product} />
                ))}
              </div>
              <PreviewFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
