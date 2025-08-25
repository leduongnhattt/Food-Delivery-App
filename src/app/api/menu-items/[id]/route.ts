import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        const menuItem = await prisma.menuItem.findUnique({
            where: { id },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        phone: true,
                        rating: true,
                        deliveryTime: true,
                        minimumOrder: true,
                        isOpen: true,
                    }
                }
            }
        })

        if (!menuItem) {
            return NextResponse.json(
                { error: 'Menu item not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(menuItem)
    } catch (error) {
        console.error('Error fetching menu item:', error)
        return NextResponse.json(
            { error: 'Failed to fetch menu item' },
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
            price,
            image,
            category,
            isAvailable
        } = body

        const menuItem = await prisma.menuItem.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseInt(price) : undefined,
                image,
                category,
                isAvailable,
            },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    }
                }
            }
        })

        return NextResponse.json(menuItem)
    } catch (error) {
        console.error('Error updating menu item:', error)
        return NextResponse.json(
            { error: 'Failed to update menu item' },
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

        await prisma.menuItem.delete({
            where: { id }
        })

        return NextResponse.json(
            { message: 'Menu item deleted successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error deleting menu item:', error)
        return NextResponse.json(
            { error: 'Failed to delete menu item' },
            { status: 500 }
        )
    }
}
