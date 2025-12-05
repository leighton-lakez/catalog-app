import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'
import Button from '../ui/Button'
import Input, { Textarea } from '../ui/Input'
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  PhotoIcon,
  XMarkIcon,
  Bars3Icon,
  PaintBrushIcon,
  ClipboardIcon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  StarIcon,
  RectangleGroupIcon,
  MegaphoneIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  ShoppingCartIcon,
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

// Available section types
const SECTION_TYPES = [
  {
    id: 'hero',
    name: 'Hero Banner',
    icon: SparklesIcon,
    description: 'Large banner with title and CTA',
    defaultData: {
      title: 'Welcome to Our Store',
      subtitle: 'Discover amazing products at great prices',
      buttonText: 'Shop Now',
      buttonLink: '#products',
      backgroundType: 'gradient',
      backgroundColor: '#3B82F6',
      backgroundGradient: 'from-blue-600 to-purple-600',
      textColor: 'white',
      height: 'large',
      alignment: 'center',
    }
  },
  {
    id: 'announcement',
    name: 'Announcement Bar',
    icon: MegaphoneIcon,
    description: 'Top bar for promotions',
    defaultData: {
      text: '🎉 Free shipping on orders over $50!',
      backgroundColor: '#3B82F6',
      textColor: 'white',
      link: '',
    }
  },
  {
    id: 'featured-products',
    name: 'Featured Products',
    icon: ShoppingBagIcon,
    description: 'Showcase selected products',
    defaultData: {
      title: 'Featured Products',
      subtitle: 'Our best sellers',
      layout: 'grid',
      columns: 4,
      showPrice: true,
      showDescription: false,
      limit: 8,
    }
  },
  {
    id: 'categories',
    name: 'Category Grid',
    icon: RectangleGroupIcon,
    description: 'Display product categories',
    defaultData: {
      title: 'Shop by Category',
      layout: 'grid',
      columns: 3,
      style: 'cards',
    }
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    icon: ChatBubbleLeftRightIcon,
    description: 'Customer reviews',
    defaultData: {
      title: 'What Our Customers Say',
      layout: 'carousel',
      testimonials: [
        { name: 'Sarah J.', text: 'Amazing products and fast shipping! Will definitely buy again.', rating: 5, avatar: '' },
        { name: 'Mike R.', text: 'Great quality and customer service. Highly recommend!', rating: 5, avatar: '' },
        { name: 'Emily L.', text: 'Best store I\'ve found. Love everything I\'ve purchased!', rating: 5, avatar: '' },
      ]
    }
  },
  {
    id: 'text-block',
    name: 'Text Block',
    icon: Bars3Icon,
    description: 'Custom text content',
    defaultData: {
      title: 'About Us',
      content: 'Tell your story here. Share what makes your store special and why customers should shop with you.',
      alignment: 'center',
      backgroundColor: 'white',
    }
  },
  {
    id: 'image-banner',
    name: 'Image Banner',
    icon: PhotoIcon,
    description: 'Full-width image with text',
    defaultData: {
      imageUrl: '',
      title: '',
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      overlay: true,
      height: 'medium',
    }
  },
  {
    id: 'features',
    name: 'Features/Benefits',
    icon: StarIcon,
    description: 'Highlight key features',
    defaultData: {
      title: 'Why Choose Us',
      features: [
        { icon: '🚚', title: 'Free Shipping', description: 'On orders over $50' },
        { icon: '↩️', title: 'Easy Returns', description: '30-day return policy' },
        { icon: '🔒', title: 'Secure Payment', description: '100% secure checkout' },
        { icon: '💬', title: '24/7 Support', description: 'Always here to help' },
      ],
      columns: 4,
      style: 'icons',
    }
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    icon: EnvelopeIcon,
    description: 'Email subscription form',
    defaultData: {
      title: 'Stay Updated',
      subtitle: 'Subscribe to our newsletter for exclusive deals and updates',
      buttonText: 'Subscribe',
      backgroundColor: '#F3F4F6',
    }
  },
  {
    id: 'contact',
    name: 'Contact Info',
    icon: PhoneIcon,
    description: 'Contact details and form',
    defaultData: {
      title: 'Get in Touch',
      email: 'hello@mystore.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345',
      showForm: true,
      showMap: false,
    }
  },
  {
    id: 'faq',
    name: 'FAQ Section',
    icon: QuestionMarkCircleIcon,
    description: 'Frequently asked questions',
    defaultData: {
      title: 'Frequently Asked Questions',
      faqs: [
        { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 day delivery.' },
        { question: 'What is your return policy?', answer: 'We offer a 30-day return policy for all unused items in original packaging.' },
        { question: 'Do you ship internationally?', answer: 'Yes! We ship to most countries worldwide. Shipping rates vary by location.' },
      ]
    }
  },
  {
    id: 'social-proof',
    name: 'Social Proof',
    icon: UserGroupIcon,
    description: 'Stats and trust badges',
    defaultData: {
      stats: [
        { value: '10K+', label: 'Happy Customers' },
        { value: '50K+', label: 'Products Sold' },
        { value: '4.9', label: 'Average Rating' },
        { value: '24/7', label: 'Customer Support' },
      ],
      style: 'numbers',
    }
  },
  {
    id: 'divider',
    name: 'Divider',
    icon: Bars3Icon,
    description: 'Visual separator',
    defaultData: {
      style: 'line',
      spacing: 'medium',
    }
  },
  {
    id: 'spacer',
    name: 'Spacer',
    icon: ArrowUpIcon,
    description: 'Add empty space',
    defaultData: {
      height: 'medium',
    }
  },
]

// Section renderer components
const SectionRenderer = ({ section, themeColor, products, categories, isEditing, onEdit }) => {
  const { type, data } = section

  const EditOverlay = () => isEditing && (
    <div
      className="absolute inset-0 border-2 border-blue-500 border-dashed bg-blue-500/5 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
      onClick={() => onEdit(section)}
    >
      <span className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
        Click to Edit
      </span>
    </div>
  )

  switch (type) {
    case 'announcement':
      return (
        <div className="relative">
          <div
            className="py-2.5 px-4 text-center text-sm font-medium"
            style={{ backgroundColor: data.backgroundColor, color: data.textColor }}
          >
            {data.text}
          </div>
          <EditOverlay />
        </div>
      )

    case 'hero':
      return (
        <div className="relative">
          <div
            className={`${data.height === 'large' ? 'py-32' : data.height === 'medium' ? 'py-24' : 'py-16'} px-6`}
            style={{
              background: data.backgroundType === 'gradient'
                ? `linear-gradient(135deg, ${data.backgroundColor}, ${data.backgroundColor}dd)`
                : data.backgroundColor
            }}
          >
            <div className={`max-w-4xl mx-auto text-${data.alignment}`}>
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ color: data.textColor }}
              >
                {data.title}
              </h1>
              {data.subtitle && (
                <p
                  className="text-xl md:text-2xl mb-8 opacity-90"
                  style={{ color: data.textColor }}
                >
                  {data.subtitle}
                </p>
              )}
              {data.buttonText && (
                <button
                  className="px-8 py-3 rounded-lg font-semibold text-lg transition-transform hover:scale-105"
                  style={{
                    backgroundColor: data.textColor,
                    color: data.backgroundColor
                  }}
                >
                  {data.buttonText}
                </button>
              )}
            </div>
          </div>
          <EditOverlay />
        </div>
      )

    case 'featured-products':
      return (
        <div className="relative py-12 px-6">
          <div className="max-w-7xl mx-auto">
            {data.title && (
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{data.title}</h2>
                {data.subtitle && <p className="text-gray-600 mt-2">{data.subtitle}</p>}
              </div>
            )}
            <div className={`grid grid-cols-2 md:grid-cols-${data.columns} gap-4 md:gap-6`}>
              {products.slice(0, data.limit).map((product) => (
                <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <PhotoIcon className="h-12 w-12 text-gray-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    {data.showDescription && product.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    )}
                    {data.showPrice && (
                      <p className="font-bold mt-2" style={{ color: themeColor }}>
                        {formatCurrency(product.price)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <EditOverlay />
        </div>
      )

    case 'categories':
      return (
        <div className="relative py-12 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {data.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>
            )}
            <div className={`grid grid-cols-2 md:grid-cols-${data.columns} gap-4`}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer border border-gray-200"
                >
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: themeColor + '20' }}
                  >
                    <RectangleGroupIcon className="h-8 w-8" style={{ color: themeColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
          <EditOverlay />
        </div>
      )

    case 'testimonials':
      return (
        <div className="relative py-12 px-6">
          <div className="max-w-6xl mx-auto">
            {data.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>
            )}
            <div className="grid md:grid-cols-3 gap-6">
              {data.testimonials.map((testimonial, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <StarIcon key={j} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: themeColor }}
                    >
                      {testimonial.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{testimonial.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <EditOverlay />
        </div>
      )

    case 'text-block':
      return (
        <div className="relative py-12 px-6" style={{ backgroundColor: data.backgroundColor }}>
          <div className={`max-w-3xl mx-auto text-${data.alignment}`}>
            {data.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{data.title}</h2>
            )}
            <p className="text-gray-600 text-lg leading-relaxed">{data.content}</p>
          </div>
          <EditOverlay />
        </div>
      )

    case 'image-banner':
      return (
        <div className="relative">
          <div
            className={`${data.height === 'large' ? 'h-96' : data.height === 'medium' ? 'h-64' : 'h-48'} bg-gray-200 flex items-center justify-center relative overflow-hidden`}
          >
            {data.imageUrl ? (
              <img src={data.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <PhotoIcon className="h-16 w-16 text-gray-400" />
            )}
            {data.overlay && <div className="absolute inset-0 bg-black/40" />}
            {(data.title || data.buttonText) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                {data.title && <h2 className="text-3xl font-bold mb-2">{data.title}</h2>}
                {data.subtitle && <p className="text-xl mb-4">{data.subtitle}</p>}
                {data.buttonText && (
                  <button className="px-6 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100">
                    {data.buttonText}
                  </button>
                )}
              </div>
            )}
          </div>
          <EditOverlay />
        </div>
      )

    case 'features':
      return (
        <div className="relative py-12 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {data.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>
            )}
            <div className={`grid grid-cols-2 md:grid-cols-${data.columns} gap-6`}>
              {data.features.map((feature, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          <EditOverlay />
        </div>
      )

    case 'newsletter':
      return (
        <div className="relative py-12 px-6" style={{ backgroundColor: data.backgroundColor }}>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h2>
            <p className="text-gray-600 mb-6">{data.subtitle}</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="px-6 py-3 rounded-lg text-white font-medium"
                style={{ backgroundColor: themeColor }}
              >
                {data.buttonText}
              </button>
            </div>
          </div>
          <EditOverlay />
        </div>
      )

    case 'contact':
      return (
        <div className="relative py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>
            <div className={`grid ${data.showForm ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8`}>
              <div className="space-y-4">
                {data.email && (
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="h-6 w-6" style={{ color: themeColor }} />
                    <span>{data.email}</span>
                  </div>
                )}
                {data.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-6 w-6" style={{ color: themeColor }} />
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.address && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-6 w-6" style={{ color: themeColor }} />
                    <span>{data.address}</span>
                  </div>
                )}
              </div>
              {data.showForm && (
                <div className="space-y-4">
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border border-gray-300" />
                  <input type="email" placeholder="Your Email" className="w-full px-4 py-3 rounded-lg border border-gray-300" />
                  <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300" />
                  <button
                    className="w-full py-3 rounded-lg text-white font-medium"
                    style={{ backgroundColor: themeColor }}
                  >
                    Send Message
                  </button>
                </div>
              )}
            </div>
          </div>
          <EditOverlay />
        </div>
      )

    case 'faq':
      return (
        <div className="relative py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>
            <div className="space-y-4">
              {data.faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          <EditOverlay />
        </div>
      )

    case 'social-proof':
      return (
        <div className="relative py-12 px-6" style={{ backgroundColor: themeColor }}>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {data.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <EditOverlay />
        </div>
      )

    case 'divider':
      return (
        <div className={`relative ${data.spacing === 'large' ? 'py-8' : data.spacing === 'medium' ? 'py-4' : 'py-2'}`}>
          <div className="max-w-6xl mx-auto px-6">
            {data.style === 'line' && <hr className="border-gray-200" />}
            {data.style === 'dots' && (
              <div className="flex justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
            )}
          </div>
          <EditOverlay />
        </div>
      )

    case 'spacer':
      return (
        <div className={`relative ${data.height === 'large' ? 'h-24' : data.height === 'medium' ? 'h-16' : 'h-8'}`}>
          <EditOverlay />
        </div>
      )

    default:
      return null
  }
}

export default function StoreBuilder() {
  const navigate = useNavigate()
  const { reseller, updateReseller } = useAuth()
  const { products } = useProducts()
  const { categories } = useCategories()

  const [sections, setSections] = useState([])
  const [storeSettings, setStoreSettings] = useState({
    store_name: reseller?.store_name || '',
    store_slug: reseller?.store_slug || '',
    theme_color: reseller?.theme_color || '#3B82F6',
    logo_url: reseller?.logo_url || '',
  })
  const [activePanel, setActivePanel] = useState('sections') // sections, settings, add
  const [editingSection, setEditingSection] = useState(null)
  const [previewMode, setPreviewMode] = useState('desktop')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load sections from reseller data
  useEffect(() => {
    if (reseller?.store_sections) {
      try {
        const parsed = typeof reseller.store_sections === 'string'
          ? JSON.parse(reseller.store_sections)
          : reseller.store_sections
        setSections(parsed)
      } catch (e) {
        // Default sections
        setSections([
          { id: '1', type: 'announcement', data: SECTION_TYPES.find(s => s.id === 'announcement').defaultData },
          { id: '2', type: 'hero', data: { ...SECTION_TYPES.find(s => s.id === 'hero').defaultData, backgroundColor: storeSettings.theme_color } },
          { id: '3', type: 'featured-products', data: SECTION_TYPES.find(s => s.id === 'featured-products').defaultData },
        ])
      }
    } else {
      // Default sections for new stores
      setSections([
        { id: '1', type: 'announcement', data: { ...SECTION_TYPES.find(s => s.id === 'announcement').defaultData, backgroundColor: storeSettings.theme_color } },
        { id: '2', type: 'hero', data: { ...SECTION_TYPES.find(s => s.id === 'hero').defaultData, backgroundColor: storeSettings.theme_color } },
        { id: '3', type: 'featured-products', data: SECTION_TYPES.find(s => s.id === 'featured-products').defaultData },
      ])
    }
  }, [reseller])

  const addSection = (type) => {
    const sectionType = SECTION_TYPES.find(s => s.id === type)
    const newSection = {
      id: Date.now().toString(),
      type,
      data: { ...sectionType.defaultData },
    }
    setSections([...sections, newSection])
    setShowAddPanel(false)
    setEditingSection(newSection)
    setActivePanel('edit')
  }

  const removeSection = (id) => {
    setSections(sections.filter(s => s.id !== id))
    if (editingSection?.id === id) {
      setEditingSection(null)
      setActivePanel('sections')
    }
  }

  const moveSection = (id, direction) => {
    const index = sections.findIndex(s => s.id === id)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return

    const newSections = [...sections]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    const [removed] = newSections.splice(index, 1)
    newSections.splice(newIndex, 0, removed)
    setSections(newSections)
  }

  const updateSectionData = (id, newData) => {
    setSections(sections.map(s => s.id === id ? { ...s, data: { ...s.data, ...newData } } : s))
    if (editingSection?.id === id) {
      setEditingSection({ ...editingSection, data: { ...editingSection.data, ...newData } })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      await updateReseller({
        ...storeSettings,
        store_sections: JSON.stringify(sections),
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const copyStoreUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/store/${storeSettings.store_slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Section settings editor
  const SectionEditor = ({ section }) => {
    const sectionType = SECTION_TYPES.find(s => s.id === section.type)
    const { data } = section

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <sectionType.icon className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">{sectionType.name}</h3>
          </div>
          <button
            onClick={() => { setEditingSection(null); setActivePanel('sections') }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Dynamic fields based on section type */}
        {section.type === 'announcement' && (
          <>
            <Input
              label="Announcement Text"
              value={data.text}
              onChange={(e) => updateSectionData(section.id, { text: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <input
                type="color"
                value={data.backgroundColor}
                onChange={(e) => updateSectionData(section.id, { backgroundColor: e.target.value })}
                className="h-10 w-full rounded cursor-pointer"
              />
            </div>
          </>
        )}

        {section.type === 'hero' && (
          <>
            <Input
              label="Title"
              value={data.title}
              onChange={(e) => updateSectionData(section.id, { title: e.target.value })}
            />
            <Input
              label="Subtitle"
              value={data.subtitle}
              onChange={(e) => updateSectionData(section.id, { subtitle: e.target.value })}
            />
            <Input
              label="Button Text"
              value={data.buttonText}
              onChange={(e) => updateSectionData(section.id, { buttonText: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <input
                type="color"
                value={data.backgroundColor}
                onChange={(e) => updateSectionData(section.id, { backgroundColor: e.target.value })}
                className="h-10 w-full rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <select
                value={data.height}
                onChange={(e) => updateSectionData(section.id, { height: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </>
        )}

        {section.type === 'featured-products' && (
          <>
            <Input
              label="Title"
              value={data.title}
              onChange={(e) => updateSectionData(section.id, { title: e.target.value })}
            />
            <Input
              label="Subtitle"
              value={data.subtitle}
              onChange={(e) => updateSectionData(section.id, { subtitle: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
              <select
                value={data.columns}
                onChange={(e) => updateSectionData(section.id, { columns: parseInt(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Products</label>
              <select
                value={data.limit}
                onChange={(e) => updateSectionData(section.id, { limit: parseInt(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value={4}>4 Products</option>
                <option value={8}>8 Products</option>
                <option value={12}>12 Products</option>
                <option value={16}>16 Products</option>
                <option value={24}>24 Products</option>
                <option value={32}>32 Products</option>
                <option value={48}>48 Products</option>
                <option value={64}>64 Products</option>
                <option value={100}>100 Products</option>
                <option value={150}>150 Products</option>
                <option value={200}>200 Products</option>
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.showPrice}
                onChange={(e) => updateSectionData(section.id, { showPrice: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Show Prices</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.showDescription}
                onChange={(e) => updateSectionData(section.id, { showDescription: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Show Descriptions</span>
            </label>
          </>
        )}

        {section.type === 'testimonials' && (
          <>
            <Input
              label="Title"
              value={data.title}
              onChange={(e) => updateSectionData(section.id, { title: e.target.value })}
            />
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Testimonials</label>
              {data.testimonials.map((t, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <Input
                    label="Name"
                    value={t.name}
                    onChange={(e) => {
                      const newTestimonials = [...data.testimonials]
                      newTestimonials[i] = { ...t, name: e.target.value }
                      updateSectionData(section.id, { testimonials: newTestimonials })
                    }}
                  />
                  <Textarea
                    label="Review"
                    value={t.text}
                    rows={2}
                    onChange={(e) => {
                      const newTestimonials = [...data.testimonials]
                      newTestimonials[i] = { ...t, text: e.target.value }
                      updateSectionData(section.id, { testimonials: newTestimonials })
                    }}
                  />
                  <button
                    onClick={() => {
                      const newTestimonials = data.testimonials.filter((_, idx) => idx !== i)
                      updateSectionData(section.id, { testimonials: newTestimonials })
                    }}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  updateSectionData(section.id, {
                    testimonials: [...data.testimonials, { name: 'New Customer', text: 'Great product!', rating: 5 }]
                  })
                }}
                className="text-blue-600 text-sm hover:underline"
              >
                + Add Testimonial
              </button>
            </div>
          </>
        )}

        {section.type === 'text-block' && (
          <>
            <Input
              label="Title"
              value={data.title}
              onChange={(e) => updateSectionData(section.id, { title: e.target.value })}
            />
            <Textarea
              label="Content"
              value={data.content}
              rows={4}
              onChange={(e) => updateSectionData(section.id, { content: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
              <select
                value={data.alignment}
                onChange={(e) => updateSectionData(section.id, { alignment: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}

        {section.type === 'contact' && (
          <>
            <Input
              label="Title"
              value={data.title}
              onChange={(e) => updateSectionData(section.id, { title: e.target.value })}
            />
            <Input
              label="Email"
              value={data.email}
              onChange={(e) => updateSectionData(section.id, { email: e.target.value })}
            />
            <Input
              label="Phone"
              value={data.phone}
              onChange={(e) => updateSectionData(section.id, { phone: e.target.value })}
            />
            <Input
              label="Address"
              value={data.address}
              onChange={(e) => updateSectionData(section.id, { address: e.target.value })}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.showForm}
                onChange={(e) => updateSectionData(section.id, { showForm: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Show Contact Form</span>
            </label>
          </>
        )}

        {section.type === 'faq' && (
          <>
            <Input
              label="Title"
              value={data.title}
              onChange={(e) => updateSectionData(section.id, { title: e.target.value })}
            />
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Questions</label>
              {data.faqs.map((faq, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <Input
                    label="Question"
                    value={faq.question}
                    onChange={(e) => {
                      const newFaqs = [...data.faqs]
                      newFaqs[i] = { ...faq, question: e.target.value }
                      updateSectionData(section.id, { faqs: newFaqs })
                    }}
                  />
                  <Textarea
                    label="Answer"
                    value={faq.answer}
                    rows={2}
                    onChange={(e) => {
                      const newFaqs = [...data.faqs]
                      newFaqs[i] = { ...faq, answer: e.target.value }
                      updateSectionData(section.id, { faqs: newFaqs })
                    }}
                  />
                  <button
                    onClick={() => {
                      const newFaqs = data.faqs.filter((_, idx) => idx !== i)
                      updateSectionData(section.id, { faqs: newFaqs })
                    }}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  updateSectionData(section.id, {
                    faqs: [...data.faqs, { question: 'New Question?', answer: 'Answer here...' }]
                  })
                }}
                className="text-blue-600 text-sm hover:underline"
              >
                + Add FAQ
              </button>
            </div>
          </>
        )}

        <button
          onClick={() => removeSection(section.id)}
          className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 mt-4"
        >
          Delete Section
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-100 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="font-bold text-gray-900">Store Builder</h1>
            </div>
            <Button
              onClick={handleSave}
              loading={isSaving}
              className={`text-sm ${saveSuccess ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {saveSuccess ? '✓ Saved!' : 'Save'}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 truncate">/store/{storeSettings.store_slug}</span>
            <button onClick={copyStoreUrl} className="text-blue-600 hover:text-blue-700">
              {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setActivePanel('sections'); setEditingSection(null) }}
            className={`flex-1 py-2 text-sm font-medium ${activePanel === 'sections' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Sections
          </button>
          <button
            onClick={() => setActivePanel('settings')}
            className={`flex-1 py-2 text-sm font-medium ${activePanel === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Settings
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto">
          {activePanel === 'sections' && !editingSection && (
            <div className="p-4">
              {/* Section List */}
              <div className="space-y-2 mb-4">
                {sections.map((section, index) => {
                  const sectionType = SECTION_TYPES.find(s => s.id === section.type)
                  return (
                    <div
                      key={section.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 group"
                    >
                      <sectionType.icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span
                        className="flex-1 text-sm font-medium text-gray-700 truncate cursor-pointer"
                        onClick={() => { setEditingSection(section); setActivePanel('edit') }}
                      >
                        {sectionType.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ChevronUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={index === sections.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeSection(section.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Add Section Button */}
              <button
                onClick={() => setShowAddPanel(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Section
              </button>
            </div>
          )}

          {activePanel === 'edit' && editingSection && (
            <SectionEditor section={editingSection} />
          )}

          {activePanel === 'settings' && (
            <div className="p-4 space-y-4">
              <Input
                label="Store Name"
                value={storeSettings.store_name}
                onChange={(e) => setStoreSettings({ ...storeSettings, store_name: e.target.value })}
              />
              <Input
                label="Store URL"
                value={storeSettings.store_slug}
                onChange={(e) => setStoreSettings({ ...storeSettings, store_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                <input
                  type="color"
                  value={storeSettings.theme_color}
                  onChange={(e) => setStoreSettings({ ...storeSettings, theme_color: e.target.value })}
                  className="h-10 w-full rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Section</h2>
              <button onClick={() => setShowAddPanel(false)} className="p-1 hover:bg-gray-100 rounded">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto max-h-[60vh]">
              {SECTION_TYPES.map((section) => (
                <button
                  key={section.id}
                  onClick={() => addSection(section.id)}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-left transition-colors"
                >
                  <section.icon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{section.name}</p>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Preview Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Preview</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
            >
              <DevicePhoneMobileIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
            >
              <ComputerDesktopIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <a
            href={`/store/${storeSettings.store_slug}`}
            target="_blank"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <EyeIcon className="h-4 w-4" />
            View Live
          </a>
        </div>

        {/* Live Preview */}
        <div className="flex-1 overflow-auto bg-gray-200 p-6 flex justify-center">
          <div
            className={`bg-white shadow-2xl transition-all duration-300 overflow-auto ${
              previewMode === 'mobile' ? 'w-[375px] rounded-3xl' : 'w-full max-w-[1400px] rounded-lg'
            }`}
            style={{ minHeight: previewMode === 'mobile' ? '667px' : 'auto' }}
          >
            {/* Store Header */}
            <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {storeSettings.logo_url ? (
                    <img src={storeSettings.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: storeSettings.theme_color }}
                    >
                      {storeSettings.store_name?.charAt(0) || 'S'}
                    </div>
                  )}
                  <span className="font-bold text-gray-900">{storeSettings.store_name || 'Store Name'}</span>
                </div>
                <div className="relative" style={{ color: storeSettings.theme_color }}>
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] font-bold text-white rounded-full"
                    style={{ backgroundColor: storeSettings.theme_color }}
                  >
                    0
                  </span>
                </div>
              </div>
            </header>

            {/* Sections */}
            <div>
              {sections.map((section) => (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  themeColor={storeSettings.theme_color}
                  products={products}
                  categories={categories}
                  isEditing={true}
                  onEdit={(s) => { setEditingSection(s); setActivePanel('edit') }}
                />
              ))}
            </div>

            {sections.length === 0 && (
              <div className="py-32 text-center text-gray-500">
                <RectangleGroupIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No sections yet</p>
                <p className="text-sm">Click "Add Section" to start building your store</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
