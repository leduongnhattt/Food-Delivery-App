import { apiClient } from './api'
import { Restaurant } from '@/types/models'
import { BaseService } from '@/lib/base-service'
import { buildQueryString, requestJson, createEmptyPaginatedResponse } from '@/lib/http-client'
import { createDebouncedApiCall } from '@/lib/debounce'

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

export class RestaurantService extends BaseService {
    constructor() {
        super('/api/restaurants')
    }

    // Get all restaurants with filters
    static async getRestaurants(filters: RestaurantFilters = {}): Promise<PaginatedResponse<Restaurant>> {
        try {
            const queryString = buildQueryString(filters)
            const url = `/api/restaurants${queryString ? `?${queryString}` : ''}`

            const response = await requestJson<{ restaurants: Restaurant[], pagination: any }>(url, {
                method: 'GET',
                cache: 'no-store'
            })

            return {
                restaurants: response.restaurants,
                pagination: response.pagination
            }
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
            const response = await requestJson<Restaurant>(`/api/restaurants/${id}`, {
                method: 'GET',
                cache: 'no-store'
            })
            return response
        } catch (error) {
            console.error('Error fetching restaurant:', error)
            throw error
        }
    }

    // Search restaurants
    static async searchRestaurants(params: RestaurantSearchParams): Promise<Restaurant[]> {
        try {
            const queryString = buildQueryString(params)
            const url = `/api/restaurants${queryString ? `?${queryString}` : ''}`

            const response = await requestJson<{ restaurants: Restaurant[] }>(url, {
                method: 'GET',
                cache: 'no-store'
            })

            return response.restaurants || []
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

    // Debounced version to prevent multiple calls
    static getRestaurantsDebounced = createDebouncedApiCall(
        RestaurantService.getRestaurants,
        200
    )
}
