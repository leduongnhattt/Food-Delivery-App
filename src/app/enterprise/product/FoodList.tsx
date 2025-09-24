import React from "react";
import FoodRow from "./FoodRow";

// Type definitions based on API response
export interface Food {
  FoodID: string;
  DishName: string;
  Description: string;
  Price: number;
  ImageURL: string;
  Stock: number;
  foodCategory: {
    CategoryName: string;
  };
}

// dummy data for testing
const dummyFoods: Food[] = [
  {
    FoodID: "1",
    DishName: "Spaghetti Carbonara",
    Description:
      "Classic Italian pasta dish with eggs, cheese, pancetta, and pepper.",
    Price: 12.99,
    ImageURL: "/images/enterprise/enterprise_1758618572622.jpg",
    Stock: 20,
    foodCategory: { CategoryName: "Pasta" },
  },
];

export interface FoodListProps {
  foods: Food[];
  onEdit?: (foodId: string) => void;
  onDelete?: (foodId: string) => void;
}

const FoodList: React.FC<FoodListProps> = ({ foods, onEdit, onDelete }) => {
  foods = foods.length === 0 ? dummyFoods : foods; // Use dummy data if foods is empty
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
        <div className="col-span-1">Image</div>
        <div className="col-span-3">Food Name</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-2">Price</div>
        <div className="col-span-2">Quantity</div>
        <div className="col-span-2">Action</div>
      </div>

      {/* Food Rows */}
      {foods.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No foods available.</div>
      ) : (
        foods.map((food) => (
          <FoodRow
            key={food.FoodID}
            food={food}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};

export default FoodList;
