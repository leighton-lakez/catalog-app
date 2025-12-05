import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, HeartIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../../lib/utils'

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistItems,
  onRemove,
  onAddToCart,
  onClear
}) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b">
                      <Dialog.Title className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <HeartIcon className="h-5 w-5 text-red-500" />
                        Wishlist ({wishlistItems.length})
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Wishlist Items */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      {wishlistItems.length === 0 ? (
                        <div className="text-center py-12">
                          <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Your wishlist is empty</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Save items you love by clicking the heart icon
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {wishlistItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-4 bg-gray-50 rounded-lg p-3"
                            >
                              {/* Product Image */}
                              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                    No image
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {item.name}
                                </h4>
                                <p className="text-lg font-semibold text-blue-600 mt-1">
                                  {formatCurrency(item.price)}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => onAddToCart(item)}
                                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    <ShoppingCartIcon className="h-4 w-4" />
                                    Add to Cart
                                  </button>
                                  <button
                                    onClick={() => onRemove(item.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove from wishlist"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {wishlistItems.length > 0 && (
                      <div className="border-t px-4 py-4">
                        <button
                          onClick={onClear}
                          className="w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Clear Wishlist
                        </button>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
