"use client";

import { useEffect, useState } from "react";
import { Landmark } from "lucide-react";

export default function EnterpriseBankAccountsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 150);
    return () => window.clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF] mx-auto mb-4" />
          <p className="text-gray-600">Loading bank accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bank Accounts</h1>
              <p className="text-gray-600 mt-1">Manage payout bank accounts for your shop</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center">
          <div className="w-20 h-20 bg-[#2563FF] rounded-full flex items-center justify-center mx-auto mb-6">
            <Landmark className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bank Accounts Coming Soon</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This section will let you add and verify bank accounts, choose a default payout account,
            and view payout history.
          </p>
        </div>
      </div>
    </div>
  );
}

