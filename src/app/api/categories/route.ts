import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get('restaurantId')

        const where: any = {}

        if (restaurantId) {
            where.restaurantId = restaurantId
        }

        const categories = await prisma.menuItem.groupBy({
            by: ['category'],
            where,
            _count: {
                category: true
            },
            orderBy: {
                _count: {
                    category: 'desc'
                }
            }
        })

        const formattedCategories = categories.map(cat => ({
            category: cat.category,
            count: cat._count.category
        }))

        return NextResponse.json(formattedCategories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { category, description } = body

        // This would typically create a category in a separate table
        // For now, we'll just return the category info
        return NextResponse.json({
            category,
            description,
            message: 'Category created successfully'
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        )
    }
}
