import { Food } from '@/types/models'

export interface PopularFoodsResponse {
    foods: Food[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface FoodServiceFilters {
    limit?: number
    page?: number
    restaurantId?: string
    category?: string
    search?: string
    isAvailable?: boolean
}

export class FoodService {
    private static baseUrl = '/api/foods'

    /**
     * Fetch popular foods from the database
     */
    static async getPopularFoods(filters: FoodServiceFilters = {}): Promise<PopularFoodsResponse> {
        const params = new URLSearchParams()

        if (filters.limit) {
            params.append('limit', filters.limit.toString())
        }

        if (filters.page) {
            params.append('page', filters.page.toString())
        }

        if (filters.restaurantId) {
            params.append('restaurantId', filters.restaurantId)
        }

        if (filters.category) {
            params.append('category', filters.category)
        }

        if (filters.search) {
            params.append('search', filters.search)
        }

        if (filters.isAvailable !== undefined) {
            params.append('isAvailable', filters.isAvailable.toString())
        }

        const queryString = params.toString()
        const url = `${this.baseUrl}/popular${queryString ? `?${queryString}` : ''}`

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store', // Always fetch fresh data
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Error fetching popular foods:', error)
            // Return empty array as fallback
            return {
                foods: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0
                }
            }
        }
    }

    /**
     * Fetch all foods with filters
     */
    static async getAllFoods(filters: FoodServiceFilters = {}): Promise<PopularFoodsResponse> {
        const params = new URLSearchParams()

        if (filters.limit) {
            params.append('limit', filters.limit.toString())
        }

        if (filters.page) {
            params.append('page', filters.page.toString())
        }

        if (filters.restaurantId) {
            params.append('restaurantId', filters.restaurantId)
        }

        if (filters.category) {
            params.append('category', filters.category)
        }

        if (filters.search) {
            params.append('search', filters.search)
        }

        if (filters.isAvailable !== undefined) {
            params.append('isAvailable', filters.isAvailable.toString())
        }

        const queryString = params.toString()
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Error fetching foods:', error)
            return {
                foods: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0
                }
            }
        }
    }

    /**
     * Fetch foods by restaurant ID
     */
    static async getFoodsByRestaurant(restaurantId: string, limit?: number): Promise<PopularFoodsResponse> {
        return this.getPopularFoods({ restaurantId, limit })
    }

    /**
     * Fetch foods by category
     */
    static async getFoodsByCategory(category: string, limit?: number): Promise<PopularFoodsResponse> {
        return this.getPopularFoods({ category, limit })
    }
}
