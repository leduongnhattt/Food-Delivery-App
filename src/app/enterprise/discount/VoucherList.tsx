import React, { useState } from "react";
import { VoucherRow } from "./VoucherRow";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Voucher {
  VoucherID: string;
  Code: string;
  DiscountPercent?: number;
  DiscountAmount?: number;
  MinOrderValue?: number;
  MaxUsage?: number;
  UsedCount: number;
  ExpiryDate: string;
  Status: string;
}

export interface VoucherListProps {
  vouchers: Voucher[];
  onEdit?: (voucher: Voucher) => void;
  onDelete?: (voucherId: string) => void;
}

const VoucherList: React.FC<VoucherListProps> = ({
  vouchers,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(vouchers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVouchers = vouchers.slice(startIndex, endIndex);

  // Handle page changes
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
        <div className="col-span-3">Voucher Code</div>
        <div className="col-span-2">Discount</div>
        <div className="col-span-3">Expiry Date</div>
        <div className="col-span-3">Status</div>
        <div className="col-span-1">Action</div>
      </div>

      {/* Voucher Rows */}
      {vouchers.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No vouchers available.
        </div>
      ) : (
        currentVouchers.map((voucher) => (
          <VoucherRow
            key={voucher.VoucherID}
            voucher={voucher}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}

      {/* Pagination */}
      {vouchers.length > 0 && totalPages > 1 && (
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Results info */}
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, vouchers.length)} of{" "}
              {vouchers.length} vouchers
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-1">
              {/* Previous button */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageClick(pageNumber)}
                  className={`px-3 py-2 text-sm rounded-md ${
                    currentPage === pageNumber
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              {/* Next button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { VoucherList };
