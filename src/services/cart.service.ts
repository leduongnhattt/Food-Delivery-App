import { CartItemPayload, CartSnapshot } from "@/types/models"

// Internal helpers
function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    try {
        return localStorage.getItem('access_token')
    } catch {
        return null
    }
}

function buildHeaders(extra?: Record<string, string>): HeadersInit | undefined {
    const token = getAccessToken()
    const base: Record<string, string> = extra ? { ...extra } : {}
    if (token) base['Authorization'] = `Bearer ${token}`
    return Object.keys(base).length > 0 ? base : undefined
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const res = await fetch(input, { cache: 'no-store', ...init })
    if (!res.ok) {
        const message = `Cart request failed (${res.status})`
        throw new Error(message)
    }
    return res.json() as Promise<T>
}

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

