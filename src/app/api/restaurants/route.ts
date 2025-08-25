import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search')
        const category = searchParams.get('category')
        const isOpen = searchParams.get('isOpen')
        const minRating = searchParams.get('minRating')

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (category) {
            where.menuItems = {
                some: {
                    category: category
                }
            }
        }

        if (isOpen !== null) {
            where.isOpen = isOpen === 'true'
        }

        if (minRating) {
            where.rating = {
                gte: parseFloat(minRating)
            }
        }

        const skip = (page - 1) * limit

        const [restaurants, total] = await Promise.all([
            prisma.restaurant.findMany({
                where,
                include: {
                    menuItems: {
                        where: { isAvailable: true },
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            category: true,
                        }
                    },
                    _count: {
                        select: {
                            menuItems: true,
                        }
                    }
                },
                orderBy: {
                    rating: 'desc'
                },
                skip,
                take: limit,
            }),
            prisma.restaurant.count({ where })
        ])

        return NextResponse.json({
            restaurants,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        })
    } catch (error) {
        console.error('Error fetching restaurants:', error)
        return NextResponse.json(
            { error: 'Failed to fetch restaurants' },
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
            address,
            phone,
            image,
            rating,
            deliveryTime,
            minimumOrder,
            isOpen = true
        } = body

        if (!name || !description || !address || !phone) {
            return NextResponse.json(
                { error: 'Name, description, address, and phone are required' },
                { status: 400 }
            )
        }

        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                description,
                address,
                phone,
                image: image || '',
                rating: rating || 0,
                deliveryTime: deliveryTime || '30-45 min',
                minimumOrder: minimumOrder || 0,
                isOpen,
            }
        })

        return NextResponse.json(restaurant, { status: 201 })
    } catch (error) {
        console.error('Error creating restaurant:', error)
        return NextResponse.json(
            { error: 'Failed to create restaurant' },
            { status: 500 }
        )
    }
}
