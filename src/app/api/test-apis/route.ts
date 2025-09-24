import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        // Test database connection and basic queries
        const [foodCount, restaurantCount, categoryCount] = await Promise.all([
            prisma.food.count(),
            prisma.enterprise.count(),
            prisma.foodCategory.count()
        ])

        // Test a simple food query
        const sampleFoods = await prisma.food.findMany({
            take: 3,
            include: {
                foodCategory: {
                    select: {
                        CategoryName: true
                    }
                },
                enterprise: {
                    select: {
                        EnterpriseName: true
                    }
                }
            }
        })

        // Test a simple restaurant query
        const sampleRestaurants = await prisma.enterprise.findMany({
            take: 3,
            include: {
                _count: {
                    select: {
                        foods: {
                            where: {
                                IsAvailable: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'API endpoints are working correctly',
            database: {
                totalFoods: foodCount,
                totalRestaurants: restaurantCount,
                totalCategories: categoryCount
            },
            sampleData: {
                foods: sampleFoods.map(food => ({
                    id: food.FoodID,
                    name: food.DishName,
                    price: Number(food.Price),
                    category: food.foodCategory.CategoryName,
                    restaurant: food.enterprise.EnterpriseName
                })),
                restaurants: sampleRestaurants.map(restaurant => ({
                    id: restaurant.EnterpriseID,
                    name: restaurant.EnterpriseName,
                    address: restaurant.Address,
                    foodCount: restaurant._count.foods
                }))
            }
        })
    } catch (error) {
        console.error('Error testing APIs:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to test APIs',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

