import { useState } from 'react'
import { formatCurrency, formatDateTime, ORDER_STATUSES } from '../../lib/utils'
import OrderStatusBadge from './OrderStatusBadge'
import OrderDetail from './OrderDetail'
import OrderForm from './OrderForm'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

// Tag color mapping for display
const TAG_COLORS = {
  gray: 'bg-gray-100 text-gray-700',
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  pink: 'bg-pink-100 text-pink-700',
}

export default function OrderList({
  orders,
  deletedOrders = [],
  products,
  onUpdateStatus,
  onCreateOrder,
  onDeleteOrder,
  onRestoreOrder,
  onPermanentlyDelete,
  onUpdateNotes,
  onUpdateTags,
  loading,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showDeletedOrders, setShowDeletedOrders] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = useState(null)

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone?.includes(searchQuery) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleCreateOrder = async (orderData) => {
    setFormLoading(true)
    try {
      await onCreateOrder(orderData)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create order: ' + error.message)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {deletedOrders.length > 0 && (
            <button
              onClick={() => setShowDeletedOrders(!showDeletedOrders)}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm ${
                showDeletedOrders
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArchiveBoxIcon className="h-4 sm:h-5 w-4 sm:w-5" />
              <span className="hidden sm:inline">Deleted</span> ({deletedOrders.length})
            </button>
          )}
          <Button onClick={() => setIsCreateModalOpen(true)} className="text-sm">
            <PlusIcon className="h-5 w-5 sm:mr-1" />
            <span className="hidden sm:inline">Add Order</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Statuses</option>
          {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingCartIcon}
          title={searchQuery || statusFilter ? 'No orders found' : 'No orders yet'}
          description={
            searchQuery || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Click "Add Order" to create your first order, or share your store link for customers to place orders.'
          }
          action={
            !searchQuery && !statusFilter && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon className="h-5 w-5 mr-1" />
                Add Order
              </Button>
            )
          }
        />
      ) : (
        <>
        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-gray-900">{order.customer_name}</div>
                  <div className="text-sm text-gray-500">{order.customer_phone}</div>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{order.order_items?.length || 0} items</span>
                <span className="font-semibold text-gray-900">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">{formatDateTime(order.created_at)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirm(order)
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_phone}</div>
                      {order.tags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(typeof order.tags === 'string' ? JSON.parse(order.tags) : order.tags).slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${TAG_COLORS[tag.color] || TAG_COLORS.blue}`}
                            >
                              {tag.name}
                            </span>
                          ))}
                          {(typeof order.tags === 'string' ? JSON.parse(order.tags) : order.tags).length > 2 && (
                            <span className="text-xs text-gray-400">+{(typeof order.tags === 'string' ? JSON.parse(order.tags) : order.tags).length - 2}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.order_items?.length || 0} items
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirm(order)
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete order"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <OrderDetail
            order={selectedOrder}
            onUpdateStatus={async (status) => {
              await onUpdateStatus(selectedOrder.id, status)
              setSelectedOrder({ ...selectedOrder, status })
            }}
            onUpdateNotes={async (orderId, notes) => {
              const updated = await onUpdateNotes(orderId, notes)
              setSelectedOrder(updated)
            }}
            onUpdateTags={async (orderId, tags) => {
              const updated = await onUpdateTags(orderId, tags)
              setSelectedOrder(updated)
            }}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </Modal>

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Order"
        size="lg"
      >
        <OrderForm
          products={products}
          onSubmit={handleCreateOrder}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Order"
        size="sm"
      >
        {deleteConfirm && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                This order will be moved to the deleted orders section. You can restore it later if needed.
              </p>
            </div>
            <p className="text-gray-600">
              Are you sure you want to delete the order for <span className="font-semibold">{deleteConfirm.customer_name}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  await onDeleteOrder(deleteConfirm.id)
                  setDeleteConfirm(null)
                }}
              >
                Delete Order
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Deleted Orders Section */}
      {showDeletedOrders && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <ArchiveBoxIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Deleted Orders</h2>
            <span className="text-sm text-gray-500">({deletedOrders.length} orders)</span>
          </div>

          {deletedOrders.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <ArchiveBoxIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No deleted orders</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deleted At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deletedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{order.customer_name}</div>
                        <div className="text-sm text-gray-500">{order.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(order.deleted_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onRestoreOrder(order.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                            Restore
                          </button>
                          <button
                            onClick={() => setPermanentDeleteConfirm(order)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete Forever
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      <Modal
        isOpen={!!permanentDeleteConfirm}
        onClose={() => setPermanentDeleteConfirm(null)}
        title="Permanently Delete Order"
        size="sm"
      >
        {permanentDeleteConfirm && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. The order will be permanently deleted from your records.
              </p>
            </div>
            <p className="text-gray-600">
              Are you sure you want to permanently delete the order for <span className="font-semibold">{permanentDeleteConfirm.customer_name}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setPermanentDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  await onPermanentlyDelete(permanentDeleteConfirm.id)
                  setPermanentDeleteConfirm(null)
                }}
              >
                Delete Forever
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
