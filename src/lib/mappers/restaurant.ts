import type { Restaurant, MenuItem } from '@/types/models'

// Map API Restaurant (already in correct shape) to VM
export function mapRestaurantToVM(api: Restaurant): Restaurant {
    return api
}

// Map Food API item (from /api/foods) to MenuItem VM
export function mapFoodToMenuItem(food: any): MenuItem {
    return {
        id: food.foodId,
        name: food.dishName,
        description: food.description,
        // Convert to VND once here to keep UI clean
        price: Math.round((food.price ?? 0) * 1000),
        image: food.imageUrl || '/api/placeholder/300/200',
        category: food.menu?.category ?? 'Others',
        isAvailable: (food.stock ?? 0) > 0,
        restaurantId: food.restaurantId,
        restaurantName: (
            food.restaurant?.name ||
            food.restaurantName ||
            food.enterprise?.EnterpriseName ||
            food.restaurant?.EnterpriseName ||
            null
        ) || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
}


