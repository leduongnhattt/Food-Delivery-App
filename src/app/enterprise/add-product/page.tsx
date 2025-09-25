"use client";
import { useState, useEffect } from "react";
import { Camera, ChevronDown, X } from "lucide-react";
import { useEnterpriseUpload } from "@/hooks/use-enterprise-upload";
import { apiClient } from "@/services/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export interface Category {
  CategoryID: string;
  CategoryName: string;
  Description?: string;
}

export default function FoodUploadForm() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    foodName: "",
    category: "",
    categoryId: "",
    price: "",
    quantity: "",
    description: "",
  });

  const { uploadImage, isUploading, uploadError } = useEnterpriseUpload();

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/enterprise/category");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleInputChange = (field: any, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategorySelect = (category: Category) => {
    setFormData((prev) => ({
      ...prev,
      category: category.CategoryName,
      categoryId: category.CategoryID,
    }));
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 1. Upload image if selected
      const imageURL = selectedImage ? await uploadImage(selectedImage) : "";

      if (selectedImage && !imageURL) {
        throw new Error("Failed to upload image");
      }

      // 2. Build payload
      const foodData = {
        DishName: formData.foodName.trim(),
        Description: formData.description?.trim() || "",
        Price: Number(formData.price),
        Stock: Number(formData.quantity),
        ImageURL: imageURL,
        FoodCategoryID: formData.categoryId,
      };

      // 3. Call API
      await apiClient.post("/enterprise/food", foodData);

      // 4. Success feedback + reset form
      alert("Food item created successfully");
      setFormData({
        foodName: "",
        category: "",
        categoryId: "",
        price: "",
        quantity: "",
        description: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating food:", error);
      alert("Failed to create food item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.foodName &&
    formData.categoryId &&
    formData.price &&
    formData.quantity;

  return (
    <div className="max-w-2/3 mx-auto bg-white p-6 ">
      <div className="space-y-6">
        {/* Image Upload Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {imagePreview ? (
              <div className="relative">
                <Image
                  width={96}
                  height={96}
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="cursor-pointer absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-50 transition-colors">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
          <span className="text-blue-500 text-sm mt-2 cursor-pointer">
            Upload Photo
          </span>
          {uploadError && (
            <p className="text-red-500 text-xs mt-1">{uploadError}</p>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-4">
          {/* Food Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Name
            </label>
            <input
              type="text"
              placeholder="Enter food name"
              value={formData.foodName}
              onChange={(e) => handleInputChange("foodName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isLoadingCategories}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
            >
              <span
                className={
                  formData.category ? "text-gray-900" : "text-gray-500"
                }
              >
                {isLoadingCategories
                  ? "Loading..."
                  : formData.category || "Food"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDropdown && !isLoadingCategories && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category.CategoryID}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="font-medium text-gray-900">
                      {category.CategoryName}
                    </div>
                    {category.Description && (
                      <div className="text-sm text-gray-500">
                        {category.Description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter price food"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="0"
              placeholder="Enter quantity food"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Description (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            placeholder="Enter food description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting || isUploading}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </div>
          ) : (
            "Add Now"
          )}
        </Button>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
