import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireCustomer } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    // Require customer authentication
    const authResult = requireCustomer(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const user = authResult.user!

    // Get customer ID from account
    const customer = await prisma.customer.findUnique({
      where: { AccountID: user.id },
      select: { CustomerID: true }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Only get orders for the authenticated customer
    const orders = await prisma.order.findMany({
      where: {
        CustomerID: customer.CustomerID
      },
      include: {
        orderDetails: {
          include: {
            food: true,
          },
        },
        customer: {
          include: {
            account: true
          }
        },
        voucher: true,
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

export async function POST(request: NextRequest) {
  try {
    // Require customer authentication
    const authResult = requireCustomer(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const user = authResult.user!

    // Get customer ID from account
    const customer = await prisma.customer.findUnique({
      where: { AccountID: user.id },
      select: { CustomerID: true }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    type OrderItemInput = { foodId: string; quantity: number; subTotal: number }
    const { foodItems, totalAmount, deliveryAddress, deliveryNote } = body as {
      foodItems: OrderItemInput[];
      totalAmount: number;
      deliveryAddress: string;
      deliveryNote?: string;
    }

    const order = await prisma.order.create({
      data: {
        CustomerID: customer.CustomerID,
        TotalAmount: totalAmount,
        DeliveryAddress: deliveryAddress,
        DeliveryNote: deliveryNote,
        Status: 'Pending',
        orderDetails: {
          create: foodItems.map((item: OrderItemInput) => ({
            FoodID: item.foodId,
            Quantity: item.quantity,
            SubTotal: item.subTotal,
          })),
        },
      },
      include: {
        orderDetails: {
          include: {
            food: true,
          },
        },
        customer: {
          include: {
            account: true
          }
        },
        voucher: true,
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
