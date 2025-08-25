import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
        user: true,
      },
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, restaurantId, items, totalAmount, deliveryAddress, deliveryInstructions } = body
    
    const order = await prisma.order.create({
      data: {
        userId,
        restaurantId,
        totalAmount,
        status: 'pending',
        deliveryAddress,
        deliveryInstructions,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            specialInstructions: item.specialInstructions,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
        user: true,
      },
    })
    
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
