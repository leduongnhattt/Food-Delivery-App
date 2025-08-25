// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

interface ApiResponse<T = any> {
    data?: T
    error?: string
    message?: string
}

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message)
        this.name = 'ApiError'
    }
}

// Base API client
class ApiClient {
    private baseURL: string

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`
        
        // Get token from localStorage for authenticated requests
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        }

        try {
            const response = await fetch(url, config)
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new ApiError(
                    response.status,
                    errorData.error || `HTTP error! status: ${response.status}`
                )
            }

            return await response.json()
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }
            throw new ApiError(500, 'Network error occurred')
        }
    }

    // GET request
    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
        return this.request<T>(url, { method: 'GET' })
    }

    // POST request
    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    // PUT request
    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    // DELETE request
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' })
    }

    // PATCH request
    async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        })
    }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export types
export type { ApiResponse, ApiError }
