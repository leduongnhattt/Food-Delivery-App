import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
            include: {
                menuItems: {
                    where: { isAvailable: true },
                    orderBy: { category: 'asc' }
                },
                _count: {
                    select: {
                        menuItems: true,
                        orders: true
                    }
                }
            }
        })

        if (!restaurant) {
            return NextResponse.json(
                { error: 'Restaurant not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(restaurant)
    } catch (error) {
        console.error('Error fetching restaurant:', error)
        return NextResponse.json(
            { error: 'Failed to fetch restaurant' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await request.json()
        const {
            name,
            description,
            address,
            phone,
            image,
            rating,
            deliveryTime,
            minimumOrder,
            isOpen
        } = body

        const restaurant = await prisma.restaurant.update({
            where: { id },
            data: {
                name,
                description,
                address,
                phone,
                image,
                rating,
                deliveryTime,
                minimumOrder,
                isOpen,
            }
        })

        return NextResponse.json(restaurant)
    } catch (error) {
        console.error('Error updating restaurant:', error)
        return NextResponse.json(
            { error: 'Failed to update restaurant' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        await prisma.restaurant.delete({
            where: { id }
        })

        return NextResponse.json(
            { message: 'Restaurant deleted successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error deleting restaurant:', error)
        return NextResponse.json(
            { error: 'Failed to delete restaurant' },
            { status: 500 }
        )
    }
}
