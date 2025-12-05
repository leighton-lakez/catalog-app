import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import Input from '../ui/Input'
import {
  SparklesIcon,
  ArrowPathIcon,
  CheckIcon,
  SwatchIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'

// Predefined style options
const LOGO_STYLES = [
  { id: 'modern', name: 'Modern', description: 'Clean, minimal design' },
  { id: 'vintage', name: 'Vintage', description: 'Retro, classic feel' },
  { id: 'playful', name: 'Playful', description: 'Fun, colorful style' },
  { id: 'elegant', name: 'Elegant', description: 'Sophisticated, luxury' },
  { id: 'bold', name: 'Bold', description: 'Strong, impactful' },
  { id: 'tech', name: 'Tech', description: 'Digital, futuristic' },
]

const ICON_TYPES = [
  { id: 'abstract', name: 'Abstract Shape' },
  { id: 'lettermark', name: 'Letter/Initials' },
  { id: 'icon', name: 'Icon/Symbol' },
  { id: 'wordmark', name: 'Text Only' },
  { id: 'mascot', name: 'Mascot/Character' },
  { id: 'emblem', name: 'Emblem/Badge' },
]

const COLOR_PRESETS = [
  { id: 'blue', colors: ['#3B82F6', '#1E40AF'], name: 'Ocean Blue' },
  { id: 'purple', colors: ['#8B5CF6', '#6D28D9'], name: 'Royal Purple' },
  { id: 'green', colors: ['#10B981', '#047857'], name: 'Forest Green' },
  { id: 'red', colors: ['#EF4444', '#B91C1C'], name: 'Bold Red' },
  { id: 'orange', colors: ['#F97316', '#C2410C'], name: 'Sunset Orange' },
  { id: 'pink', colors: ['#EC4899', '#BE185D'], name: 'Hot Pink' },
  { id: 'teal', colors: ['#14B8A6', '#0F766E'], name: 'Teal' },
  { id: 'gold', colors: ['#F59E0B', '#B45309'], name: 'Golden' },
  { id: 'black', colors: ['#1F2937', '#111827'], name: 'Midnight' },
  { id: 'gradient', colors: ['#8B5CF6', '#EC4899'], name: 'Gradient' },
]

// SVG Logo Generator
function generateLogo(config) {
  const { style, iconType, colors, businessName, initials } = config
  const [primaryColor, secondaryColor] = colors

  // Generate different logo types based on configuration
  const logoGenerators = {
    lettermark: () => generateLettermarkLogo(initials || businessName?.charAt(0) || 'L', primaryColor, secondaryColor, style),
    abstract: () => generateAbstractLogo(primaryColor, secondaryColor, style),
    icon: () => generateIconLogo(primaryColor, secondaryColor, style),
    wordmark: () => generateWordmarkLogo(businessName || 'Logo', primaryColor, style),
    mascot: () => generateMascotLogo(primaryColor, secondaryColor, style),
    emblem: () => generateEmblemLogo(initials || businessName?.charAt(0) || 'L', primaryColor, secondaryColor, style),
  }

  return logoGenerators[iconType]?.() || logoGenerators.abstract()
}

function generateLettermarkLogo(letter, primary, secondary, style) {
  const styles = {
    modern: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect x="20" y="20" width="160" height="160" rx="40" fill="url(#grad1)"/>
        <text x="100" y="130" font-family="Arial, sans-serif" font-size="100" font-weight="bold" fill="white" text-anchor="middle">${letter.toUpperCase()}</text>
      </svg>
    `,
    vintage: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="90" fill="none" stroke="${primary}" stroke-width="8"/>
        <circle cx="100" cy="100" r="75" fill="none" stroke="${secondary}" stroke-width="3"/>
        <text x="100" y="125" font-family="Georgia, serif" font-size="80" font-weight="bold" fill="${primary}" text-anchor="middle">${letter.toUpperCase()}</text>
      </svg>
    `,
    playful: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="85" fill="${primary}"/>
        <circle cx="70" cy="70" r="25" fill="${secondary}" opacity="0.5"/>
        <circle cx="140" cy="50" r="15" fill="white" opacity="0.3"/>
        <text x="100" y="130" font-family="Comic Sans MS, cursive" font-size="90" font-weight="bold" fill="white" text-anchor="middle">${letter.toUpperCase()}</text>
      </svg>
    `,
    elegant: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="140" height="140" fill="${primary}"/>
        <rect x="40" y="40" width="120" height="120" fill="none" stroke="${secondary}" stroke-width="2"/>
        <text x="100" y="125" font-family="Times New Roman, serif" font-size="85" font-style="italic" fill="white" text-anchor="middle">${letter.toUpperCase()}</text>
      </svg>
    `,
    bold: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <polygon points="100,10 190,60 190,140 100,190 10,140 10,60" fill="${primary}"/>
        <text x="100" y="130" font-family="Impact, sans-serif" font-size="100" fill="white" text-anchor="middle">${letter.toUpperCase()}</text>
      </svg>
    `,
    tech: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M100 10 L180 50 L180 150 L100 190 L20 150 L20 50 Z" fill="url(#techGrad)"/>
        <path d="M100 30 L160 60 L160 140 L100 170 L40 140 L40 60 Z" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
        <text x="100" y="125" font-family="Courier New, monospace" font-size="80" font-weight="bold" fill="white" text-anchor="middle">${letter.toUpperCase()}</text>
      </svg>
    `,
  }
  return styles[style] || styles.modern
}

function generateAbstractLogo(primary, secondary, style) {
  const styles = {
    modern: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="absGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primary}" />
            <stop offset="100%" style="stop-color:${secondary}" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="60" fill="url(#absGrad)"/>
        <circle cx="120" cy="120" r="60" fill="${secondary}" opacity="0.7"/>
      </svg>
    `,
    vintage: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="none" stroke="${primary}" stroke-width="6"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="${secondary}" stroke-width="4"/>
        <circle cx="100" cy="100" r="40" fill="${primary}"/>
      </svg>
    `,
    playful: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="100" r="50" fill="${primary}"/>
        <circle cx="140" cy="100" r="50" fill="${secondary}"/>
        <circle cx="100" cy="60" r="40" fill="${primary}" opacity="0.7"/>
        <circle cx="100" cy="140" r="40" fill="${secondary}" opacity="0.7"/>
      </svg>
    `,
    elegant: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 20 Q180 100 100 180 Q20 100 100 20" fill="${primary}"/>
        <path d="M100 40 Q160 100 100 160 Q40 100 100 40" fill="${secondary}" opacity="0.6"/>
      </svg>
    `,
    bold: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="70" height="70" fill="${primary}"/>
        <rect x="110" y="20" width="70" height="70" fill="${secondary}"/>
        <rect x="20" y="110" width="70" height="70" fill="${secondary}"/>
        <rect x="110" y="110" width="70" height="70" fill="${primary}"/>
      </svg>
    `,
    tech: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="techAbsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primary}" />
            <stop offset="100%" style="stop-color:${secondary}" />
          </linearGradient>
        </defs>
        <polygon points="100,20 180,70 180,130 100,180 20,130 20,70" fill="url(#techAbsGrad)"/>
        <polygon points="100,50 150,80 150,120 100,150 50,120 50,80" fill="white" opacity="0.2"/>
      </svg>
    `,
  }
  return styles[style] || styles.modern
}

function generateIconLogo(primary, secondary, style) {
  const styles = {
    modern: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primary}" />
            <stop offset="100%" style="stop-color:${secondary}" />
          </linearGradient>
        </defs>
        <path d="M100 20 L140 80 L180 80 L150 120 L160 180 L100 150 L40 180 L50 120 L20 80 L60 80 Z" fill="url(#iconGrad)"/>
      </svg>
    `,
    vintage: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="none" stroke="${primary}" stroke-width="6"/>
        <path d="M100 40 L115 85 L165 85 L125 115 L140 160 L100 135 L60 160 L75 115 L35 85 L85 85 Z" fill="${primary}"/>
      </svg>
    `,
    playful: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="90" r="70" fill="${primary}"/>
        <circle cx="70" cy="75" r="15" fill="white"/>
        <circle cx="130" cy="75" r="15" fill="white"/>
        <circle cx="70" cy="75" r="8" fill="${secondary}"/>
        <circle cx="130" cy="75" r="8" fill="${secondary}"/>
        <path d="M70 110 Q100 140 130 110" stroke="${secondary}" stroke-width="6" fill="none" stroke-linecap="round"/>
      </svg>
    `,
    elegant: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 30 L110 80 L160 80 L120 110 L135 160 L100 130 L65 160 L80 110 L40 80 L90 80 Z" fill="${primary}"/>
        <circle cx="100" cy="100" r="25" fill="${secondary}"/>
      </svg>
    `,
    bold: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 10 L130 70 L200 70 L145 115 L170 180 L100 140 L30 180 L55 115 L0 70 L70 70 Z" fill="${primary}"/>
      </svg>
    `,
    tech: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="techIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primary}" />
            <stop offset="100%" style="stop-color:${secondary}" />
          </linearGradient>
        </defs>
        <path d="M100 20 L180 100 L100 180 L20 100 Z" fill="url(#techIconGrad)"/>
        <circle cx="100" cy="100" r="30" fill="white" opacity="0.3"/>
        <circle cx="100" cy="100" r="15" fill="white"/>
      </svg>
    `,
  }
  return styles[style] || styles.modern
}

function generateWordmarkLogo(text, primary, style) {
  const displayText = text.length > 12 ? text.substring(0, 12) : text
  const fontSize = Math.max(30, 60 - (displayText.length * 3))

  const fonts = {
    modern: 'Arial, sans-serif',
    vintage: 'Georgia, serif',
    playful: 'Comic Sans MS, cursive',
    elegant: 'Times New Roman, serif',
    bold: 'Impact, sans-serif',
    tech: 'Courier New, monospace',
  }

  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <text x="100" y="110" font-family="${fonts[style]}" font-size="${fontSize}" font-weight="bold" fill="${primary}" text-anchor="middle">${displayText}</text>
      <line x1="30" y1="130" x2="170" y2="130" stroke="${primary}" stroke-width="3"/>
    </svg>
  `
}

function generateMascotLogo(primary, secondary, style) {
  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="90" r="70" fill="${primary}"/>
      <ellipse cx="100" cy="160" rx="50" ry="30" fill="${primary}"/>
      <circle cx="70" cy="80" r="20" fill="white"/>
      <circle cx="130" cy="80" r="20" fill="white"/>
      <circle cx="75" cy="80" r="10" fill="${secondary}"/>
      <circle cx="135" cy="80" r="10" fill="${secondary}"/>
      <ellipse cx="100" cy="110" rx="15" ry="10" fill="${secondary}"/>
      <path d="M75 125 Q100 145 125 125" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>
  `
}

function generateEmblemLogo(letter, primary, secondary, style) {
  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="${primary}"/>
      <circle cx="100" cy="100" r="80" fill="none" stroke="${secondary}" stroke-width="3"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
      <text x="100" y="115" font-family="Georgia, serif" font-size="70" font-weight="bold" fill="white" text-anchor="middle">${letter.toUpperCase()}</text>
      <path d="M30 100 Q30 30 100 30" fill="none" stroke="${secondary}" stroke-width="3"/>
      <path d="M170 100 Q170 170 100 170" fill="none" stroke="${secondary}" stroke-width="3"/>
    </svg>
  `
}

export default function LogoCreator() {
  const { reseller, updateReseller } = useAuth()
  const [businessName, setBusinessName] = useState(reseller?.store_name || '')
  const [selectedStyle, setSelectedStyle] = useState('modern')
  const [selectedIconType, setSelectedIconType] = useState('lettermark')
  const [selectedColors, setSelectedColors] = useState(COLOR_PRESETS[0])
  const [generatedLogos, setGeneratedLogos] = useState([])
  const [selectedLogo, setSelectedLogo] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const generateLogos = () => {
    setIsGenerating(true)

    // Generate multiple variations
    setTimeout(() => {
      const logos = []

      // Generate with selected settings
      logos.push({
        id: 1,
        svg: generateLogo({
          style: selectedStyle,
          iconType: selectedIconType,
          colors: selectedColors.colors,
          businessName,
          initials: businessName.split(' ').map(w => w[0]).join('').substring(0, 2),
        }),
      })

      // Generate variations with different styles
      const otherStyles = LOGO_STYLES.filter(s => s.id !== selectedStyle).slice(0, 2)
      otherStyles.forEach((style, idx) => {
        logos.push({
          id: idx + 2,
          svg: generateLogo({
            style: style.id,
            iconType: selectedIconType,
            colors: selectedColors.colors,
            businessName,
            initials: businessName.split(' ').map(w => w[0]).join('').substring(0, 2),
          }),
        })
      })

      // Generate with different icon types
      const otherTypes = ICON_TYPES.filter(t => t.id !== selectedIconType).slice(0, 3)
      otherTypes.forEach((type, idx) => {
        logos.push({
          id: idx + 4,
          svg: generateLogo({
            style: selectedStyle,
            iconType: type.id,
            colors: selectedColors.colors,
            businessName,
            initials: businessName.split(' ').map(w => w[0]).join('').substring(0, 2),
          }),
        })
      })

      setGeneratedLogos(logos)
      setIsGenerating(false)
    }, 1000)
  }

  const downloadLogo = (svg, format = 'svg') => {
    if (format === 'svg') {
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${businessName || 'logo'}.svg`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'png') {
      // Convert SVG to PNG
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')
      const img = new Image()
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        ctx.drawImage(img, 0, 0, 512, 512)
        canvas.toBlob((blob) => {
          const pngUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = pngUrl
          a.download = `${businessName || 'logo'}.png`
          a.click()
          URL.revokeObjectURL(pngUrl)
        })
        URL.revokeObjectURL(url)
      }
      img.src = url
    }
  }

  const setAsStoreLogo = async () => {
    if (!selectedLogo) return

    setIsSaving(true)
    try {
      // Convert SVG to data URL for storage
      const svgBlob = new Blob([selectedLogo.svg], { type: 'image/svg+xml' })
      const reader = new FileReader()

      reader.onload = async () => {
        await updateReseller({ logo_url: reader.result })
        setIsSaving(false)
        alert('Logo set as your store logo!')
      }

      reader.readAsDataURL(svgBlob)
    } catch (error) {
      console.error('Error saving logo:', error)
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <SparklesIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Logo Creator</h2>
          <p className="text-gray-500 text-sm">Generate a custom logo for your store</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Configuration */}
        <div className="space-y-6">
          {/* Business Name */}
          <div>
            <Input
              label="Business/Store Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your store name"
            />
          </div>

          {/* Logo Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Style</label>
            <div className="grid grid-cols-3 gap-2">
              {LOGO_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    selectedStyle === style.id
                      ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{style.name}</p>
                  <p className="text-xs text-gray-500">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Type</label>
            <div className="grid grid-cols-3 gap-2">
              {ICON_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedIconType(type.id)}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    selectedIconType === type.id
                      ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{type.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SwatchIcon className="h-4 w-4 inline mr-1" />
              Color Scheme
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedColors(preset)}
                  className={`relative p-1 rounded-lg transition-all ${
                    selectedColors.id === preset.id
                      ? 'ring-2 ring-purple-500 ring-offset-2'
                      : ''
                  }`}
                  title={preset.name}
                >
                  <div className="h-10 rounded-lg overflow-hidden flex">
                    <div className="flex-1" style={{ backgroundColor: preset.colors[0] }} />
                    <div className="flex-1" style={{ backgroundColor: preset.colors[1] }} />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Selected: {selectedColors.name}</p>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateLogos}
            loading={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            Generate Logos
          </Button>
        </div>

        {/* Right: Generated Logos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Generated Logos</label>

          {generatedLogos.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Configure your preferences and click Generate</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {generatedLogos.map((logo) => (
                  <button
                    key={logo.id}
                    onClick={() => setSelectedLogo(logo)}
                    className={`aspect-square p-2 border-2 rounded-xl transition-all bg-white ${
                      selectedLogo?.id === logo.id
                        ? 'border-purple-500 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: logo.svg }}
                    />
                    {selectedLogo?.id === logo.id && (
                      <div className="absolute top-1 right-1 bg-purple-500 rounded-full p-0.5">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Logo Preview */}
              {selectedLogo && (
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-3">Selected Logo</p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-24 h-24 bg-white rounded-lg p-2 border"
                      dangerouslySetInnerHTML={{ __html: selectedLogo.svg }}
                    />
                    <div className="flex-1 space-y-2">
                      <Button
                        onClick={() => downloadLogo(selectedLogo.svg, 'svg')}
                        variant="secondary"
                        className="w-full text-sm"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                        Download SVG
                      </Button>
                      <Button
                        onClick={() => downloadLogo(selectedLogo.svg, 'png')}
                        variant="secondary"
                        className="w-full text-sm"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                        Download PNG
                      </Button>
                      <Button
                        onClick={setAsStoreLogo}
                        loading={isSaving}
                        className="w-full text-sm bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Set as Store Logo
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Regenerate */}
              <button
                onClick={generateLogos}
                className="w-full py-2 text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 text-sm"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Generate More Variations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
