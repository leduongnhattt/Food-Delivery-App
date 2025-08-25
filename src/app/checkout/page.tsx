import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { CartItem } from '@/types'

// Mock cart data - replace with actual cart state
const mockCartItems: CartItem[] = [
  {
    menuItem: {
      id: '1',
      name: 'Margherita Pizza',
      description: 'Classic tomato sauce with mozzarella cheese and fresh basil',
      price: 150000,
      image: '/api/placeholder/300/200',
      category: 'Pizza',
      isAvailable: true,
      restaurantId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    quantity: 2,
    specialInstructions: 'Extra cheese please'
  },
  {
    menuItem: {
      id: '3',
      name: 'Garlic Bread',
      description: 'Fresh baked bread with garlic butter and herbs',
      price: 45000,
      image: '/api/placeholder/300/200',
      category: 'Appetizer',
      isAvailable: true,
      restaurantId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    quantity: 1
  }
]

export default function CheckoutPage() {
  const totalItems = mockCartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = mockCartItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  )
  const deliveryFee = 15000
  const total = subtotal + deliveryFee

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCartItems.map((item) => (
                    <div key={item.menuItem.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.menuItem.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}x {formatPrice(item.menuItem.price)}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-xs text-muted-foreground">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.menuItem.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <Input placeholder="Enter your full name" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input placeholder="Enter your phone number" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Delivery Address
                  </label>
                  <Input placeholder="Enter your delivery address" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <Input placeholder="e.g., Call when arriving, leave at gate" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="payment" value="cash" defaultChecked />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="payment" value="card" />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="payment" value="momo" />
                    <span>MoMo</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg">
              Place Order - {formatPrice(total)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
