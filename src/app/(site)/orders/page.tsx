import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'
import { Order, OrderStatus } from '@/types/models'

// Mock data - replace with actual API call
const mockOrders: Order[] = [
  {
    id: '1',
    userId: 'user1',
    restaurantId: '1',
    items: [
      {
        id: '1',
        orderId: '1',
        menuItemId: '1',
        quantity: 2,
        price: 150000,
        specialInstructions: 'Extra cheese please'
      },
      {
        id: '2',
        orderId: '1',
        menuItemId: '3',
        quantity: 1,
        price: 45000
      }
    ],
    totalAmount: 345000,
    status: 'delivered',
    deliveryAddress: '123 Main St, Ho Chi Minh City',
    deliveryInstructions: 'Please call when arriving',
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T11:15:00'),
  },
  {
    id: '2',
    userId: 'user1',
    restaurantId: '2',
    items: [
      {
        id: '3',
        orderId: '2',
        menuItemId: '5',
        quantity: 1,
        price: 200000
      }
    ],
    totalAmount: 200000,
    status: 'out_for_delivery',
    deliveryAddress: '456 Nguyen Hue, Ho Chi Minh City',
    createdAt: new Date('2024-01-16T12:00:00'),
    updatedAt: new Date('2024-01-16T12:45:00'),
  },
  {
    id: '3',
    userId: 'user1',
    restaurantId: '1',
    items: [
      {
        id: '4',
        orderId: '3',
        menuItemId: '2',
        quantity: 1,
        price: 180000
      }
    ],
    totalAmount: 180000,
    status: 'preparing',
    deliveryAddress: '789 Le Loi, Ho Chi Minh City',
    createdAt: new Date('2024-01-16T18:30:00'),
    updatedAt: new Date('2024-01-16T18:35:00'),
  },
]

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'confirmed':
      return 'text-blue-600 bg-blue-100'
    case 'preparing':
      return 'text-orange-600 bg-orange-100'
    case 'out_for_delivery':
      return 'text-purple-600 bg-purple-100'
    case 'delivered':
      return 'text-green-600 bg-green-100'
    case 'cancelled':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'confirmed':
      return 'Confirmed'
    case 'preparing':
      return 'Preparing'
    case 'out_for_delivery':
      return 'Out for Delivery'
    case 'delivered':
      return 'Delivered'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}

export default function OrdersPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          Track your order history and current orders
        </p>
      </div>
      
      <div className="space-y-6">
        {mockOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ordered on {formatDate(order.createdAt)}
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x Item #{item.menuItemId}
                          {item.specialInstructions && (
                            <span className="text-muted-foreground ml-2">
                              ({item.specialInstructions})
                            </span>
                          )}
                        </span>
                        <span>{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Delivery Address:</span>
                    <p className="text-muted-foreground">{order.deliveryAddress}</p>
                    {order.deliveryInstructions && (
                      <p className="text-muted-foreground text-xs mt-1">
                        Note: {order.deliveryInstructions}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Total: {formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {order.status === 'delivered' && (
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <Button size="sm">
                      Track Order
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
