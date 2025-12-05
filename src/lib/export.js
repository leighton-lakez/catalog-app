// CSV Export utilities

export function exportToCSV(data, filename, columns) {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Build header row
  const headers = columns.map(col => col.label).join(',')

  // Build data rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = col.getValue ? col.getValue(item) : item[col.key]

      // Handle null/undefined
      if (value === null || value === undefined) {
        value = ''
      }

      // Convert to string
      value = String(value)

      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`
      }

      return value
    }).join(',')
  })

  // Combine into CSV content
  const csv = [headers, ...rows].join('\n')

  // Download
  downloadFile(csv, `${filename}.csv`, 'text/csv')
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Predefined export configurations
export const EXPORT_CONFIGS = {
  orders: [
    { key: 'id', label: 'Order ID' },
    { key: 'created_at', label: 'Date', getValue: (o) => new Date(o.created_at).toLocaleDateString() },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'customer_email', label: 'Customer Email' },
    { key: 'customer_phone', label: 'Customer Phone' },
    { key: 'status', label: 'Status' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'total_amount', label: 'Total', getValue: (o) => o.total_amount?.toFixed(2) },
    { key: 'discount_code', label: 'Discount Code' },
    { key: 'discount_amount', label: 'Discount Amount', getValue: (o) => o.discount_amount?.toFixed(2) || '0.00' },
    { key: 'tracking_number', label: 'Tracking Number' },
    { key: 'notes', label: 'Notes' },
    { key: 'items', label: 'Items', getValue: (o) => o.order_items?.map(i => `${i.product_name} x${i.quantity}`).join('; ') },
  ],

  products: [
    { key: 'id', label: 'Product ID' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'price', label: 'Price', getValue: (p) => p.price?.toFixed(2) },
    { key: 'cost_price', label: 'Cost Price', getValue: (p) => p.cost_price?.toFixed(2) },
    { key: 'stock_quantity', label: 'Stock', getValue: (p) => p.stock_quantity === -1 ? 'Unlimited' : p.stock_quantity },
    { key: 'category', label: 'Category', getValue: (p) => p.categories?.name || '' },
    { key: 'is_active', label: 'Active', getValue: (p) => p.is_active ? 'Yes' : 'No' },
    { key: 'created_at', label: 'Created', getValue: (p) => new Date(p.created_at).toLocaleDateString() },
  ],

  customers: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'orders', label: 'Total Orders' },
    { key: 'revenue', label: 'Total Spent', getValue: (c) => c.revenue?.toFixed(2) },
    { key: 'first_order', label: 'First Order', getValue: (c) => c.first_order ? new Date(c.first_order).toLocaleDateString() : '' },
    { key: 'last_order', label: 'Last Order', getValue: (c) => c.last_order ? new Date(c.last_order).toLocaleDateString() : '' },
  ],

  expenses: [
    { key: 'id', label: 'Expense ID' },
    { key: 'date', label: 'Date', getValue: (e) => new Date(e.date).toLocaleDateString() },
    { key: 'category', label: 'Category' },
    { key: 'amount', label: 'Amount', getValue: (e) => e.amount?.toFixed(2) },
    { key: 'description', label: 'Description' },
    { key: 'is_recurring', label: 'Recurring', getValue: (e) => e.is_recurring ? 'Yes' : 'No' },
  ],

  inventory_log: [
    { key: 'created_at', label: 'Date', getValue: (l) => new Date(l.created_at).toLocaleString() },
    { key: 'product', label: 'Product', getValue: (l) => l.products?.name || '' },
    { key: 'change_amount', label: 'Change', getValue: (l) => l.change_amount > 0 ? `+${l.change_amount}` : l.change_amount },
    { key: 'new_quantity', label: 'New Stock' },
    { key: 'reason', label: 'Reason' },
    { key: 'order_id', label: 'Order ID' },
    { key: 'notes', label: 'Notes' },
  ],
}

// Quick export functions
export function exportOrders(orders) {
  const filename = `orders_${new Date().toISOString().split('T')[0]}`
  exportToCSV(orders, filename, EXPORT_CONFIGS.orders)
}

export function exportProducts(products) {
  const filename = `products_${new Date().toISOString().split('T')[0]}`
  exportToCSV(products, filename, EXPORT_CONFIGS.products)
}

export function exportCustomers(customers) {
  const filename = `customers_${new Date().toISOString().split('T')[0]}`
  exportToCSV(customers, filename, EXPORT_CONFIGS.customers)
}

export function exportExpenses(expenses) {
  const filename = `expenses_${new Date().toISOString().split('T')[0]}`
  exportToCSV(expenses, filename, EXPORT_CONFIGS.expenses)
}

export function exportInventoryLog(logs) {
  const filename = `inventory_log_${new Date().toISOString().split('T')[0]}`
  exportToCSV(logs, filename, EXPORT_CONFIGS.inventory_log)
}
