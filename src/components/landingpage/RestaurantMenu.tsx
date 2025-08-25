import React from "react";
import RestaurantCard from "./RestaurantCard";
import { useRouter } from 'next/navigation';

export interface Restaurant {
  enterpriseId: string;
  accountId: string;
  enterpriseName: string;
  address: string;
  description: string;
  avatar?: string;
  status: "open" | "closed";
}

const mockRestaurants: Restaurant[] = [
  {
    enterpriseId: "1",
    accountId: "101",
    enterpriseName: "Phở 24",
    address: "123 Nguyễn Trãi, Hà Nội",
    description: "Chuyên phở truyền thống và hiện đại.",
    status: "open",
    avatar: "/images/logo.png"
  },
  {
    enterpriseId: "2",
    accountId: "102",
    enterpriseName: "Pizza Hut",
    address: "45 Lê Lợi, TP.HCM",
    description: "Pizza phong cách Mỹ, đa dạng topping.",
    status: "open",
  },
  {
    enterpriseId: "3",
    accountId: "103",
    enterpriseName: "Cơm Tấm Cali",
    address: "78 Huỳnh Thúc Kháng, Đà Nẵng",
    description: "Cơm tấm ngon chuẩn vị Sài Gòn.",
    status: "closed",
  },
  {
    enterpriseId: "4",
    accountId: "104",
    enterpriseName: "Lotteria",
    address: "22 Trần Hưng Đạo, Hà Nội",
    description: "Đồ ăn nhanh phong cách Hàn Quốc.",
    status: "open",
  },
  {
    enterpriseId: "5",
    accountId: "105",
    enterpriseName: "KFC",
    address: "56 Nguyễn Huệ, TP.HCM",
    description: "Gà rán nổi tiếng toàn cầu.",
    status: "closed",
  },
  {
    enterpriseId: "6",
    accountId: "106",
    enterpriseName: "Highlands Coffee",
    address: "90 Lê Duẩn, Hà Nội",
    description: "Cà phê pha phin và không gian thoải mái.",
    status: "open",
  },
  {
    enterpriseId: "7",
    accountId: "107",
    enterpriseName: "The Coffee House",
    address: "11 Quang Trung, Đà Nẵng",
    description: "Nơi hội ngộ và thưởng thức cà phê.",
    status: "open",
  },
  {
    enterpriseId: "8",
    accountId: "108",
    enterpriseName: "Jollibee",
    address: "33 Điện Biên Phủ, Cần Thơ",
    description: "Đồ ăn nhanh nổi tiếng từ Philippines.",
    status: "closed",
  },
];

interface Props {
  className?: string;
}

const RestaurantMenu: React.FC<Props> = ({className}) => {
  const router = useRouter();
  const handleViewAll = () => {
    router.push('/restaurants');
  };
  return (
    <div className={className}>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Popular Restaurants</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.enterpriseId} restaurant={restaurant} />
        ))}
      </div>
      <div className="flex justify-center">
        <button
        onClick={handleViewAll} 
        className="mt-6 px-6 py-2 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 transition">
          View All
          <span className="ml-2 inline-block transform transition-transform group-hover:translate-x-1">
            &gt;
          </span>
        </button>
      </div>
    </div>
  );
};

export default RestaurantMenu;
