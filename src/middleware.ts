import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Define route patterns and their required roles
const ROUTE_PERMISSIONS = {
    // Admin routes - only admin can access
    '/admin': ['admin'],
    '/api/admin': ['admin'],

    // Enterprise routes - only enterprise can access
    '/enterprise': ['enterprise'],
    '/api/enterprise': ['enterprise'],

    // Customer routes - only customer can access
    '/orders': ['customer'],
    '/api/orders': ['customer'],
    '/profile': ['customer'],
    '/api/auth/profile': ['customer'],
    '/api/orders/track': ['customer'],

    // Public routes - no authentication required
    '/': [],
    '/signin': [],
    '/signup': [],
    '/restaurants': [],
    '/api/auth/login': [],
    '/api/auth/register': [],
    '/api/auth/refresh': [],
    '/api/restaurants': [],
    '/api/categories': [],
    '/api/menu-items': [],
    '/api/test': [], // Test endpoint - public for testing
    // Cart APIs are public (guest supported)
    '/api/cart': [],
    '/api/cart/items': [],
}

// Get user role from token
function getUserRole(token: string): string | null {
    try {
        const decoded = verifyToken(token)
        return decoded?.role || null
    } catch {
        return null
    }
}

// Check if user has required role
function hasRequiredRole(userRole: string | null, requiredRoles: string[]): boolean {
    if (requiredRoles.length === 0) return true // Public route
    if (!userRole) return false
    return requiredRoles.includes(userRole)
}

// Get the most specific route match
function getRoutePermissions(pathname: string): string[] {
    // Check for exact matches first
    if (ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]) {
        return ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]
    }

    // Check for prefix matches
    for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
        if (pathname.startsWith(route)) {
            return roles
        }
    }

    // Default: require authentication for unknown routes
    return ['customer', 'admin', 'enterprise']
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for static files and API routes that don't need auth
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/public') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // Check if user is trying to access auth pages while already authenticated
    if (pathname === '/signin' || pathname === '/signup') {
        // Only check refresh_token cookie, not localStorage token
        const refreshToken = request.cookies.get('refresh_token')?.value
        if (refreshToken) {
            try {
                const decoded = verifyToken(refreshToken)
                if (decoded) {
                    // User is already authenticated, redirect to home
                    return NextResponse.redirect(new URL('/', request.url))
                }
            } catch (error) {
                // Token is invalid, clear the cookie and allow access to auth pages
                const response = NextResponse.next()
                response.cookies.delete('refresh_token')
                return response
            }
        }
        return NextResponse.next()
    }

    // Get required roles for this route
    const requiredRoles = getRoutePermissions(pathname)

    // If no roles required, allow access
    if (requiredRoles.length === 0) {
        const res = NextResponse.next()
        // Ensure guest_token for public routes (guest cart)
        const hasGuest = request.cookies.get('guest_token')?.value
        if (!hasGuest) {
            const token = crypto.randomUUID()
            res.cookies.set('guest_token', token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 24, // 1 day
            })
        }
        return res
    }

    // Get token from Authorization header or refresh_token cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('refresh_token')?.value

    if (!token) {
        // For API routes, return 401
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // For page routes, redirect to appropriate login page
        if (pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        } else if (pathname.startsWith('/enterprise')) {
            return NextResponse.redirect(new URL('/enterprise/login', request.url))
        } else {
            return NextResponse.redirect(new URL('/signin', request.url))
        }
    }

    // Verify token and get user role
    const userRole = getUserRole(token)

    if (!userRole) {
        // Clear invalid token cookie
        const response = pathname.startsWith('/api/')
            ? NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
            : pathname.startsWith('/admin')
                ? NextResponse.redirect(new URL('/admin/login', request.url))
                : pathname.startsWith('/enterprise')
                    ? NextResponse.redirect(new URL('/enterprise/login', request.url))
                    : NextResponse.redirect(new URL('/signin', request.url))

        response.cookies.delete('refresh_token')
        return response
    }

    // Check if user has required role
    if (!hasRequiredRole(userRole, requiredRoles)) {
        // User doesn't have required role
        return NextResponse.json(
            { error: 'Access denied. Insufficient permissions.' },
            { status: 403 }
        )
    }

    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-role', userRole)

    // Get user ID from token
    const decoded = verifyToken(token)
    if (decoded) {
        response.headers.set('x-user-id', decoded.accountId || decoded.userId || '')
    }

    // Ensure guest_token also for authenticated traffic (to support pre-login cart merge)
    const hasGuest = request.cookies.get('guest_token')?.value
    if (!hasGuest) {
        const token = crypto.randomUUID()
        response.cookies.set('guest_token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24,
        })
    }
    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
    ],
}
