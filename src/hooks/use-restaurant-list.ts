import { useState, useEffect } from 'react'
import { RestaurantService, RestaurantFilters } from '@/services/restaurant.service'
import { Restaurant } from '@/types/models'

interface UseRestaurantsReturn {
    restaurants: Restaurant[]
    loading: boolean
    error: string | null
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
    refetch: () => Promise<void>
}

export function useRestaurantList(filters: RestaurantFilters = {}): UseRestaurantsReturn {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })

    const fetchRestaurants = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await RestaurantService.getRestaurantsDebounced(filters)

            setRestaurants(response.restaurants)
            setPagination(response.pagination)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurants'
            setError(errorMessage)
            console.error('Error in useRestaurantList:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRestaurants()
    }, [filters.page, filters.limit, filters.search, filters.category, filters.isOpen, filters.minRating])

    return {
        restaurants,
        loading,
        error,
        pagination,
        refetch: fetchRestaurants,
    }
}


