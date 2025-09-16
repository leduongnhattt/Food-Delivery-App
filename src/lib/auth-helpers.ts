/**
 * Authentication helper functions for managing localStorage
 * Only stores access token, user data is fetched from server when needed
 */

const TOKEN_KEY = 'access_token';

export interface AuthUser {
    id: string;
    role: string;
    username?: string;
    email?: string;
}

/**
 * Set authentication token in localStorage
 */
export function setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
        // Dispatch custom event to notify auth state change
        window.dispatchEvent(new CustomEvent('authTokenChanged', { detail: { token } }));
    }
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
    }
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
    return getAuthToken() !== null;
}

/**
 * Get user profile from stored token (client-side)
 */
export function getCurrentUserFromToken(): AuthUser | null {
    const token = getAuthToken();
    if (!token) return null;

    try {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Check if token is expired
        if (payload.exp && payload.exp < Date.now() / 1000) {
            removeAuthToken();
            return null;
        }

        return {
            id: payload.accountId || payload.userId || '',
            role: payload.role,
            username: payload.username,
            email: payload.email
        };
    } catch (error) {
        console.error('Failed to decode token:', error);
        removeAuthToken();
        return null;
    }
}

/**
 * Get user profile from server using stored token (fallback)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    // First try to get user info from token
    const userFromToken = getCurrentUserFromToken();
    if (userFromToken) {
        return userFromToken;
    }

    // Fallback to API call if token decode fails
    const token = getAuthToken();
    if (!token) return null;

    try {
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            return {
                id: userData.id,
                role: userData.role,
                username: userData.username,
                email: userData.email
            };
        } else {
            // Token is invalid, remove it
            removeAuthToken();
            return null;
        }
    } catch (error) {
        console.error('Failed to get current user:', error);
        removeAuthToken();
        return null;
    }
}

/**
 * Logout user by removing token and calling logout API
 */
export async function logoutUser(): Promise<void> {
    const token = getAuthToken();

    try {
        // Call logout API if token exists
        if (token) {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
        // Always remove token from localStorage
        removeAuthToken();
    }
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
    removeAuthToken();
}

// Server-side authentication helpers
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export interface AuthResult {
    success: boolean;
    user?: {
        id: string;
        role: string;
        username?: string;
        email?: string;
    };
    error?: string;
}

/**
 * Get authenticated user from request (server-side)
 */
export function getAuthenticatedUser(request: NextRequest): AuthResult {
    try {
        // Get token from Authorization header or cookies
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '') ||
            request.cookies.get('refresh_token')?.value;

        if (!token) {
            return {
                success: false,
                error: 'No authentication token provided'
            };
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return {
                success: false,
                error: 'Invalid or expired token'
            };
        }

        return {
            success: true,
            user: {
                id: decoded.accountId || decoded.userId || '',
                role: decoded.role,
                username: decoded.username,
                email: decoded.email
            }
        };
    } catch (error) {
        return {
            success: false,
            error: 'Authentication failed'
        };
    }
}

/**
 * Require customer authentication
 */
export function requireCustomer(request: NextRequest): AuthResult {
    const authResult = getAuthenticatedUser(request);

    if (!authResult.success) {
        return authResult;
    }

    if (authResult.user?.role !== 'customer') {
        return {
            success: false,
            error: 'Customer access required'
        };
    }

    return authResult;
}

/**
 * Require admin authentication
 */
export function requireAdmin(request: NextRequest): AuthResult {
    const authResult = getAuthenticatedUser(request);

    if (!authResult.success) {
        return authResult;
    }

    if (authResult.user?.role !== 'admin') {
        return {
            success: false,
            error: 'Admin access required'
        };
    }

    return authResult;
}

/**
 * Require enterprise authentication
 */
export function requireEnterprise(request: NextRequest): AuthResult {
    const authResult = getAuthenticatedUser(request);

    if (!authResult.success) {
        return authResult;
    }

    if (authResult.user?.role !== 'enterprise') {
        return {
            success: false,
            error: 'Enterprise access required'
        };
    }

    return authResult;
}

/**
 * Create unauthorized response
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized') {
    return {
        success: false,
        error: message
    };
}