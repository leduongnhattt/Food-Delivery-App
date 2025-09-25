import { NextRequest, NextResponse } from 'next/server'
import { resolveActiveCartId, createActiveCart, hydrateRedisFromDb, snapshotCart, abandonCart } from './_service/cart.server'
import { ONE_DAY_SECONDS } from '@/lib/cart-keys'
import { verifyToken } from '@/lib/auth'

function getActor(req: NextRequest): { userId?: string, guestToken?: string } {
    let userId = req.headers.get('x-user-id') || undefined
    const authHeader = req.headers.get('authorization')
    if (!userId) {
        const bearer = authHeader?.replace('Bearer ', '')
        if (bearer) {
            const decoded = verifyToken(bearer)
            if (decoded?.accountId && decoded.role?.toLowerCase() === 'customer') {
                userId = decoded.accountId
            }
        }
    }
    // If user is authenticated, ignore any guest token to ensure separation from guest carts
    const cookieGuest = req.cookies.get('guest_token')?.value || undefined
    const guestToken = userId ? undefined : cookieGuest
    return { userId, guestToken }
}

export async function GET(req: NextRequest) {
    try {
        const actor = getActor(req)
        let cartId = await resolveActiveCartId(actor)
        if (!cartId) {
            // No cart yet; create for guest lazily on first GET only if explicitly requested? Here we keep null.
            return NextResponse.json({ cartId: null, items: [] })
        }
        // Ensure Redis has snapshot (hydrate if needed)
        await hydrateRedisFromDb(cartId, actor.guestToken ? ONE_DAY_SECONDS : undefined)
        const snap = await snapshotCart(cartId)
        return NextResponse.json(snap)
    } catch (e) {
        console.error('GET /api/cart failed', e)
        return NextResponse.json({ error: 'Failed to get cart' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const actor = getActor(req)
        const cartId = await resolveActiveCartId(actor)
        if (!cartId) return NextResponse.json({}, { status: 204 })
        await abandonCart(cartId)
        return NextResponse.json({}, { status: 204 })
    } catch (e) {
        console.error('DELETE /api/cart failed', e)
        return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
    }
}


