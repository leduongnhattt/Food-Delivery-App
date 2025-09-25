'use client'
import { apiClient } from "@/services/api"
import { useEffect, useState } from "react"
import FoodList, { Food } from "./FoodList";
import { useEnterpriseUpload } from "@/hooks/use-enterprise-upload";
import EditFoodPopup from "./EditFoodPopup";

export default function AdminDashboardPage() {
  const [entepriseData, setEnterpriseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  
  const { deleteImage, isDeleting, deleteError } = useEnterpriseUpload();

  async function fetchEnterpriseData() {
    try {
      setIsLoading(true);
      setError(null);
      const { enterprise } = await apiClient.get<{ enterprise: any }>(
        "/enterprise/profile?include=foods"
      );
      setEnterpriseData(enterprise);
    } catch (error) {
      console.error("Error fetching enterprise data:", error);
      setError("Failed to fetch enterprise data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchEnterpriseData();
  }, []);

  const refreshMenus = async () => {
    await fetchEnterpriseData();
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setIsEditPopupOpen(true);
  };

  const handleEditClose = () => {
    setIsEditPopupOpen(false);
    setEditingFood(null);
  };

  const handleEditSuccess = () => {
    refreshMenus();
    handleEditClose();
  };

  const handleDelete = async (food: Food) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this food item?"
    );
    if (!confirmed) return;

    try {
      // Delete image if exists
      if (food.ImageURL) {
        await deleteImage(food.ImageURL);
      }
      
      // Delete food item
      await apiClient.delete(`/enterprise/food?foodId=${food.FoodID}`);
      alert("Food item deleted successfully");
      refreshMenus();
    } catch (error) {
      console.error("Error deleting food item:", error);
      alert("Failed to delete food item. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchEnterpriseData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Product</h1>
      
      {/* Loading overlay when deleting image */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Deleting image...</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete error display */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800">Error deleting image: {deleteError}</p>
        </div>
      )}

      <FoodList
        foods={entepriseData?.foods ?? []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Food Popup */}
      {isEditPopupOpen && editingFood && (
        <EditFoodPopup
          food={editingFood}
          isOpen={isEditPopupOpen}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}