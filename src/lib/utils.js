export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const PAYMENT_METHODS = {
  zelle: {
    name: 'Zelle',
    icon: '💵',
    fields: ['email', 'phone'],
    placeholder: { email: 'Email address', phone: 'Phone number' }
  },
  venmo: {
    name: 'Venmo',
    icon: '📱',
    fields: ['username'],
    placeholder: { username: '@username' }
  },
  paypal: {
    name: 'PayPal',
    icon: '🅿️',
    fields: ['email', 'link'],
    placeholder: { email: 'PayPal email', link: 'paypal.me/yourname' }
  },
  cashapp: {
    name: 'Cash App',
    icon: '💰',
    fields: ['cashtag'],
    placeholder: { cashtag: '$cashtag' }
  }
}

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
}
