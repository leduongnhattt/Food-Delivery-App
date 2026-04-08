"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/toast-context";
import {
  orderManagementService,
  type Order,
} from "@/services/order-management.service";
import DeleteOrderPopup from "@/components/enterprise/orders/DeleteOrderPopup";
import { EnterpriseOrdersPrimaryTabs } from "@/components/enterprise/orders/EnterpriseOrdersPrimaryTabs";
import { EnterpriseOrdersTable } from "@/components/enterprise/orders/EnterpriseOrdersTable";
import {
  matchesEnterpriseTab,
  parseTabFromQuery,
  parseToShipSubFromQuery,
  type EnterpriseOrderTab,
  type EnterpriseToShipSubTab,
} from "@/lib/enterprise-order-buckets";

type SearchField = "product" | "buyer_name" | "order_id" | "tracking_number";
type ShippingPriority = "all" | "overdue" | "today" | "tomorrow";

interface CommittedFilters {
  searchField: SearchField;
  searchInput: string;
  shippingChannel: string;
  selectedPriority: ShippingPriority;
}

function defaultCommittedFilters(): CommittedFilters {
  return {
    searchField: "product",
    searchInput: "",
    shippingChannel: "all",
    selectedPriority: "all",
  };
}

function matchesSearch(order: Order, searchField: SearchField, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  switch (searchField) {
    case "buyer_name":
      return order.customerName.toLowerCase().includes(t);
    case "order_id":
      return order.id.toLowerCase().includes(t);
    case "tracking_number":
      // Not available in current API; keep deterministic.
      return false;
    case "product":
    default:
      return order.orderDetails.some((d) => d.dishName.toLowerCase().includes(t));
  }
}

function chipClass(active: boolean) {
  return `inline-flex items-center justify-center whitespace-nowrap text-xs font-medium transition-all outline-none h-7 px-3 rounded ${
    active
      ? "bg-[#2563FF] text-white"
      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
  }`;
}

export function EnterpriseOrdersPageClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const { showToast } = useToast();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = useMemo(
    () => parseTabFromQuery(searchParams.get("tab")),
    [searchParams],
  );
  const toShipSub = useMemo(
    () => parseToShipSubFromQuery(searchParams.get("sub")),
    [searchParams],
  );

  // committed filters per primary tab (MallPlus behavior)
  const [committedByTab, setCommittedByTab] = useState<
    Record<EnterpriseOrderTab, CommittedFilters>
  >(() => ({
    all: defaultCommittedFilters(),
    unpaid: defaultCommittedFilters(),
    to_ship: defaultCommittedFilters(),
    shipping: defaultCommittedFilters(),
    completed: defaultCommittedFilters(),
    return_refund: defaultCommittedFilters(),
  }));

  // pending (UI) values — only applied when click Apply
  const committed = committedByTab[tab] ?? defaultCommittedFilters();
  const [pendingSearchField, setPendingSearchField] = useState<SearchField>(committed.searchField);
  const [pendingSearchInput, setPendingSearchInput] = useState<string>(committed.searchInput);
  const [pendingShippingChannel, setPendingShippingChannel] = useState<string>(committed.shippingChannel);
  const [pendingPriority, setPendingPriority] = useState<ShippingPriority>(committed.selectedPriority);

  // When tab changes, load pending values from committed state of that tab
  useEffect(() => {
    const next = committedByTab[tab] ?? defaultCommittedFilters();
    setPendingSearchField(next.searchField);
    setPendingSearchInput(next.searchInput);
    setPendingShippingChannel(next.shippingChannel);
    setPendingPriority(next.selectedPriority);
  }, [tab, committedByTab]);

  const setTabQuery = useCallback(
    (nextTab: EnterpriseOrderTab) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("tab", nextTab);
      if (nextTab !== "to_ship") {
        p.delete("sub");
      }
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setToShipSubQuery = useCallback(
    (sub: EnterpriseToShipSubTab) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("tab", "to_ship");
      p.set("sub", sub);
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleApply = useCallback(() => {
    setCommittedByTab((prev) => ({
      ...prev,
      [tab]: {
        searchField: pendingSearchField,
        searchInput: pendingSearchInput,
        shippingChannel: pendingShippingChannel,
        selectedPriority: pendingPriority,
      },
    }));
  }, [pendingPriority, pendingSearchField, pendingSearchInput, pendingShippingChannel, tab]);

  const handleReset = useCallback(() => {
    const def = defaultCommittedFilters();
    setPendingSearchField(def.searchField);
    setPendingSearchInput(def.searchInput);
    setPendingShippingChannel(def.shippingChannel);
    setPendingPriority(def.selectedPriority);
    setCommittedByTab((prev) => ({ ...prev, [tab]: def }));
  }, [tab]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderManagementService.fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const bucketFiltered = useMemo(() => {
    return orders.filter((o) => matchesEnterpriseTab(o, tab, toShipSub));
  }, [orders, tab, toShipSub]);

  const searched = useMemo(() => {
    const c = committedByTab[tab] ?? defaultCommittedFilters();
    return bucketFiltered.filter((o) => matchesSearch(o, c.searchField, c.searchInput));
  }, [bucketFiltered, committedByTab, tab]);

  const sortedOrders = useMemo(() => {
    return orderManagementService.sortOrders(searched, sortBy);
  }, [searched, sortBy]);

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setShowDeletePopup(true);
  };

  const handleConfirmOrder = useCallback(
    async (orderId: string) => {
      try {
        setConfirmingOrderId(orderId);
        await orderManagementService.updateOrderStatus(orderId, "Confirmed");
        showToast("Order confirmed", "success");
        await fetchOrders();
      } catch (error: unknown) {
        console.error("Error confirming order:", error);
        const msg =
          error instanceof Error ? error.message : "Could not confirm order";
        showToast(msg, "error");
      } finally {
        setConfirmingOrderId(null);
      }
    },
    [fetchOrders, showToast],
  );

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await orderManagementService.deleteOrder(orderToDelete);
      showToast("Order deleted successfully", "success");
      fetchOrders();
      setShowDeletePopup(false);
      setOrderToDelete(null);
    } catch (error: unknown) {
      console.error("Error deleting order:", error);
      const msg =
        error instanceof Error ? error.message : "Failed to delete order";
      showToast(msg, "error");
    }
  };

  const cancelDeleteOrder = () => {
    setShowDeletePopup(false);
    setOrderToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-3 sm:px-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-900">My Orders</h1>
          <div className="flex gap-3">
            <button
              type="button"
              className="h-10 rounded-md border border-[#b9cffc] bg-white px-6 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
              onClick={() => showToast("Export is not implemented yet", "info")}
            >
              Export
            </button>
            <button
              type="button"
              className="h-10 rounded-md border border-[#b9cffc] bg-white px-6 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
              onClick={() => showToast("Export History is not implemented yet", "info")}
            >
              Export History
            </button>
          </div>
        </div>

        <div className="px-2 pt-2">
          <EnterpriseOrdersPrimaryTabs
            tab={tab}
            toShipSub={toShipSub}
            onTabChange={setTabQuery}
          />
        </div>

        <div className="mt-6 border-b border-gray-200 pb-5">
          {tab === "to_ship" ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">Order Status</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={chipClass(toShipSub === "all")}
                    onClick={() => setToShipSubQuery("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={chipClass(toShipSub === "to_process")}
                    onClick={() => setToShipSubQuery("to_process")}
                  >
                    To Process
                  </button>
                  <button
                    type="button"
                    className={chipClass(toShipSub === "processed")}
                    onClick={() => setToShipSubQuery("processed")}
                  >
                    Processed
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">Shipping Priority</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={chipClass(pendingPriority === "all")}
                    onClick={() => setPendingPriority("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={chipClass(pendingPriority === "overdue")}
                    onClick={() => setPendingPriority("overdue")}
                  >
                    Overdue (0)
                  </button>
                  <button
                    type="button"
                    className={chipClass(pendingPriority === "today")}
                    onClick={() => setPendingPriority("today")}
                  >
                    Ship by Today (0)
                  </button>
                  <button
                    type="button"
                    className={chipClass(pendingPriority === "tomorrow")}
                    onClick={() => setPendingPriority("tomorrow")}
                  >
                    Ship by Tomorrow (0)
                  </button>
                </div>
              </div>
            </>
          ) : null}

          <div className="flex items-center gap-4">
            <div className="flex flex-1 items-center">
              <select
                value={pendingSearchField}
                onChange={(e) => setPendingSearchField(e.target.value as SearchField)}
                className="h-9 w-40 shrink-0 rounded-l border border-gray-300 bg-gray-50 px-3 text-sm text-gray-700 focus:border-[#2563FF] focus:outline-none focus:ring-2 focus:ring-[#2563FF]/20"
              >
                <option value="product">Product</option>
                <option value="buyer_name">Buyer Name</option>
                <option value="order_id">Order ID</option>
                <option value="tracking_number">Tracking Number</option>
              </select>
              <input
                value={pendingSearchInput}
                onChange={(e) => setPendingSearchInput(e.target.value)}
                placeholder="Input Product Name/Parent SKU/SKU"
                className="h-9 flex-1 rounded-l-none border border-gray-300 bg-gray-50 px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#2563FF] focus:outline-none focus:ring-2 focus:ring-[#2563FF]/20"
              />
            </div>

            <div className="flex flex-1 items-center gap-2">
              <label className="shrink-0 text-sm text-gray-600">
                Shipping Channel
              </label>
              <select
                value={pendingShippingChannel}
                onChange={(e) => setPendingShippingChannel(e.target.value)}
                className="h-9 flex-1 rounded border border-gray-300 bg-gray-50 px-3 text-sm text-gray-700 focus:border-[#2563FF] focus:outline-none focus:ring-2 focus:ring-[#2563FF]/20"
              >
                <option value="all">All Channels</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="h-9 rounded border border-[#2563FF] bg-white px-4 text-sm text-[#2563FF] hover:bg-[#2563FF] hover:text-white"
                onClick={handleApply}
              >
                Apply
              </button>
              <button
                type="button"
                className="h-9 rounded border border-gray-300 bg-white px-4 text-sm text-gray-900 hover:bg-gray-50"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium text-gray-900">
              {bucketFiltered.length} Orders
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 w-72 rounded border border-gray-300 bg-gray-50 px-3 text-sm text-gray-700 focus:border-[#2563FF] focus:outline-none focus:ring-2 focus:ring-[#2563FF]/20"
            >
              <option value="newest">Confirmed Date (Newest First)</option>
              <option value="oldest">Confirmed Date (Oldest First)</option>
              <option value="amount_high">Order Total (High to Low)</option>
              <option value="amount_low">Order Total (Low to High)</option>
            </select>
            {tab === "to_ship" ? (
              <button
                type="button"
                className="h-9 rounded bg-[#2563FF] px-4 text-sm font-medium text-white hover:bg-blue-700"
                onClick={() => showToast("Mass Ship is not implemented yet", "info")}
              >
                Mass Ship
              </button>
            ) : null}
          </div>
        </div>

        <EnterpriseOrdersTable
          orders={sortedOrders}
          onDelete={handleDeleteOrder}
          onConfirm={handleConfirmOrder}
          confirmingOrderId={confirmingOrderId}
        />
      </div>

      <DeleteOrderPopup
        isOpen={showDeletePopup}
        onConfirm={confirmDeleteOrder}
        onCancel={cancelDeleteOrder}
      />
    </div>
  );
}
