import { useState } from 'react'
import { useCustomers } from '../../hooks/useCustomers'
import { formatDate, formatCurrency } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShoppingBagIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

export default function Customers() {
  const { customers, loading, createCustomer, deleteCustomer, getCustomerOrders } = useCustomers()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase()
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.includes(query)
    )
  })

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer)
    setOrdersLoading(true)
    try {
      const orders = await getCustomerOrders(customer.id)
      setCustomerOrders(orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    try {
      await createCustomer(formData)
      setIsModalOpen(false)
      setFormData({ name: '', email: '', phone: '', address: '' })
    } catch (error) {
      console.error('Error creating customer:', error)
      alert('Failed to create customer')
    }
  }

  const handleDelete = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      await deleteCustomer(customerId)
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null)
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Failed to delete customer')
    }
  }

  const totalSpent = (customer) => {
    // This would be calculated from orders
    return customer.total_spent || 0
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">
            Manage your customer database ({customers.length} total)
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2">
          {filteredCustomers.length === 0 ? (
            <EmptyState
              icon={UserGroupIcon}
              title={searchQuery ? 'No customers found' : 'No customers yet'}
              description={
                searchQuery
                  ? 'Try adjusting your search'
                  : 'Customers will appear here when they place orders or you add them manually.'
              }
            />
          ) : (
            <div className="bg-white rounded-xl border divide-y">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleViewCustomer(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {customer.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{customer.name}</h3>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {customer.order_count || 0} orders
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(totalSpent(customer))}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(customer.id)
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

        {/* Customer Detail */}
        <div className="lg:col-span-1">
          {selectedCustomer ? (
            <div className="bg-white rounded-xl border p-5 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-medium mx-auto">
                  {selectedCustomer.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{selectedCustomer.name}</h3>
                <p className="text-sm text-gray-500">Customer since {formatDate(selectedCustomer.created_at)}</p>
              </div>

              <div className="space-y-3 mb-6">
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${selectedCustomer.email}`} className="text-blue-600 hover:underline">
                      {selectedCustomer.email}
                    </a>
                  </div>
                )}
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${selectedCustomer.phone}`} className="text-blue-600 hover:underline">
                      {selectedCustomer.phone}
                    </a>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{selectedCustomer.address}</span>
                  </div>
                )}
              </div>

              {/* Order History */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ShoppingBagIcon className="h-4 w-4" />
                  Order History
                </h4>
                {ordersLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : customerOrders.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                        <p className="text-gray-600 mt-1">
                          {order.order_items?.length || 0} items
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
              <EyeIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Customer"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
