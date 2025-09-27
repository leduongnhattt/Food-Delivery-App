'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { CartItem } from '@/types/models'
import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowLeft, Clock, MapPin, Star, Truck, Gift, CheckCircle, Circle, Info, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { RestaurantService } from '@/services/restaurant.service'
import { RestaurantHeader } from '@/components/checkout/RestaurantHeader'
import { CartItems } from '@/components/checkout/CartItems'
import { DeliveryForm } from '@/components/checkout/DeliveryForm'
import { PromoOffers } from '@/components/checkout/PromoOffers'
import { PaymentSelector } from '@/components/checkout/PaymentSelector'
import { OrderSummary } from '@/components/checkout/OrderSummary'

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const [appliedVoucher, setAppliedVoucher] = useState<{code: string, discount: number} | null>(null)
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false)
  // Mock user data - in real app, this would come from user profile
  const userInfo = {
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    email: 'user@example.com'
  }

  const [deliveryInfo, setDeliveryInfo] = useState({
    phone: userInfo.phone,
    address: userInfo.address
  })

  // Payment method and modal to switch methods
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'momo'>('cash')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Payment method is fixed to Cash on Delivery per UX

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">🛒</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some delicious food to get started!</p>
            <Button onClick={() => router.push('/')} className="bg-orange-500 hover:bg-orange-600">
              Browse Restaurants
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  )
  const deliveryFee = 0.5
  const voucherDiscount = appliedVoucher?.discount || 0
  const total = subtotal + deliveryFee - voucherDiscount

  // Get restaurant info from first cart item
  const restaurantInfo = cartItems[0]?.menuItem ? {
    name: cartItems[0].menuItem.restaurantName || 'Restaurant Name',
    rating: 4.5,
    deliveryTime: '25-35 min',
    address: '123 Main Street, City'
  } : null

  const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null)

  useEffect(() => {
    const first = cartItems[0]?.menuItem
    if (!first) return
    // Try to fetch restaurant avatar/logo by restaurantId
    RestaurantService.getRestaurantById(first.restaurantId)
      .then((r) => {
        if (r && r.avatarUrl) setRestaurantLogo(r.avatarUrl)
      })
      .catch(() => {})
  }, [cartItems])

  const handleQuantityChange = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(menuItemId)
    } else {
      updateQuantity(menuItemId, newQuantity)
    }
  }

  // Mock available offers list (some may not be eligible)
  const availableOffers: Array<{ code: string; discount: number; description: string; eligible: boolean }> = [
    { code: 'WELCOME10', discount: 10000, description: 'New user discount', eligible: true },
    { code: 'SAVE20', discount: 20000, description: 'Orders over 200k', eligible: true },
    { code: 'LUNCHONLY', discount: 15000, description: 'Valid 11:00-14:00', eligible: false }
  ]

  const handleApplyVoucher = (code: string) => {
    const offer = availableOffers.find(o => o.code === code && o.eligible)
    if (offer) {
      setAppliedVoucher({ code: offer.code, discount: offer.discount })
      setIsOffersModalOpen(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
  }

  const handlePlaceOrder = () => {
    // TODO: Implement order placement
    alert('Order placed successfully!')
    clearCart()
    router.push('/orders')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="flex items-center gap-2 hover:bg-white/50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Checkout
              </h1>
            </div>
            
            {/* Order Status Progress */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-orange-600">Confirmed</span>
                </div>
                <div className="w-16 h-0.5 bg-orange-300"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-orange-600">Preparing</span>
                </div>
                <div className="w-16 h-0.5 bg-orange-300"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-orange-600">On the way</span>
                </div>
                <div className="w-16 h-0.5 bg-gray-300"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center">
                    <Circle className="w-5 h-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-500">Delivered</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left - Order & Restaurant */}
            <div className="space-y-6">
              {/* Restaurant Information */}
              {restaurantInfo && (
                <RestaurantHeader
                  name={restaurantInfo.name}
                  rating={restaurantInfo.rating}
                  deliveryTime={restaurantInfo.deliveryTime}
                  address={restaurantInfo.address}
                  logoUrl={restaurantLogo || undefined}
                />
              )}

              <CartItems items={cartItems} totalItems={totalItems} onChangeQuantity={handleQuantityChange} onRemove={(id) => removeFromCart(id)} />
            </div>

            {/* Right - Checkout Form */}
            <div className="space-y-6">
              <DeliveryForm phone={deliveryInfo.phone} address={deliveryInfo.address} onChange={(n) => setDeliveryInfo(n)} />

              <PromoOffers
                applied={appliedVoucher}
                offers={availableOffers}
                isModalOpen={isOffersModalOpen}
                onOpenModal={() => setIsOffersModalOpen(true)}
                onCloseModal={() => setIsOffersModalOpen(false)}
                onApply={handleApplyVoucher}
                onRemove={handleRemoveVoucher}
              />

              {/* Offers modal moved inside PromoOffers */}

              <PaymentSelector
                method={paymentMethod}
                isModalOpen={isPaymentModalOpen}
                onOpen={() => setIsPaymentModalOpen(true)}
                onClose={() => setIsPaymentModalOpen(false)}
                onChange={(m) => setPaymentMethod(m)}
              />

              <OrderSummary
                totalItems={totalItems}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                discount={appliedVoucher ? { code: appliedVoucher.code, amount: appliedVoucher.discount } : null}
                total={total}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
