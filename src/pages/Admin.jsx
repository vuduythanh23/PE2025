import { useState } from "react";
import Header from "../components/layout/Header";
import OrderManagement from "../components/modules/OrderManagement";
import UserManagement from "../components/modules/UserManagement";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'orders'

  return (
    <>
      <Header />      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12"><div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-gray-800 mb-4">
              Admin Dashboard
            </h1>
            <div className="w-24 h-0.5 bg-amber-500 mx-auto"></div>
          </div><div className="bg-white shadow-md rounded-md p-6">
            {/* Tabs */}
            <div className="flex gap-6 mb-8 border-b border-gray-200">
              <button
                className={`pb-4 font-medium text-sm transition-colors relative
                  ${
                    activeTab === "users"
                      ? "text-amber-700 border-b-2 border-amber-700 -mb-[2px]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("users")}
              >
                User Management
              </button>
              <button
                className={`pb-4 font-medium text-sm transition-colors relative
                  ${
                    activeTab === "orders"
                      ? "text-amber-700 border-b-2 border-amber-700 -mb-[2px]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("orders")}
              >
                Order Management
              </button>
            </div>

            {activeTab === "users" ? <UserManagement /> : <OrderManagement />}
          </div>
        </div>
      </main>
    </>
  );
}