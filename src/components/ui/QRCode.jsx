import { useEffect, useRef } from 'react'

// Simple QR Code generator using canvas
// Based on the QR code algorithm

export default function QRCode({ value, size = 200, bgColor = '#FFFFFF', fgColor = '#000000' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!value || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Generate QR code matrix
    const qr = generateQRMatrix(value)
    const moduleCount = qr.length
    const moduleSize = size / moduleCount

    // Clear canvas
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)

    // Draw modules
    ctx.fillStyle = fgColor
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }, [value, size, bgColor, fgColor])

  const downloadQR = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="inline-block">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-lg"
      />
      <button
        onClick={downloadQR}
        className="mt-2 w-full text-sm text-blue-600 hover:text-blue-700"
      >
        Download QR Code
      </button>
    </div>
  )
}

// Simple QR code generation (basic implementation)
// For production, consider using a library like qrcode.js
function generateQRMatrix(text) {
  // This is a simplified QR code generator
  // It creates a basic pattern based on the text
  // For a real QR code, you'd need a proper library

  const size = Math.max(21, Math.min(177, 21 + Math.floor(text.length / 5) * 4))
  const matrix = Array(size).fill(null).map(() => Array(size).fill(false))

  // Add finder patterns (the three big squares in corners)
  addFinderPattern(matrix, 0, 0)
  addFinderPattern(matrix, size - 7, 0)
  addFinderPattern(matrix, 0, size - 7)

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }

  // Encode data (simplified - just creates a pattern based on text)
  const dataArea = []
  for (let row = 9; row < size - 8; row++) {
    for (let col = 9; col < size - 8; col++) {
      if (col !== 6 && row !== 6) {
        dataArea.push({ row, col })
      }
    }
  }

  // Convert text to binary pattern
  let binary = ''
  for (let i = 0; i < text.length; i++) {
    binary += text.charCodeAt(i).toString(2).padStart(8, '0')
  }

  // Fill data area
  for (let i = 0; i < dataArea.length && i < binary.length * 2; i++) {
    const { row, col } = dataArea[i]
    const bitIndex = Math.floor(i / 2)
    if (bitIndex < binary.length) {
      // Add some variation using XOR masking
      const mask = (row + col) % 2 === 0
      matrix[row][col] = (binary[bitIndex] === '1') !== mask
    }
  }

  return matrix
}

function addFinderPattern(matrix, row, col) {
  // Outer black border
  for (let i = 0; i < 7; i++) {
    matrix[row][col + i] = true
    matrix[row + 6][col + i] = true
    matrix[row + i][col] = true
    matrix[row + i][col + 6] = true
  }

  // Inner white border
  for (let i = 1; i < 6; i++) {
    matrix[row + 1][col + i] = false
    matrix[row + 5][col + i] = false
    matrix[row + i][col + 1] = false
    matrix[row + i][col + 5] = false
  }

  // Center black square
  for (let i = 2; i < 5; i++) {
    for (let j = 2; j < 5; j++) {
      matrix[row + i][col + j] = true
    }
  }
}

// QR Code modal component
export function QRCodeModal({ isOpen, onClose, url, title = 'QR Code' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
          <div className="flex justify-center mb-4">
            <QRCode value={url} size={200} />
          </div>
          <p className="text-sm text-gray-500 text-center break-all mb-4">{url}</p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
