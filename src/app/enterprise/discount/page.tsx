"use client";
import { apiClient } from "@/services/api";
import { useEffect, useState } from "react";
import { Voucher, VoucherList } from "./VoucherList";
import { Button } from "@/components/ui/button";
import EditVoucherPopup from "./EditVoucherPopup";

export default function AdminDashboardPage() {
  const [entepriseData, setEnterpriseData] = useState<any>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // form states
  const [couponCode, setCouponCode] = useState("");
  const [expire, setExpire] = useState("");
  const [percentDiscount, setPercentDiscount] = useState("");
  const [loading, setLoading] = useState(false);

  // validation states
  const [errors, setErrors] = useState({
    couponCode: "",
    expire: "",
    percentDiscount: "",
  });

  async function fetchEnterpriseData() {
    try {
      const { enterprise } = await apiClient.get<{ enterprise: any }>(
        "/enterprise/profile?include=vouchers"
      );
      setEnterpriseData(enterprise);
    } catch (error) {
      console.error("Error fetching enterprise data:", error);
    }
  }

  useEffect(() => {
    fetchEnterpriseData();
  }, []);

  const validateCouponCode = (value: string) => {
    if (!value.trim()) {
      return "Coupon code is required";
    }
    if (value.length < 3) {
      return "Coupon code must be at least 3 characters";
    }
    if (value.length > 20) {
      return "Coupon code must be less than 20 characters";
    }
    if (!/^[A-Za-z0-9_-]+$/.test(value)) {
      return "Coupon code can only contain letters, numbers, hyphens, and underscores";
    }

    // Check if code already exists
    const existingCodes =
      entepriseData?.vouchers?.map((v: Voucher) => v.Code) || [];
    if (existingCodes.includes(value)) {
      return "This coupon code already exists";
    }

    return "";
  };

  const validateExpireDate = (value: string) => {
    if (!value.trim()) {
      return "Expire date is required";
    }

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    if (selectedDate <= today) {
      return "Expire date must be in the future";
    }

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 5); // Max 5 years from now

    if (selectedDate > maxDate) {
      return "Expire date cannot be more than 5 years from now";
    }

    return "";
  };

  const validatePercentDiscount = (value: string) => {
    if (!value.trim()) {
      return "Percent discount is required";
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return "Percent discount must be a valid number";
    }

    if (numValue <= 0) {
      return "Percent discount must be greater than 0";
    }

    if (numValue > 100) {
      return "Percent discount cannot exceed 100%";
    }

    // Check for too many decimal places
    if (value.includes(".") && value.split(".")[1].length > 2) {
      return "Percent discount can have at most 2 decimal places";
    }

    return "";
  };

  const validateAllFields = () => {
    const newErrors = {
      couponCode: validateCouponCode(couponCode),
      expire: validateExpireDate(expire),
      percentDiscount: validatePercentDiscount(percentDiscount),
    };

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleCouponCodeChange = (value: string) => {
    setCouponCode(value);
    if (errors.couponCode) {
      setErrors((prev) => ({ ...prev, couponCode: validateCouponCode(value) }));
    }
  };

  const handleExpireChange = (value: string) => {
    setExpire(value);
    if (errors.expire) {
      setErrors((prev) => ({ ...prev, expire: validateExpireDate(value) }));
    }
  };

  const handlePercentDiscountChange = (value: string) => {
    setPercentDiscount(value);
    if (errors.percentDiscount) {
      setErrors((prev) => ({
        ...prev,
        percentDiscount: validatePercentDiscount(value),
      }));
    }
  };

  const handleAddVoucher = async () => {
    if (!validateAllFields()) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/enterprise/voucher", {
        Code: couponCode.trim(),
        ExpiryDate: expire,
        DiscountPercent: parseFloat(percentDiscount),
      });
      alert("Voucher added successfully");
      setCouponCode("");
      setExpire("");
      setPercentDiscount("");
      setErrors({ couponCode: "", expire: "", percentDiscount: "" });
      fetchEnterpriseData();
    } catch (error) {
      console.error("Error adding voucher:", error);
      alert("Failed to add voucher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
  };

  const handleDelete = async (voucherId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this voucher?"
    );
    if (!confirmed) return;
    try {
      await apiClient.delete(`/enterprise/voucher?voucherId=${voucherId}`);
      alert("Voucher deleted successfully");
      fetchEnterpriseData();
    } catch (error) {
      console.error("Error deleting voucher:", error);
      alert("Failed to delete voucher. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Voucher Dashboard</h1>

      <VoucherList
        vouchers={entepriseData?.vouchers ?? []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add new voucher field */}
      <div className="grid grid-cols-2 gap-6 mt-6 max-w-1/2">
        <div className="col-span-2 flex items-center justify-between">
          <label className="font-medium">Coupon Code:</label>
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="Enter Your Coupon"
              value={couponCode}
              onChange={(e) => handleCouponCodeChange(e.target.value)}
              className={`border rounded-md px-3 py-2 w-64 ${
                errors.couponCode ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.couponCode && (
              <span className="text-red-500 text-sm mt-1 w-64">
                {errors.couponCode}
              </span>
            )}
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-between">
          <label className="font-medium">Expire:</label>
          <div className="flex flex-col">
            <input
              type="date"
              min={
                new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              }
              placeholder="Enter expire day"
              value={expire}
              onChange={(e) => handleExpireChange(e.target.value)}
              className={`border rounded-md px-3 py-2 w-64 ${
                errors.expire ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.expire && (
              <span className="text-red-500 text-sm mt-1 w-64">
                {errors.expire}
              </span>
            )}
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-between">
          <label className="font-medium">Percent Discount:</label>
          <div className="flex flex-col">
            <input
              type="number"
              min="0.01"
              max="100"
              step="0.01"
              placeholder="Enter Percent Discount (0-100)"
              value={percentDiscount}
              onChange={(e) => handlePercentDiscountChange(e.target.value)}
              className={`border rounded-md px-3 py-2 w-64 ${
                errors.percentDiscount ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.percentDiscount && (
              <span className="text-red-500 text-sm mt-1 w-64">
                {errors.percentDiscount}
              </span>
            )}
          </div>
        </div>

        <div className="col-span-2 flex justify-center mt-4">
          <Button
            onClick={handleAddVoucher}
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>

      <EditVoucherPopup
        open={!!selectedVoucher}
        voucher={selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        onSuccess={fetchEnterpriseData}
      />
    </div>
  );
}
