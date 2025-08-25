import { apiClient } from './api'
import { User } from '@/types'

interface LoginCredentials {
    email: string
    password: string
}

interface RegisterData {
    email: string
    password: string
    name: string
    phone?: string
    address?: string
}

interface AuthResponse {
    user: User
    token: string
}

interface UpdateProfileData {
    name?: string
    phone?: string
    address?: string
}

export class AuthService {
    // User registration
    static async register(data: RegisterData): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>('/auth/register', data)
    }

    // User login
    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>('/auth/login', credentials)
    }

    // Get user profile
    static async getProfile(): Promise<User> {
        return apiClient.get<User>('/auth/profile')
    }

    // Update user profile
    static async updateProfile(data: UpdateProfileData): Promise<User> {
        return apiClient.put<User>('/auth/profile', data)
    }

    // Logout (client-side)
    static logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // Redirect to login page or home
            window.location.href = '/'
        }
    }

    // Check if user is authenticated
    static isAuthenticated(): boolean {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('token')
        }
        return false
    }

    // Get current user from localStorage
    static getCurrentUser(): User | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user')
            return userStr ? JSON.parse(userStr) : null
        }
        return null
    }

    // Set auth data in localStorage
    static setAuthData(user: User, token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
        }
    }
}
