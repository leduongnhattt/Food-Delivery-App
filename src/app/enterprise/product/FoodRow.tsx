import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Food } from "./FoodList";
import Image from "next/image";

export interface FoodRowProps {
  food: Food;
  onEdit?: (foodId: string) => void;
  onDelete?: (foodId: string) => void;
}

const FoodRow: React.FC<FoodRowProps> = ({ food, onEdit, onDelete }) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(food.FoodID);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(food.FoodID);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
      {/* Image */}
      <div className="col-span-1">
        {food.ImageURL ? (
          <Image
          fill
          src={food.ImageURL}
          alt={food.DishName}
          className="w-12 h-12 object-cover rounded-lg"
          />
        ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
              <span>No Image</span>
            </div>
        ) }
      </div>

      {/* Food Name */}
      <div className="col-span-3">
        <div className="font-medium text-gray-900">{food.DishName}</div>
        {food.Description && (
          <div className="text-sm text-gray-500 truncate">
            {food.Description}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="col-span-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {food.foodCategory.CategoryName}
        </span>
      </div>

      {/* Price */}
      <div className="col-span-2">
        <span className="text-gray-900 font-medium">
          ${food.Price.toFixed(2)}
        </span>
      </div>

      {/* Quantity/Stock */}
      <div className="col-span-2">
        <span
          className={`font-medium ${
            food.Stock > 10
              ? "text-green-600"
              : food.Stock > 0
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {food.Stock}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-2">
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit food item"
            >
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete food item"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodRow;
