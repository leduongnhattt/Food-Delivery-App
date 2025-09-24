import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { Voucher } from "./VoucherList";
import { Button } from "@/components/ui/button";

interface EditVoucherPopupProps {
  open: boolean;
  voucher: Voucher | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditVoucherPopup({
  open,
  voucher,
  onClose,
  onSuccess,
}: EditVoucherPopupProps) {
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (voucher) {
      setCode(voucher.Code || "");
      setDiscountPercent(voucher.DiscountPercent || 0);
      // Format date for input field (YYYY-MM-DD)
      const date = new Date(voucher.ExpiryDate);
      const formattedDate = date.toISOString().split("T")[0];
      setExpiryDate(formattedDate);
    }
  }, [voucher]);

  if (!open) return null;

  const handleSubmit = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to edit this voucher?"
    );
    if (!confirmed) return;

    if (!code.trim()) {
      setError("Voucher code is required");
      return;
    }

    if (discountPercent <= 0 || discountPercent > 100) {
      setError("Discount percentage must be between 1 and 100");
      return;
    }

    if (!expiryDate) {
      setError("Expiry date is required");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await apiClient.put("/enterprise/voucher", {
        VoucherID: voucher?.VoucherID,
        Code: code,
        DiscountPercentage: discountPercent,
        ExpiryDate: expiryDate,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating voucher:", err);
      setError("Failed to update voucher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Edit Voucher</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Voucher Code *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter voucher code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Discount Percentage *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter discount percentage (1-100)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Expiry Date *</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-md border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
