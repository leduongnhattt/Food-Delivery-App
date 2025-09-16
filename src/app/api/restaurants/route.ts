import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireEnterprise } from '@/lib/auth-helpers'

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
                { EnterpriseName: { contains: search, mode: 'insensitive' } },
                { Description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (category) {
            where.menus = {
                some: {
                    menuFoods: {
                        some: {
                            food: {
                                foodCategory: {
                                    CategoryName: category
                                }
                            }
                        }
                    }
                }
            }
        }

        if (isOpen !== null) {
            where.IsActive = isOpen === 'true'
        }

        if (minRating) {
            where.reviews = {
                some: {
                    Rating: {
                        gte: parseInt(minRating)
                    }
                }
            }
        }

        const skip = (page - 1) * limit

        const [restaurants, total] = await Promise.all([
            prisma.enterprise.findMany({
                where,
                include: {
                    menus: {
                        include: {
                            menuFoods: {
                                where: {
                                    food: {
                                        IsAvailable: true
                                    }
                                },
                                include: {
                                    food: {
                                        select: {
                                            FoodID: true,
                                            DishName: true,
                                            Price: true,
                                            foodCategory: {
                                                select: {
                                                    CategoryName: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            menus: true,
                        }
                    }
                },
                orderBy: {
                    CreatedAt: 'desc'
                },
                skip,
                take: limit,
            }),
            prisma.enterprise.count({ where })
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
        // Require enterprise authentication
        const authResult = requireEnterprise(request)
        if (!authResult.success) {
            return NextResponse.json(
                { error: authResult.error },
                { status: 401 }
            )
        }

        const user = authResult.user!
        const body = await request.json()
        const {
            name,
            description,
            address,
            phone,
            openHours,
            closeHours,
            isActive = true
        } = body

        if (!name || !description || !address || !phone) {
            return NextResponse.json(
                { error: 'Name, description, address, and phone are required' },
                { status: 400 }
            )
        }

        const restaurant = await prisma.enterprise.create({
            data: {
                EnterpriseName: name,
                Description: description,
                Address: address,
                PhoneNumber: phone,
                OpenHours: openHours || '08:00',
                CloseHours: closeHours || '22:00',
                IsActive: isActive,
                AccountID: user.id,
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
