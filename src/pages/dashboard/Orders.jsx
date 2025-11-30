import OrderList from '../../components/orders/OrderList'
import { useOrders } from '../../hooks/useOrders'
import { useProducts } from '../../hooks/useProducts'

export default function Orders() {
  const { orders, loading, updateOrderStatus, createOrder } = useOrders()
  const { products } = useProducts()

  return (
    <OrderList
      orders={orders}
      products={products}
      onUpdateStatus={updateOrderStatus}
      onCreateOrder={createOrder}
      loading={loading}
    />
  )
}
