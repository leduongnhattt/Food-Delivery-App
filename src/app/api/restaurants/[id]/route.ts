import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        const restaurant = await prisma.enterprise.findUnique({
            where: { EnterpriseID: id },
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
                                    include: {
                                        foodCategory: true
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        menus: true,
                        reviews: true
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
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const body = await request.json()
        const {
            name,
            description,
            address,
            phone,
            openHours,
            closeHours,
            isOpen
        } = body

        const restaurant = await prisma.enterprise.update({
            where: { EnterpriseID: id },
            data: {
                EnterpriseName: name,
                Description: description,
                Address: address,
                PhoneNumber: phone,
                OpenHours: openHours,
                CloseHours: closeHours,
                IsActive: isOpen,
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
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        await prisma.enterprise.delete({
            where: { EnterpriseID: id }
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
