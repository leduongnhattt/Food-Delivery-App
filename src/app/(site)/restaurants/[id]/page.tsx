'use client'
import React from 'react'
import { notFound, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Restaurant, MenuItem } from '@/types/models'
import { useCart } from '@/hooks/use-cart'
import { useRestaurantDetail, useRestaurantCategoryNav } from '@/hooks/use-restaurant-detail'
import { ShoppingCart } from 'lucide-react'
import { RestaurantService } from '@/services/restaurant.service'
import { FoodService } from '@/services/food.service'
import EnterpriseHero from '@/components/restaurant/EnterpriseHero'
import EnterpriseInfoCard from '@/components/restaurant/EnterpriseInfoCard'
import CategoryPills from '@/components/restaurant/CategoryPills'
import RestaurantMenuSection from '@/components/restaurant/RestaurantMenuSection'


interface RestaurantPageProps {
  params: Promise<{
    id: string
  }>
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const router = useRouter()
  const { addToCart, cartItems, getTotalItems, getTotalAmount, openCart, isOpen } = useCart()

  // Unwrap params using React.use()
  const { id } = React.use(params)

  const { restaurant, items: menuItems, loading, error } = useRestaurantDetail(id)
  const { activeCategory, categoryRefs, categories: catList, handleSelectCategory, getCount } = useRestaurantCategoryNav(menuItems)

  if (!loading && !restaurant) {
    notFound()
  }

  const handleAddToCart = (menuItem: MenuItem) => {
    const enriched: MenuItem = {
      ...menuItem,
      restaurantName: menuItem.restaurantName || restaurant!.name,
      restaurantId: menuItem.restaurantId || restaurant!.id,
    }
    addToCart(enriched, 1)
  }

  const handleViewCart = () => {
    openCart()
  }

  const categories = catList
  const cartItemCount = getTotalItems()
  const cartTotal = getTotalAmount()

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnterpriseHero 
        name={restaurant!.name}
        description={restaurant!.description}
        avatarUrl={restaurant!.avatarUrl}
        rating={restaurant!.rating}
        isOpen={restaurant!.isOpen}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <EnterpriseInfoCard 
          isOpen={restaurant!.isOpen}
          rating={restaurant!.rating}
          phone={restaurant!.phone}
          address={restaurant!.address}
          deliveryTime={restaurant!.deliveryTime}
          description={restaurant!.description}
        />

        {/* Menu Section */}
        <div className="mb-8">
          <CategoryPills 
            categories={categories}
            active={activeCategory}
            getCount={(c) => menuItems.filter(i => i.category === c).length}
            onSelect={handleSelectCategory}
          />

          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 mt-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Menu</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {menuItems.length} items
              </Badge>
            </div>
          </div>

          {categories.map((category) => (
            <RestaurantMenuSection
              key={category}
              category={category}
              items={menuItems.filter(item => item.category === category)}
              onAddToCart={handleAddToCart}
              registerRef={(el) => { categoryRefs.current[category] = el }}
            />
          ))}
        </div>
      </div>

      {/* Floating Cart Button (hidden when cart sidebar is open) */}
      {cartItemCount > 0 && !isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="lg" 
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-orange-500 hover:bg-orange-600"
            onClick={handleViewCart}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">View Cart ({cartItemCount})</span>
              <span className="text-xs opacity-90">{formatPrice(cartTotal)}</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  )
}
