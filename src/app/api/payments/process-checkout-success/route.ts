import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { PrismaClient } from '@/generated/prisma'
import { getAuthenticatedUser } from '@/lib/auth-helpers'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const auth = getAuthenticatedUser(request)
        if (!auth.success) {
            return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
        }
        const userId = auth.user!.id

        const { sessionId } = await request.json()

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            )
        }

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (!session) {
            return NextResponse.json(
                { error: 'Invalid session ID' },
                { status: 400 }
            )
        }

        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { error: 'Payment not completed' },
                { status: 400 }
            )
        }

        // Extract metadata (minimal data)
        const metadata = session.metadata || {}
        const itemCount = parseInt(metadata.itemCount || '0')
        const total = parseFloat(metadata.total || '0')
        const phone = metadata.phone || ''
        const address = metadata.address || ''
        const voucherCode = metadata.voucherCode || ''

        // Get customer info from database
        const customer = await prisma.customer.findFirst({
            where: { AccountID: userId },
            select: {
                CustomerID: true,
                AccountID: true,
                FullName: true,
                PhoneNumber: true,
                Address: true
            }
        })

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Get cart items from database
        const cartItems = await prisma.cartItem.findMany({
            where: {
                cart: {
                    customer: {
                        AccountID: userId
                    }
                }
            },
            include: {
                food: {
                    include: {
                        enterprise: true
                    }
                }
            }
        })

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json(
                { error: 'No cart items found' },
                { status: 400 }
            )
        }

        // Check stock availability before processing payment
        const stockChecks = await Promise.all(
            cartItems.map(async (item: any) => {
                if (item.food.Stock < item.Quantity) {
                    throw new Error(`Insufficient stock for ${item.food.DishName}. Available: ${item.food.Stock}, Requested: ${item.Quantity}`)
                }
                return { foodId: item.FoodID, availableStock: item.food.Stock, requestedQuantity: item.Quantity }
            })
        )

        const deliveryInfo = { phone, address }

        // Calculate total
        const subtotal = cartItems.reduce((sum: number, item: any) =>
            sum + (item.food.Price * item.Quantity), 0
        )

        // Check if order already exists to prevent duplicates
        const existingOrder = await prisma.order.findFirst({
            where: {
                CustomerID: customer.CustomerID,
                TotalAmount: subtotal,
                Status: 'Confirmed',
                OrderDate: {
                    gte: new Date(Date.now() - 5 * 60 * 1000) // Within last 5 minutes
                }
            }
        })

        let order
        if (existingOrder) {
            order = existingOrder
        } else {
            // Create order with order details
            order = await prisma.order.create({
                data: {
                    CustomerID: customer.CustomerID,
                    TotalAmount: subtotal,
                    DeliveryAddress: deliveryInfo?.address || customer.Address || '',
                    DeliveryNote: '',
                    Status: 'Confirmed', // Payment successful, so order is confirmed
                    orderDetails: {
                        create: cartItems.map((item: any) => ({
                            FoodID: item.FoodID,
                            Quantity: item.Quantity,
                            SubTotal: item.food.Price * item.Quantity,
                        }))
                    },
                }
            })

            // Update stock for all food items in the order
            await Promise.all(
                cartItems.map(async (item: any) => {
                    await prisma.food.update({
                        where: { FoodID: item.FoodID },
                        data: {
                            Stock: {
                                decrement: item.Quantity
                            }
                        }
                    })
                })
            )
        }

        // Check if payment already exists to prevent duplicates
        const existingPayment = await prisma.payment.findFirst({
            where: { PaymentID: session.payment_intent as string }
        })

        if (!existingPayment) {
            // Create payment record
            await prisma.payment.create({
                data: {
                    PaymentID: session.payment_intent as string,
                    OrderID: order.OrderID,
                    PaymentMethod: 'CreditCard',
                    TransactionID: session.payment_intent as string,
                    PaymentStatus: 'Completed',
                    TransactionData: {
                        session_id: sessionId,
                        payment_intent: session.payment_intent as string,
                        amount_total: session.amount_total,
                        currency: session.currency,
                        customer_email: session.customer_email,
                    }
                }
            })
        }

        // Calculate commission
        const orderWithDetails = await prisma.order.findUnique({
            where: { OrderID: order.OrderID },
            include: {
                orderDetails: {
                    include: {
                        food: {
                            include: {
                                enterprise: true
                            }
                        }
                    }
                }
            }
        })

        if (orderWithDetails && orderWithDetails.orderDetails.length > 0) {
            const enterprise = orderWithDetails.orderDetails[0].food.enterprise
            const commissionRate = enterprise.CommissionRate || 5.0
            const commissionAmount = (Number(order.TotalAmount) * Number(commissionRate)) / 100

            await prisma.order.update({
                where: { OrderID: order.OrderID },
                data: { CommissionAmount: commissionAmount }
            })

            // Create settlement record for enterprise
            const now = new Date()
            const periodStart = new Date(now.getFullYear(), now.getMonth(), 1) // First day of current month
            const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0) // Last day of current month

            // Check if settlement already exists for this enterprise and period
            let settlement = await prisma.settlement.findFirst({
                where: {
                    EnterpriseID: enterprise.EnterpriseID,
                    PeriodStart: periodStart,
                    PeriodEnd: periodEnd
                }
            })

            // Create new settlement if doesn't exist
            if (!settlement) {
                settlement = await prisma.settlement.create({
                    data: {
                        EnterpriseID: enterprise.EnterpriseID,
                        PeriodStart: periodStart,
                        PeriodEnd: periodEnd,
                        NetPayout: 0, // Will be calculated later
                        Status: 'Pending'
                    }
                })
            }

            // Check if order already in settlement to prevent duplicates
            const existingSettlementItem = await prisma.settlementItem.findFirst({
                where: {
                    SettlementID: settlement.SettlementID,
                    OrderID: order.OrderID
                }
            })

            if (!existingSettlementItem) {
                // Add order to settlement
                await prisma.settlementItem.create({
                    data: {
                        SettlementID: settlement.SettlementID,
                        OrderID: order.OrderID,
                        IsCOD: false // Not COD since it's Stripe payment
                    }
                })
            }

            // Update settlement net payout
            const totalOrders = await prisma.settlementItem.findMany({
                where: { SettlementID: settlement.SettlementID },
                include: {
                    order: true
                }
            })

            const totalAmount = totalOrders.reduce((sum, item) => sum + Number(item.order.TotalAmount), 0)
            const totalCommission = totalOrders.reduce((sum, item) => sum + Number(item.order.CommissionAmount || 0), 0)
            const netPayout = totalAmount - totalCommission

            await prisma.settlement.update({
                where: { SettlementID: settlement.SettlementID },
                data: { NetPayout: netPayout }
            })
        }

        // Clear cart after successful order creation
        await prisma.cartItem.deleteMany({
            where: {
                cart: {
                    customer: {
                        AccountID: userId
                    }
                }
            }
        })

        // Also mark cart as abandoned and clear Redis cache
        const activeCart = await prisma.cart.findFirst({
            where: {
                customer: {
                    AccountID: userId
                },
                Status: 'Active'
            }
        })

        if (activeCart) {
            // Mark cart as abandoned
            await prisma.cart.update({
                where: { CartID: activeCart.CartID },
                data: { Status: 'Abandoned' }
            })

            // Clear Redis cache for this cart
            try {
                const { deleteKey } = await import('@/lib/redis')
                const { cartItemsKey, cartByIdKey, cartIdByUserKey } = await import('@/lib/cart-keys')

                await deleteKey(cartItemsKey(activeCart.CartID))
                await deleteKey(cartByIdKey(activeCart.CartID))
                await deleteKey(cartIdByUserKey(userId))

                console.log('Cart cache cleared successfully for user:', userId)
            } catch (redisError) {
                console.error('Failed to clear cart cache:', redisError)
                // Don't fail the request if Redis fails
            }
        }

        return NextResponse.json({
            orderId: order.OrderID,
            success: true,
            cartCleared: true
        })

    } catch (error) {
        console.error('Error processing checkout success:', error)
        return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
        )
    }
}
