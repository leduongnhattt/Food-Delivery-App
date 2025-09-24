'use client'
import { apiClient } from "@/services/api"
import { useEffect, useState } from "react"
import FoodList from "./FoodList";

export default function AdminDashboardPage() {
  const [entepriseData, setEnterpriseData] = useState<any>(null);

  useEffect(() => {
    async function fetchEnterpriseData() {
      try {
        const { enterprise } = await apiClient.get<{ enterprise: any }>(
                  "/enterprise/profile?include=foods"
                );
        setEnterpriseData(enterprise);
      } catch (error) {
        console.error("Error fetching enterprise data:", error);
      }
    }
    fetchEnterpriseData();
  }, []);
  const handleEdit = (foodId: string) => {
    console.log("Edit food:", foodId);
  };

  const handleDelete = (foodId: string) => {
    console.log("Delete food:", foodId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Product</h1>
      <FoodList
        foods={entepriseData?.foods ?? []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}