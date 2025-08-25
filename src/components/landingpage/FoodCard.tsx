import React from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';

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
}

interface FoodCardProps {
  food: Food;
  onOrderNow: (foodId: string) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onOrderNow }) => {
  const handleOrderClick = (): void => {
    onOrderNow(food.foodId);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden min-w-[280px] max-w-[300px] flex-shrink-0 hover:shadow-xl transition-shadow duration-300">
      {/* Food Image */}
      <div className="relative h-48 overflow-hidden">
        <Image 
          src={food.imageUrl}
          alt={food.dishName}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        {food.stock <= 5 && food.stock > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
        Only {food.stock} left
          </div>
        )}
        {food.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
        Out of Stock
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Food Name */}
        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">
          {food.dishName}
        </h3>

        {/* Category and Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {food.menu.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[40px]">
          {food.description}
        </p>

        {/* Price and Order Button */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-800">
            ${food.price.toFixed(2)}
          </span>
          <button 
            onClick={handleOrderClick}
            disabled={food.stock === 0}
            className={`px-6 py-2 rounded-full font-medium text-sm transition-colors duration-200 ${
              food.stock === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {food.stock === 0 ? 'Sold Out' : 'Order Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;