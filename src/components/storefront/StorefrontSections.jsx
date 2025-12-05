import { formatCurrency } from '../../lib/utils'
import { useCartStore } from '../../stores/cartStore'
import {
  PhotoIcon,
  StarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  RectangleGroupIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline'

// Section renderer for public storefront (no edit overlay)
const SectionRenderer = ({ section, themeColor, products, categories, onAddToCart }) => {
  const { type, data } = section

  switch (type) {
    case 'announcement':
      return (
        <div
          className="py-2.5 px-4 text-center text-sm font-medium"
          style={{ backgroundColor: data.backgroundColor, color: data.textColor }}
        >
          {data.link ? (
            <a href={data.link} className="hover:underline">{data.text}</a>
          ) : (
            data.text
          )}
        </div>
      )

    case 'hero':
      return (
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
              <a
                href={data.buttonLink || '#products'}
                className="inline-block px-8 py-3 rounded-lg font-semibold text-lg transition-transform hover:scale-105"
                style={{
                  backgroundColor: data.textColor,
                  color: data.backgroundColor
                }}
              >
                {data.buttonText}
              </a>
            )}
          </div>
        </div>
      )

    case 'featured-products':
      return (
        <div className="py-12 px-6" id="products">
          <div className="max-w-7xl mx-auto">
            {data.title && (
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{data.title}</h2>
                {data.subtitle && <p className="text-gray-600 mt-2">{data.subtitle}</p>}
              </div>
            )}
            <div className={`grid grid-cols-2 md:grid-cols-${data.columns || 4} gap-4 md:gap-6`}>
              {products.slice(0, data.limit || 8).map((product) => (
                <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <PhotoIcon className="h-12 w-12 text-gray-300" />
                    )}
                    {onAddToCart && (
                      <button
                        onClick={() => onAddToCart(product)}
                        className="absolute bottom-2 right-2 p-2 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: themeColor }}
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    {data.showDescription && product.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    )}
                    {(data.showPrice !== false) && (
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-bold" style={{ color: themeColor }}>
                          {formatCurrency(product.price)}
                        </p>
                        {onAddToCart && (
                          <button
                            onClick={() => onAddToCart(product)}
                            className="text-sm font-medium px-3 py-1 rounded-lg transition-colors"
                            style={{ backgroundColor: themeColor + '15', color: themeColor }}
                          >
                            Add
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'categories':
      if (!categories || categories.length === 0) return null
      return (
        <div className="py-12 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {data.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>
            )}
            <div className={`grid grid-cols-2 md:grid-cols-${data.columns || 3} gap-4`}>
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`#category-${category.id}`}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer border border-gray-200"
                >
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: themeColor + '20' }}
                  >
                    <RectangleGroupIcon className="h-8 w-8" style={{ color: themeColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </a>
              ))}
            </div>
          </div>
        </div>
      )

    case 'testimonials':
      return (
        <div className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            {data.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>
            )}
            <div className="grid md:grid-cols-3 gap-6">
              {data.testimonials?.map((testimonial, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, j) => (
                      <StarIcon key={j} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: themeColor }}
                    >
                      {testimonial.name?.charAt(0) || '?'}
                    </div>
                    <span className="font-medium text-gray-900">{testimonial.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'text-block':
      return (
        <div className="py-12 px-6" style={{ backgroundColor: data.backgroundColor || 'white' }}>
          <div className={`max-w-3xl mx-auto text-${data.alignment || 'center'}`}>
            {data.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{data.title}</h2>
            )}
            <p className="text-gray-600 text-lg leading-relaxed">{data.content}</p>
          </div>
        </div>
      )

    case 'image-banner':
      return (
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
                <a
                  href={data.buttonLink || '#'}
                  className="px-6 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100"
                >
                  {data.buttonText}
                </a>
              )}
            </div>
          )}
        </div>
      )

    case 'features':
      return (
        <div className="py-12 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {data.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>
            )}
            <div className={`grid grid-cols-2 md:grid-cols-${data.columns || 4} gap-6`}>
              {data.features?.map((feature, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'newsletter':
      return (
        <div className="py-12 px-6" style={{ backgroundColor: data.backgroundColor || '#F3F4F6' }}>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h2>
            <p className="text-gray-600 mb-6">{data.subtitle}</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: themeColor }}
              >
                {data.buttonText || 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      )

    case 'contact':
      return (
        <div className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>
            <div className={`grid ${data.showForm ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8`}>
              <div className="space-y-4">
                {data.email && (
                  <a href={`mailto:${data.email}`} className="flex items-center gap-3 hover:text-blue-600">
                    <EnvelopeIcon className="h-6 w-6" style={{ color: themeColor }} />
                    <span>{data.email}</span>
                  </a>
                )}
                {data.phone && (
                  <a href={`tel:${data.phone}`} className="flex items-center gap-3 hover:text-blue-600">
                    <PhoneIcon className="h-6 w-6" style={{ color: themeColor }} />
                    <span>{data.phone}</span>
                  </a>
                )}
                {data.address && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-6 w-6" style={{ color: themeColor }} />
                    <span>{data.address}</span>
                  </div>
                )}
              </div>
              {data.showForm && (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="email" placeholder="Your Email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: themeColor }}
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )

    case 'faq':
      return (
        <div className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>
            <div className="space-y-4">
              {data.faqs?.map((faq, i) => (
                <details key={i} className="bg-white rounded-lg border border-gray-200 group">
                  <summary className="p-4 font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    {faq.question}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="px-4 pb-4 text-gray-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      )

    case 'social-proof':
      return (
        <div className="py-12 px-6" style={{ backgroundColor: themeColor }}>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {data.stats?.map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'divider':
      return (
        <div className={`${data.spacing === 'large' ? 'py-8' : data.spacing === 'medium' ? 'py-4' : 'py-2'}`}>
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
        </div>
      )

    case 'spacer':
      return (
        <div className={`${data.height === 'large' ? 'h-24' : data.height === 'medium' ? 'h-16' : 'h-8'}`} />
      )

    default:
      return null
  }
}

export default function StorefrontSections({ sections, themeColor, products, categories, onAddToCart }) {
  if (!sections || sections.length === 0) {
    return null
  }

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          themeColor={themeColor}
          products={products}
          categories={categories}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}
