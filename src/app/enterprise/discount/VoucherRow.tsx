import React from "react";
import { Voucher } from "./VoucherList";
import { Edit, Trash2 } from "lucide-react";

export interface VoucherRowProps {
  voucher: Voucher;
  onEdit?: (voucher: Voucher) => void;
  onDelete?: (voucherId: string) => void;
}

const VoucherRow: React.FC<VoucherRowProps> = ({
  voucher,
  onEdit,
  onDelete,
}) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(voucher);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(voucher.VoucherID);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusClasses[status as keyof typeof statusClasses] ||
          statusClasses.inactive
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
      {/* Voucher Code */}
      <div className="col-span-3 font-medium text-gray-900">{voucher.Code}</div>

      {/* Discount Percentage */}
      <div className="col-span-2 text-gray-700">
        {voucher.DiscountPercent}%
      </div>

      {/* Expiry Date */}
      <div className="col-span-3 text-gray-500">
        {formatDate(voucher.ExpiryDate)}
      </div>

      {/* Status */}
      <div className="col-span-3">{getStatusBadge(voucher.Status)}</div>

      {/* Action Buttons */}
      <div className="col-span-1 flex space-x-2">
        <div className="inline-flex items-center border rounded-md overflow-hidden">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-2 bg-white text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="Edit voucher"
            >
              <Edit size={18} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border-l border-gray-300"
              title="Delete voucher"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { VoucherRow };
