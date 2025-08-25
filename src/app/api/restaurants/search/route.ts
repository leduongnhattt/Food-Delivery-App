import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')
        const category = searchParams.get('category')
        const isOpen = searchParams.get('isOpen')
        const minRating = searchParams.get('minRating')
        const maxPrice = searchParams.get('maxPrice')

        const where: any = {}

        // Search by restaurant name or description
        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
            ]
        }

        // Filter by category
        if (category) {
            where.menuItems = {
                some: {
                    category: category
                }
            }
        }

        // Filter by open status
        if (isOpen !== null) {
            where.isOpen = isOpen === 'true'
        }

        // Filter by minimum rating
        if (minRating) {
            where.rating = {
                gte: parseFloat(minRating)
            }
        }

        // Filter by maximum price
        if (maxPrice) {
            where.menuItems = {
                ...where.menuItems,
                some: {
                    ...where.menuItems?.some,
                    price: {
                        lte: parseInt(maxPrice)
                    }
                }
            }
        }

        const restaurants = await prisma.restaurant.findMany({
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
            }
        })

        return NextResponse.json(restaurants)
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json(
            { error: 'Search failed' },
            { status: 500 }
        )
    }
}
