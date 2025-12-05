import OrderList from '../../components/orders/OrderList'
import { useOrders } from '../../hooks/useOrders'
import { useProducts } from '../../hooks/useProducts'

export default function Orders() {
  const {
    orders,
    deletedOrders,
    loading,
    updateOrderStatus,
    createOrder,
    deleteOrder,
    restoreOrder,
    permanentlyDeleteOrder,
    updateOrderNotes,
    updateOrderTags,
  } = useOrders()
  const { products } = useProducts()

  return (
    <OrderList
      orders={orders}
      deletedOrders={deletedOrders}
      products={products}
      onUpdateStatus={updateOrderStatus}
      onCreateOrder={createOrder}
      onDeleteOrder={deleteOrder}
      onRestoreOrder={restoreOrder}
      onPermanentlyDelete={permanentlyDeleteOrder}
      onUpdateNotes={updateOrderNotes}
      onUpdateTags={updateOrderTags}
      loading={loading}
    />
  )
}
