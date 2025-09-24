import { useState, useEffect } from 'react'
import { Food } from '@/types/models'
import { FoodService, FoodServiceFilters } from '@/services/food.service'

interface UsePopularFoodsReturn {
    foods: Food[]
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

export function usePopularFoods(filters: FoodServiceFilters = {}): UsePopularFoodsReturn {
    const [foods, setFoods] = useState<Food[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })

    const fetchFoods = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await FoodService.getPopularFoods(filters)
            setFoods(response.foods)
            setPagination(response.pagination)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch foods'
            setError(errorMessage)
            console.error('Error in usePopularFoods:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFoods()
    }, [filters.limit, filters.page, filters.restaurantId, filters.category, filters.search, filters.isAvailable])

    return {
        foods,
        loading,
        error,
        pagination,
        refetch: fetchFoods,
    }
}
