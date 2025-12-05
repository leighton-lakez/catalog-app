import { useState, useRef } from 'react'
import { PhotoIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function MultiImageUpload({ images = [], onChange, onUpload, maxImages = 10 }) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  // Ensure images is always an array
  const imageList = Array.isArray(images) ? images : images ? [images] : []

  const handleFile = async (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    // Check max images
    if (imageList.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    try {
      setUploading(true)
      const url = await onUpload(file)
      onChange([...imageList, url])
    } catch (error) {
      console.error('Upload error:', error)
      if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        alert('Storage not set up. Please create a "product-images" bucket in Supabase Storage and make it public.')
      } else {
        alert('Failed to upload image: ' + (error.message || 'Unknown error'))
      }
    } finally {
      setUploading(false)
    }
  }

  const handleMultipleFiles = async (files) => {
    const fileArray = Array.from(files)
    const remainingSlots = maxImages - imageList.length

    if (fileArray.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`)
    }

    const filesToUpload = fileArray.slice(0, remainingSlots)

    for (const file of filesToUpload) {
      await handleFile(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMultipleFiles(e.target.files)
    }
  }

  const handleRemove = (index) => {
    const newImages = imageList.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleSetPrimary = (index) => {
    if (index === 0) return // Already primary
    const newImages = [...imageList]
    const [removed] = newImages.splice(index, 1)
    newImages.unshift(removed)
    onChange(newImages)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Product Images ({imageList.length}/{maxImages})
      </label>

      {/* Image Grid */}
      {imageList.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {imageList.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className={`w-full h-full object-cover rounded-lg ${
                  index === 0 ? 'ring-2 ring-blue-500' : ''
                }`}
              />
              {index === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded">
                  Main
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-blue-100"
                    title="Set as main image"
                  >
                    <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-100"
                  title="Remove image"
                >
                  <XMarkIcon className="h-3 w-3 text-red-600" />
                </button>
              </div>
            </div>
          ))}

          {/* Add More Button */}
          {imageList.length < maxImages && (
            <div
              className={`relative aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              {uploading ? (
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
              ) : (
                <PlusIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State / Drop Zone */}
      {imageList.length === 0 && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />

          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB each (max {maxImages} images)</p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        First image will be the main product image. Click the star to change the main image.
      </p>
    </div>
  )
}
