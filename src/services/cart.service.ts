import { CartItemPayload, CartSnapshot } from "@/types/models"
import { buildHeaders, requestJson } from '@/lib/http-client'

// Public API used by hooks/components
export async function fetchCart(): Promise<CartSnapshot> {
    return requestJson<CartSnapshot>('/api/cart', {
        headers: buildHeaders(),
    })
}

export async function addItemToCart(payload: CartItemPayload): Promise<CartSnapshot> {
    return requestJson<CartSnapshot>('/api/cart/items', {
        method: 'POST',
        headers: buildHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
    })
}

export async function updateItemQuantity(foodId: string, quantity: number): Promise<CartSnapshot> {
    return requestJson<CartSnapshot>(`/api/cart/items/${foodId}`, {
        method: 'PATCH',
        headers: buildHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ quantity }),
    })
}

export async function clearCart(): Promise<void> {
    await fetch('/api/cart', {
        method: 'DELETE',
        cache: 'no-store',
        headers: buildHeaders(),
    })
}

