'use client'
import React from 'react'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { MenuItem } from '@/types/models'
import { useCart } from '@/hooks/use-cart'
import { useRestaurantDetail, useRestaurantCategoryNav } from '@/hooks/use-restaurant-detail'
import EnterpriseHero from '@/components/restaurant/EnterpriseHero'
import ReviewsSection, { Review } from '@/components/restaurant/ReviewsSection'
import CategoryPills from '@/components/restaurant/CategoryPills'
import RestaurantMenuSection from '@/components/restaurant/RestaurantMenuSection'
import { buildHeaders } from '@/lib/http-client'


interface RestaurantPageProps {
  params: Promise<{
    id: string
  }>
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const { addToCart } = useCart()

  // Unwrap params using React.use()
  const { id } = React.use(params)

  const { restaurant, items: menuItems, loading } = useRestaurantDetail(id)
  const { activeCategory, categoryRefs, categories: catList, handleSelectCategory } = useRestaurantCategoryNav(menuItems)

  // Reviews state
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = React.useState(true)
  const [averageRating, setAverageRating] = React.useState(0)
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest'>('newest')

  // Fetch reviews from API
  const fetchReviews = React.useCallback(async (sort: 'newest' | 'oldest' = 'newest') => {
    if (!id) return

    setReviewsLoading(true)
    try {
      const url = `/api/restaurants/${id}/reviews?sort=${sort}&limit=50`
      console.log('[Client] Fetching reviews from:', url)
      
      const response = await fetch(url, {
        headers: buildHeaders(),
        credentials: 'include'
      })

      console.log('[Client] Response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          console.error('[Client] Failed to parse error response:', parseError)
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        const errorMessage = errorData.error || `Failed to fetch reviews (${response.status})`
        console.error('[Client] Failed to fetch reviews:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          errorData
        })
        
        // Don't throw, just set empty state to allow page to render
        setReviews([])
        setAverageRating(0)
        return
      }

      const data = await response.json()
      console.log('[Client] Reviews data received:', {
        reviewsCount: data.reviews?.length || 0,
        averageRating: data.averageRating,
        totalReviews: data.totalReviews
      })
      
      setReviews(data.reviews || [])
      setAverageRating(data.averageRating || 0)
    } catch (error) {
      console.error('[Client] Error fetching reviews:', error)
      if (error instanceof Error) {
        console.error('[Client] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
      }
      // Don't throw, just set empty state to allow page to render
      setReviews([])
      setAverageRating(0)
    } finally {
      setReviewsLoading(false)
    }
  }, [id])

  // Handle sort change
  const handleSortChange = React.useCallback((sort: 'newest' | 'oldest') => {
    setSortBy(sort)
    fetchReviews(sort)
  }, [fetchReviews])

  // Fetch reviews on mount and when restaurant ID changes
  React.useEffect(() => {
    if (id) {
      fetchReviews()
    }
  }, [id, fetchReviews])

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

  const categories = catList

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
    )
  }

  // Use average rating from reviews API if available, otherwise fallback to restaurant rating
  const displayRating = reviews.length > 0 ? averageRating : restaurant.rating

  return (
    <div className="min-h-screen bg-gray-50">
      
      <EnterpriseHero 
        name={restaurant!.name}
        description={restaurant!.description}
        avatarUrl={restaurant!.avatarUrl}
        rating={displayRating}
        isOpen={restaurant!.isOpen}
        phone={restaurant!.phone}
        address={restaurant!.address}
        deliveryTime={restaurant!.deliveryTime}
        openHours={restaurant!.openHours}
        closeHours={restaurant!.closeHours}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">

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

        {reviewsLoading ? (
          <div className="mt-14 flex items-center justify-center py-12">
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : (
          <ReviewsSection 
            enterpriseId={id}
            rating={displayRating}
            reviews={reviews}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onReviewsUpdate={() => fetchReviews(sortBy)}
          />
        )}
      </div>
    </div>
  )
}
