export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  phone: string
  image: string
  rating: number
  deliveryTime: string
  minimumOrder: number
  isOpen: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  isAvailable: boolean
  restaurantId: string
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  restaurantId: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  deliveryAddress: string
  deliveryInstructions?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  price: number
  specialInstructions?: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  specialInstructions?: string
}
