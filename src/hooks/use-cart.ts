"use client"
import React, { useEffect, useMemo, useRef } from 'react'
import { CartItem, MenuItem } from '@/types/models'

type CartContextType = {
    cartItems: CartItem[]
    isOpen: boolean
    activeRestaurantId: string | null
    addToCart: (menuItem: MenuItem, quantity?: number, specialInstructions?: string) => void
    updateQuantity: (menuItemId: string, quantity: number) => void
    removeFromCart: (menuItemId: string) => void
    clearCart: () => void
    getTotalItems: () => number
    getTotalAmount: () => number
    openCart: () => void
    closeCart: () => void
}

const CartContext = React.createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = React.useState<CartItem[]>([])
    const [isOpen, setIsOpen] = React.useState(false)
    const [activeRestaurantId, setActiveRestaurantId] = React.useState<string | null>(null)
    const isMounted = useRef(false)

    // Load from localStorage once
    useEffect(() => {
        try {
            const saved = localStorage.getItem('cart')
            if (saved) {
                setCartItems(JSON.parse(saved))
            }
            const savedRid = localStorage.getItem('cartRestaurantId')
            if (savedRid) setActiveRestaurantId(savedRid)
        } catch (e) {
            console.error('Error loading cart from localStorage:', e)
        }
        isMounted.current = true
    }, [])

    // Persist changes only (avoid self-dispatch loops)
    useEffect(() => {
        if (!isMounted.current) return
        localStorage.setItem('cart', JSON.stringify(cartItems))
        if (cartItems.length === 0) {
            localStorage.removeItem('cartRestaurantId')
            setActiveRestaurantId(null)
        } else if (activeRestaurantId) {
            localStorage.setItem('cartRestaurantId', activeRestaurantId)
        }
    }, [cartItems, activeRestaurantId])

    // Listen to cross-tab updates (storage event doesn't fire in the same tab)
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key !== 'cart') return
            try {
                if (typeof e.newValue === 'string') {
                    setCartItems(JSON.parse(e.newValue))
                }
            } catch { }
        }
        window.addEventListener('storage', onStorage)
        return () => {
            window.removeEventListener('storage', onStorage)
        }
    }, [])

    const addToCart = (menuItem: MenuItem, quantity: number = 1, specialInstructions?: string) => {
        // Ensure restaurant name is set
        const enhancedMenuItem = {
            ...menuItem,
            restaurantName: menuItem.restaurantName || 
                           (menuItem as any).restaurant?.name || 
                           (menuItem as any).enterprise?.EnterpriseName ||
                           `Restaurant #${menuItem.restaurantId.substring(0, 6)}`
        };
        
        // Enforce single-restaurant cart
        setCartItems(prev => {
            if (activeRestaurantId && activeRestaurantId !== enhancedMenuItem.restaurantId) {
                // Switch restaurant: start a new cart for that restaurant
                setActiveRestaurantId(enhancedMenuItem.restaurantId)
                setIsOpen(true)
                return [{ menuItem: enhancedMenuItem, quantity, specialInstructions }]
            }
            if (!activeRestaurantId) {
                setActiveRestaurantId(enhancedMenuItem.restaurantId)
            }
            const existing = prev.find(i => i.menuItem.id === enhancedMenuItem.id)
            if (existing) {
                return prev.map(i => i.menuItem.id === enhancedMenuItem.id ? { ...i, quantity: i.quantity + quantity } : i)
            }
            return [...prev, { menuItem: enhancedMenuItem, quantity, specialInstructions }]
        })
    }

    const updateQuantity = (menuItemId: string, quantity: number) => {
        setCartItems(prev => prev.map(i => i.menuItem.id === menuItemId ? { ...i, quantity } : i))
    }

    const removeFromCart = (menuItemId: string) => {
        setCartItems(prev => {
            const next = prev.filter(i => i.menuItem.id !== menuItemId)
            if (next.length === 0) setActiveRestaurantId(null)
            return next
        })
    }

    const clearCart = () => {
        setCartItems([])
        setActiveRestaurantId(null)
    }

    // Count unique items (not total quantities)
    const getTotalItems = () => cartItems.length
    const getTotalAmount = () => cartItems.reduce((s, i) => s + i.menuItem.price * i.quantity, 0)

    const value: CartContextType = useMemo(() => ({
        cartItems,
        isOpen,
        activeRestaurantId,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalAmount,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
    }), [cartItems, isOpen, activeRestaurantId])

    return React.createElement(CartContext.Provider, { value }, children)
}

export function useCart(): CartContextType {
    const ctx = React.useContext(CartContext)
    if (!ctx) {
        throw new Error('useCart must be used within CartProvider')
    }
    return ctx
}
