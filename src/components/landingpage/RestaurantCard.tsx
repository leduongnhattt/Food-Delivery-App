import Image from "next/image";
import React from "react";

export interface Restaurant {
  enterpriseId: string;
  accountId: string;
  enterpriseName: string;
  address: string;
  description: string;
  avatar?: string;
  status: "open" | "closed";
}


interface Props {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<Props> = ({ restaurant }) => {
  return (
    <div className="border rounded-xl p-4 shadow hover:shadow-lg transition flex items-start">
      {/* Avatar */}
      <div className="w-[40%] h-full mr-4 flex-shrink-0">
        {restaurant.avatar ? (
          <Image
            src={restaurant.avatar}
            alt={restaurant.enterpriseName}
            width={120}
            height={120}
            className="w-full h-full object-cover rounded-lg"
            style={{ aspectRatio: "1 / 1" }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs" style={{ aspectRatio: "1 / 1" }}>
            No Image
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex flex-col flex-1 h-full">
        <h2 className="font-bold text-lg mb-1">{restaurant.enterpriseName}</h2>
        <p className="text-sm text-gray-600 mb-1">{restaurant.address}</p>
        <div className="mt-auto self-end">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              restaurant.status === "open"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {restaurant.status === "open" ? "Đang mở cửa" : "Đã đóng cửa"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
