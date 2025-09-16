import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const enterpriseId = searchParams.get('enterpriseId')

        // Get all food categories
        const categories = await prisma.foodCategory.findMany({
            select: {
                CategoryID: true,
                CategoryName: true,
                Description: true,
                _count: {
                    select: {
                        foods: {
                            where: {
                                IsAvailable: true,
                                // Filter by enterprise if provided
                                ...(enterpriseId && {
                                    menuFoods: {
                                        some: {
                                            menu: {
                                                EnterpriseID: enterpriseId
                                            }
                                        }
                                    }
                                })
                            }
                        }
                    }
                }
            },
            orderBy: {
                CategoryName: 'asc'
            }
        })

        const formattedCategories = categories.map(cat => ({
            id: cat.CategoryID,
            name: cat.CategoryName,
            description: cat.Description,
            foodCount: cat._count.foods
        }))

        return NextResponse.json({
            categories: formattedCategories,
            total: categories.length
        })
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
        // Require admin authentication (only admin can create categories)
        const authResult = requireAdmin(request)
        if (!authResult.success) {
            return NextResponse.json(
                { error: authResult.error },
                { status: 401 }
            )
        }

        const user = authResult.user!
        const body = await request.json()
        const { categoryName, description } = body

        // Validate required fields
        if (!categoryName) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            )
        }

        // Get admin ID from user account
        const admin = await prisma.admin.findUnique({
            where: { AccountID: user.id },
            select: { AdminID: true }
        })

        if (!admin) {
            return NextResponse.json(
                { error: 'Admin profile not found' },
                { status: 404 }
            )
        }

        // Check if category already exists
        const existingCategory = await prisma.foodCategory.findFirst({
            where: { CategoryName: categoryName }
        })

        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 409 }
            )
        }

        // Create new category
        const newCategory = await prisma.foodCategory.create({
            data: {
                CategoryName: categoryName,
                Description: description || null,
                AdminID: admin.AdminID
            },
            select: {
                CategoryID: true,
                CategoryName: true,
                Description: true,
                CreatedAt: true
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Category created successfully',
            category: newCategory
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        )
    }
}
