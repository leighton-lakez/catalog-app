import { ORDER_STATUSES } from '../../lib/utils'

export default function OrderStatusBadge({ status }) {
  const statusInfo = ORDER_STATUSES[status] || ORDER_STATUSES.pending

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
      {statusInfo.label}
    </span>
  )
}
