import Image from 'next/image'
import { notFound } from 'next/navigation'
import { MenuItemCard } from '@/components/menu/menu-item-card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Restaurant, MenuItem } from '@/types'
import { useCart } from '@/hooks/use-cart'

// Mock data - replace with actual API call
const mockRestaurant: Restaurant = {
  id: '1',
  name: 'Pizza Palace',
  description: 'Authentic Italian pizza with fresh ingredients and traditional recipes. We use only the finest ingredients imported directly from Italy to create the most delicious pizzas you\'ve ever tasted.',
  address: '123 Main St, Ho Chi Minh City',
  phone: '+84 123 456 789',
  image: '/api/placeholder/800/400',
  rating: 4.5,
  deliveryTime: '30-45 min',
  minimumOrder: 50000,
  isOpen: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic tomato sauce with mozzarella cheese and fresh basil',
    price: 150000,
    image: '/api/placeholder/300/200',
    category: 'Pizza',
    isAvailable: true,
    restaurantId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    description: 'Spicy pepperoni with melted cheese and tomato sauce',
    price: 180000,
    image: '/api/placeholder/300/200',
    category: 'Pizza',
    isAvailable: true,
    restaurantId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Garlic Bread',
    description: 'Fresh baked bread with garlic butter and herbs',
    price: 45000,
    image: '/api/placeholder/300/200',
    category: 'Appetizer',
    isAvailable: true,
    restaurantId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing and croutons',
    price: 80000,
    image: '/api/placeholder/300/200',
    category: 'Salad',
    isAvailable: false,
    restaurantId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

interface RestaurantPageProps {
  params: {
    id: string
  }
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const { addToCart } = useCart()

  // In a real app, fetch restaurant data based on params.id
  if (params.id !== '1') {
    notFound()
  }

  const handleAddToCart = (menuItem: MenuItem) => {
    addToCart(menuItem, 1)
  }

  const categories = [...new Set(mockMenuItems.map(item => item.category))]

  return (
    <div className="container py-8">
      {/* Restaurant Header */}
      <div className="mb-8">
        <div className="relative h-64 w-full rounded-lg overflow-hidden mb-6">
          <Image
            src={mockRestaurant.image}
            alt={mockRestaurant.name}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{mockRestaurant.name}</h1>
            <p className="text-muted-foreground mb-2">{mockRestaurant.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>⭐ {mockRestaurant.rating}</span>
              <span>🕒 {mockRestaurant.deliveryTime}</span>
              <span>📞 {mockRestaurant.phone}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Min. order: {formatPrice(mockRestaurant.minimumOrder)}
            </p>
            <Button disabled={!mockRestaurant.isOpen}>
              {mockRestaurant.isOpen ? 'Order Now' : 'Currently Closed'}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        
        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMenuItems
                .filter(item => item.category === category)
                .map((menuItem) => (
                  <MenuItemCard
                    key={menuItem.id}
                    menuItem={menuItem}
                    onAddToCart={handleAddToCart}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
