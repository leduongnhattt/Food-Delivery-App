import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdmin, requireEnterprise, requireCustomer } from '@/lib/auth-helpers'

/**
 * Test endpoint for Postman - Basic authentication test
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = getAuthenticatedUser(request)

        if (!authResult.success) {
            return NextResponse.json({
                success: false,
                error: authResult.error,
                message: "Authentication failed",
                timestamp: new Date().toISOString()
            }, { status: 401 })
        }

        const user = authResult.user!

        return NextResponse.json({
            success: true,
            message: "Authentication successful!",
            user: {
                id: user.id,
                role: user.role,
                email: user.email,
                username: user.username
            },
            headers: {
                authorization: request.headers.get('authorization') ? 'Present' : 'Missing',
                userAgent: request.headers.get('user-agent'),
                host: request.headers.get('host')
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Test endpoint error:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}

/**
 * Test endpoint for Postman - Admin role test
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = requireAdmin(request)

        if (!authResult.success) {
            return NextResponse.json({
                success: false,
                error: authResult.error,
                message: "Admin access required",
                timestamp: new Date().toISOString()
            }, { status: 403 })
        }

        const user = authResult.user!

        return NextResponse.json({
            success: true,
            message: "Admin access granted!",
            user: {
                id: user.id,
                role: user.role
            },
            adminFeatures: [
                "User Management",
                "System Configuration",
                "Reports & Analytics",
                "Restaurant Management"
            ],
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Test admin endpoint error:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}

/**
 * Test endpoint for Postman - Enterprise role test
 */
export async function PUT(request: NextRequest) {
    try {
        const authResult = requireEnterprise(request)

        if (!authResult.success) {
            return NextResponse.json({
                success: false,
                error: authResult.error,
                message: "Enterprise access required",
                timestamp: new Date().toISOString()
            }, { status: 403 })
        }

        const user = authResult.user!

        return NextResponse.json({
            success: true,
            message: "Enterprise access granted!",
            user: {
                id: user.id,
                role: user.role
            },
            enterpriseFeatures: [
                "Menu Management",
                "Order Management",
                "Restaurant Analytics",
                "Customer Reviews"
            ],
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Test enterprise endpoint error:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}

/**
 * Test endpoint for Postman - Customer role test
 */
export async function PATCH(request: NextRequest) {
    try {
        const authResult = requireCustomer(request)

        if (!authResult.success) {
            return NextResponse.json({
                success: false,
                error: authResult.error,
                message: "Customer access required",
                timestamp: new Date().toISOString()
            }, { status: 403 })
        }

        const user = authResult.user!

        return NextResponse.json({
            success: true,
            message: "Customer access granted!",
            user: {
                id: user.id,
                role: user.role
            },
            customerFeatures: [
                "Browse Restaurants",
                "Place Orders",
                "Track Orders",
                "View Order History",
                "Manage Profile"
            ],
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Test customer endpoint error:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}

/**
 * Test endpoint for Postman - No authentication required
 */
export async function DELETE(request: NextRequest) {
    return NextResponse.json({
        success: true,
        message: "Public endpoint - No authentication required!",
        info: {
            method: "DELETE",
            endpoint: "/api/test",
            description: "This endpoint is public and doesn't require authentication"
        },
        timestamp: new Date().toISOString()
    })
}

