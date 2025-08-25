import { useState, useEffect } from 'react'
import { CartItem, MenuItem } from '@/types'

export function useCart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart))
            } catch (error) {
                console.error('Error loading cart from localStorage:', error)
            }
        }
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (menuItem: MenuItem, quantity: number = 1, specialInstructions?: string) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.menuItem.id === menuItem.id)

            if (existingItem) {
                return prevItems.map(item =>
                    item.menuItem.id === menuItem.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            } else {
                return [...prevItems, { menuItem, quantity, specialInstructions }]
            }
        })
    }

    const updateQuantity = (menuItemId: string, quantity: number) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.menuItem.id === menuItemId
                    ? { ...item, quantity }
                    : item
            )
        )
    }

    const removeFromCart = (menuItemId: string) => {
        setCartItems(prevItems =>
            prevItems.filter(item => item.menuItem.id !== menuItemId)
        )
    }

    const clearCart = () => {
        setCartItems([])
    }

    const getTotalItems = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0)
    }

    const getTotalAmount = () => {
        return cartItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
    }

    const openCart = () => setIsOpen(true)
    const closeCart = () => setIsOpen(false)

    return {
        cartItems,
        isOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalAmount,
        openCart,
        closeCart,
    }
}
