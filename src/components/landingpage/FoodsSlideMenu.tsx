import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FoodCard from './FoodCard';

// Unified nested JSON structure
interface Menu {
  menuId: string;
  category: string;
}

interface Food {
  foodId: string;
  dishName: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  menu: Menu;
  rating?: number;
}

interface FoodsSlideMenuProps {
  title?: string;
  foods?: Food[];
  onOrderFood: (foodId: string) => void;
  className?: string;
}

// Sample unified nested JSON data
const sampleFoods: Food[] = [
  {
    foodId: 'food-1',
    dishName: 'Hamburger',
    price: 3.98,
    stock: 15,
    description: 'Juicy beef patty with fresh lettuce, tomatoes, and special sauce',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
    menu: {
      menuId: 'menu-1',
      category: 'Main Dish'
    },
    rating: 4
  },
  {
    foodId: 'food-2',
    dishName: 'Toffee\'s Cake',
    price: 4.00,
    stock: 8,
    description: 'Rich chocolate cake with toffee sauce and fresh blueberries',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop',
    menu: {
      menuId: 'menu-2',
      category: 'Dessert'
    },
    rating: 5
  },
  {
    foodId: 'food-3',
    dishName: 'Pancake',
    price: 1.99,
    stock: 12,
    description: 'Fluffy pancakes served with maple syrup and butter',
    imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300&h=200&fit=crop',
    menu: {
      menuId: 'menu-3',
      category: 'Breakfast'
    },
    rating: 4
  },
  {
    foodId: 'food-4',
    dishName: 'Crispy Sandwich',
    price: 3.00,
    stock: 6,
    description: 'Grilled sandwich with crispy bacon and melted cheese',
    imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=300&h=200&fit=crop',
    menu: {
      menuId: 'menu-4',
      category: 'Sandwich'
    },
    rating: 4
  },
  {
    foodId: 'food-5',
    dishName: 'Thai Soup',
    price: 2.79,
    stock: 10,
    description: 'Spicy and aromatic Thai soup with coconut milk and herbs',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop',
    menu: {
      menuId: 'menu-5',
      category: 'Soup'
    },
    rating: 5
  },
  {
    foodId: 'food-6',
    dishName: 'Spaghetti Carbonara',
    price: 8.50,
    stock: 0,
    description: 'Classic Italian pasta with eggs, cheese, and pancetta',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop',
    menu: {
      menuId: 'menu-1',
      category: 'Main Dish'
    },
    rating: 5
  },
  {
    foodId: 'food-7',
    dishName: 'Caesar Salad',
    price: 5.99,
    stock: 20,
    description: 'Fresh romaine lettuce with parmesan cheese and croutons',
    imageUrl: 'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=300&h=200&fit=crop',
    menu: {
      menuId: 'menu-1',
      category: 'Main Dish'
    },
    rating: 4
  },
  {
    foodId: 'food-8',
    dishName: 'Fish & Chips',
    price: 7.25,
    stock: 3,
    description: 'Crispy battered fish served with golden french fries',
    imageUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=300&h=200&fit=crop',
    menu: {
      menuId: 'menu-1',
      category: 'Main Dish'
    },
    rating: 4
  },
  {
    foodId: 'food-9',
    dishName: 'Grilled Chicken',
    price: 6.50,
    stock: 8,
    description: 'Tender grilled chicken breast with herbs and spices',
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=200&fit=crop',
    menu: {
      menuId: 'menu-1',
      category: 'Main Dish'
    },
    rating: 5
  },
  {
    foodId: 'food-10',
    dishName: 'Chocolate Brownie',
    price: 3.50,
    stock: 15,
    description: 'Rich and fudgy chocolate brownie with vanilla ice cream',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop',
    menu: {
      menuId: 'menu-2',
      category: 'Dessert'
    },
    rating: 5
  }
];

const FoodsSlideMenu: React.FC<FoodsSlideMenuProps> = ({ 
  title = "Popular Dishes", 
  foods, 
  onOrderFood,
  className = ""
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right'): void => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of card + gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleOrderFood = (foodId: string): void => {
    console.log('Ordering food:', foodId);
    onOrderFood(foodId);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          {title}
        </h2>
        
        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Foods Slider */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sampleFoods.map((food) => ( // sau dùng foods props
          <FoodCard 
            key={food.foodId} 
            food={food} 
            onOrderNow={handleOrderFood}
          />
        ))}
      </div>


    </div>
  );
};

export default FoodsSlideMenu;
