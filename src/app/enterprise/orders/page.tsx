import { Suspense } from "react";
import { EnterpriseOrdersPageClient } from "@/components/enterprise/orders/EnterpriseOrdersPageClient";

function OrdersLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#2563FF]" />
        <p className="text-gray-600">Loading orders...</p>
      </div>
    </div>
  );
}

export default function EnterpriseOrdersPage() {
  return (
    <Suspense fallback={<OrdersLoadingFallback />}>
      <EnterpriseOrdersPageClient />
    </Suspense>
  );
}
