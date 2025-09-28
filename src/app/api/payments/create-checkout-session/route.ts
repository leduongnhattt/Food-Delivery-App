import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getAuthenticatedUser } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const auth = getAuthenticatedUser(request)
        if (!auth.success) {
            return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
        }
        const userId = auth.user!.id
        const userEmail = auth.user!.email

        const { cartItems, deliveryInfo, voucherCode, total } = await request.json()

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json(
                { error: 'Cart items are required' },
                { status: 400 }
            )
        }

        // Create line items for Stripe Checkout
        const lineItems = cartItems.map((item: any) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.menuItem.name,
                    description: `Restaurant: ${item.menuItem.restaurantName}`,
                    images: item.menuItem.image ? [item.menuItem.image] : [],
                },
                unit_amount: Math.round(item.menuItem.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        }))

        // Add delivery fee if needed
        if (total > 0) {
            const subtotal = cartItems.reduce((sum: number, item: any) =>
                sum + (item.menuItem.price * item.quantity), 0
            )
            const deliveryFee = total - subtotal

            if (deliveryFee > 0) {
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Delivery Fee',
                        },
                        unit_amount: Math.round(deliveryFee * 100),
                    },
                    quantity: 1,
                })
            }
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout`,
            metadata: {
                // Store minimal data in metadata (under 500 chars)
                itemCount: cartItems.length.toString(),
                total: total.toString(),
                phone: deliveryInfo?.phone || '',
                address: deliveryInfo?.address || '',
                voucherCode: voucherCode || '',
            },
            customer_email: userEmail,
        })

        // Store full cart data for later retrieval
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payments/store-cart-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: session.id,
                cartItems,
                deliveryInfo,
                voucherCode,
                total
            })
        })

        console.log('Checkout session created:', session.id)
        console.log('Cart items count:', cartItems.length)

        return NextResponse.json({ url: session.url })

    } catch (error) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
