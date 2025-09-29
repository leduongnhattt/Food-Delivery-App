"use client"

import { useOrders } from '@/hooks/use-orders'
import { OrderCard } from '@/components/orders/order-card'
import { OrderFilters } from '@/components/orders/order-filters'
import { OrderFilters as OrderFiltersType } from '@/services/order.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  RefreshCw, 
  AlertCircle, 
  ShoppingBag,
  Clock,
  CheckCircle
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrdersPage() {
  const router = useRouter()
  const { orders, loading, error, total, hasMore, loadMore, refreshOrders, filterOrders } = useOrders()
  const [filters, setFilters] = useState<OrderFiltersType>({})

  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const handleReorder = (orderId: string) => {
    // TODO: Implement reorder logic
  }

  const handleTrack = (orderId: string) => {
    router.push(`/orders/${orderId}/track`)
  }

  const handleCancel = (orderId: string) => {
    // TODO: Implement cancel logic
  }

  const handleFilterChange = (newFilters: OrderFiltersType) => {
    setFilters(newFilters)
    filterOrders(newFilters)
  }

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    }
    return stats
  }

  const stats = getOrderStats()

  // Handle authentication errors
  if (error && error.includes('sign in')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-4">
              <Button onClick={() => router.push('/signin')} className="bg-orange-600 hover:bg-orange-700">
                Sign In
              </Button>
              <Button onClick={() => router.push('/')} variant="outline">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={refreshOrders} className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">
                Track your order history and current orders
              </p>
            </div>
            <Button
              onClick={refreshOrders}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.delivered}</p>
                <p className="text-xs text-gray-600">Delivered</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.cancelled}</p>
                <p className="text-xs text-gray-600">Cancelled</p>
              </div>
            </div>
          </div>
        </div>


        {/* Filters */}
        <OrderFilters
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />

        {/* Orders List */}
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">
              {Object.keys(filters).length > 0 
                ? "No orders match your current filters. Try adjusting your search criteria."
                : "You haven't placed any orders yet. Start by exploring our restaurants!"
              }
            </p>
            {Object.keys(filters).length > 0 ? (
              <Button onClick={() => handleFilterChange({})} variant="outline">
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => router.push('/restaurants')}>
                Browse Restaurants
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
                onReorder={handleReorder}
                onTrack={handleTrack}
                onCancel={handleCancel}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                  className="px-8 py-3"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load More Orders'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
    </div>
  )
}
