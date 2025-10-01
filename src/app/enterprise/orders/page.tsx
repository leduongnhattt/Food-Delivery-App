"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/toast-context";
import { orderManagementService, Order, OrderFilters as OrderFiltersType } from "@/services/order-management.service";
import { RefreshCw } from "lucide-react";
import OrderFilters from "@/components/enterprise/orders/OrderFilters";
import OrderList from "@/components/enterprise/orders/OrderList";
import DeleteOrderPopup from "@/components/enterprise/orders/DeleteOrderPopup";

export default function EnterpriseOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const orders = await orderManagementService.fetchOrders();
      setOrders(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setShowDeletePopup(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      await orderManagementService.deleteOrder(orderToDelete);
      showToast("Order deleted successfully", "success");
      fetchOrders(); // Refresh the orders list
      setShowDeletePopup(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast("Failed to delete order", "error");
    }
  };

  const cancelDeleteOrder = () => {
    setShowDeletePopup(false);
    setOrderToDelete(null);
  };

  const filters: OrderFiltersType = {
    searchTerm,
    statusFilter,
    sortBy
  };

  const filteredOrders = orderManagementService.filterOrders(orders, filters);
  const sortedOrders = orderManagementService.sortOrders(filteredOrders, sortBy);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Order Management
              </h1>
              <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters and Search */}
        <OrderFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalOrders={orders.length}
          filteredOrders={sortedOrders.length}
        />

        {/* Orders List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
          <OrderList
            orders={sortedOrders}
            onDelete={handleDeleteOrder}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <DeleteOrderPopup
        isOpen={showDeletePopup}
        onConfirm={confirmDeleteOrder}
        onCancel={cancelDeleteOrder}
      />
    </div>
  );
}
