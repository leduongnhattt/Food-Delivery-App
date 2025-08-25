import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get('restaurantId')
        const category = searchParams.get('category')
        const search = searchParams.get('search')
        const isAvailable = searchParams.get('isAvailable')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        const where: any = {}

        if (restaurantId) {
            where.restaurantId = restaurantId
        }

        if (category) {
            where.category = category
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (isAvailable !== null) {
            where.isAvailable = isAvailable === 'true'
        }

        const skip = (page - 1) * limit

        const [menuItems, total] = await Promise.all([
            prisma.menuItem.findMany({
                where,
                include: {
                    restaurant: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        }
                    }
                },
                orderBy: {
                    category: 'asc',
                    name: 'asc'
                },
                skip,
                take: limit,
            }),
            prisma.menuItem.count({ where })
        ])

        return NextResponse.json({
            menuItems,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        })
    } catch (error) {
        console.error('Error fetching menu items:', error)
        return NextResponse.json(
            { error: 'Failed to fetch menu items' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            name,
            description,
            price,
            image,
            category,
            isAvailable = true,
            restaurantId
        } = body

        if (!name || !description || !price || !category || !restaurantId) {
            return NextResponse.json(
                { error: 'Name, description, price, category, and restaurantId are required' },
                { status: 400 }
            )
        }

        // Verify restaurant exists
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId }
        })

        if (!restaurant) {
            return NextResponse.json(
                { error: 'Restaurant not found' },
                { status: 404 }
            )
        }

        const menuItem = await prisma.menuItem.create({
            data: {
                name,
                description,
                price: parseInt(price),
                image: image || '',
                category,
                isAvailable,
                restaurantId,
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

        return NextResponse.json(menuItem, { status: 201 })
    } catch (error) {
        console.error('Error creating menu item:', error)
        return NextResponse.json(
            { error: 'Failed to create menu item' },
            { status: 500 }
        )
    }
}
