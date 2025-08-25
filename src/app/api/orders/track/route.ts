import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            )
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const orderId = searchParams.get('orderId')

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            )
        }

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: decoded.userId
            },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        phone: true,
                    }
                }
            }
        })

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            )
        }

        // Calculate estimated delivery time based on order status
        let estimatedDeliveryTime = null
        const orderTime = new Date(order.createdAt)

        switch (order.status) {
            case 'pending':
                estimatedDeliveryTime = new Date(orderTime.getTime() + 45 * 60000) // +45 minutes
                break
            case 'confirmed':
                estimatedDeliveryTime = new Date(orderTime.getTime() + 40 * 60000) // +40 minutes
                break
            case 'preparing':
                estimatedDeliveryTime = new Date(orderTime.getTime() + 30 * 60000) // +30 minutes
                break
            case 'out_for_delivery':
                estimatedDeliveryTime = new Date(orderTime.getTime() + 15 * 60000) // +15 minutes
                break
            case 'delivered':
                estimatedDeliveryTime = order.updatedAt
                break
            default:
                estimatedDeliveryTime = null
        }

        return NextResponse.json({
            order,
            estimatedDeliveryTime,
            currentStatus: order.status,
            orderTime: order.createdAt,
            lastUpdated: order.updatedAt
        })
    } catch (error) {
        console.error('Order tracking error:', error)
        return NextResponse.json(
            { error: 'Failed to track order' },
            { status: 500 }
        )
    }
}
