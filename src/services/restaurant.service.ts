import { apiClient } from './api'
import { Restaurant } from '@/types/models'

export interface RestaurantFilters {
    search?: string
    category?: string
    isOpen?: boolean
    minRating?: number
    page?: number
    limit?: number
}

interface RestaurantSearchParams {
    q?: string
    category?: string
    isOpen?: string
    minRating?: string
    maxPrice?: string
}

interface PaginatedResponse<T> {
    restaurants: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export class RestaurantService {
    // Get all restaurants with filters
    static async getRestaurants(filters: RestaurantFilters = {}): Promise<PaginatedResponse<Restaurant>> {
        try {
            const params = new URLSearchParams()

            if (filters.page) {
                params.append('page', filters.page.toString())
            }
            if (filters.limit) {
                params.append('limit', filters.limit.toString())
            }
            if (filters.search) {
                params.append('search', filters.search)
            }
            if (filters.category) {
                params.append('category', filters.category)
            }
            if (filters.isOpen !== undefined) {
                params.append('isOpen', filters.isOpen.toString())
            }
            if (filters.minRating) {
                params.append('minRating', filters.minRating.toString())
            }

            const queryString = params.toString()
            const url = `/api/restaurants${queryString ? `?${queryString}` : ''}`

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
            console.error('Error fetching restaurants:', error)
            return {
                restaurants: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0
                }
            }
        }
    }

    // Get restaurant by ID
    static async getRestaurantById(id: string): Promise<Restaurant> {
        try {
            const response = await fetch(`/api/restaurants/${id}`, {
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
            console.error('Error fetching restaurant:', error)
            throw error
        }
    }

    // Search restaurants
    static async searchRestaurants(params: RestaurantSearchParams): Promise<Restaurant[]> {
        try {
            const searchParams = new URLSearchParams()

            if (params.q) {
                searchParams.append('search', params.q)
            }
            if (params.category) {
                searchParams.append('category', params.category)
            }
            if (params.isOpen) {
                searchParams.append('isOpen', params.isOpen)
            }
            if (params.minRating) {
                searchParams.append('minRating', params.minRating)
            }

            const queryString = searchParams.toString()
            const url = `/api/restaurants${queryString ? `?${queryString}` : ''}`

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
            return data.restaurants || []
        } catch (error) {
            console.error('Error searching restaurants:', error)
            return []
        }
    }

    // Create new restaurant (admin only)
    static async createRestaurant(data: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Restaurant> {
        return apiClient.post<Restaurant>('/restaurants', data)
    }

    // Update restaurant (admin only)
    static async updateRestaurant(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
        return apiClient.put<Restaurant>(`/restaurants/${id}`, data)
    }

    // Delete restaurant (admin only)
    static async deleteRestaurant(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/restaurants/${id}`)
    }

    // Get restaurant categories
    static async getCategories(restaurantId?: string): Promise<Array<{ category: string; count: number }>> {
        const params = restaurantId ? { restaurantId } : undefined
        return apiClient.get<Array<{ category: string; count: number }>>('/categories', params)
    }

    // Get popular restaurants
    static async getPopularRestaurants(limit: number = 6): Promise<Restaurant[]> {
        return apiClient.get<Restaurant[]>('/restaurants', { limit, minRating: 4.0 })
    }

    // Get nearby restaurants (mock implementation)
    static async getNearbyRestaurants(lat: number, lng: number, radius: number = 5): Promise<Restaurant[]> {
        // In a real app, you'd use actual geolocation API
        return apiClient.get<Restaurant[]>('/restaurants', { limit: 10 })
    }
}
