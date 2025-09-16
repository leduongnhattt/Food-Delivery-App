import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

const ORDER_STATUS = {
    Pending: 'Pending',
    Completed: 'Completed',
    Canceled: 'Canceled',
} as const

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
                OrderID: orderId,
                customer: { AccountID: decoded.userId || decoded.accountId }
            },
            include: {
                orderDetails: {
                    include: {
                        food: true,
                    },
                },
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
        const orderTime = new Date(order.OrderDate)

        switch (order.Status) {
            case ORDER_STATUS.Pending:
                estimatedDeliveryTime = new Date(orderTime.getTime() + 45 * 60000) // +45 minutes
                break
            case ORDER_STATUS.Completed:
                estimatedDeliveryTime = order.EstimatedDeliveryTime
                break
            case ORDER_STATUS.Canceled:
                estimatedDeliveryTime = null
                break
            default:
                estimatedDeliveryTime = null
        }

        return NextResponse.json({
            order,
            estimatedDeliveryTime,
            currentStatus: order.Status,
            orderTime: order.OrderDate,
            lastUpdated: order.EstimatedDeliveryTime
        })
    } catch (error) {
        console.error('Order tracking error:', error)
        return NextResponse.json(
            { error: 'Failed to track order' },
            { status: 500 }
        )
    }
}
