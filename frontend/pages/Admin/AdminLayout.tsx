import React, { useEffect, useState, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import { Menu, X } from "lucide-react";

import { ComponentItem } from "@/types";

import AdminSidebar from "@/admin/components/AdminSidebar";
import Dashboard from "@/admin/components/Dashboard";
import ProductPanel from "@/admin/components/ProductPanel";
import CategoryPanel from "@/admin/components/CategoryPanel";
import OrdersPanel from "@/admin/components/OrdersPanel";
import AtelierPanel from "@/admin/components/AtelierPanel";
import CustomersPanel from "@/admin/components/CustomersPanel";
import TicketsPanel from "@/admin/components/TicketsPanel";

import API from "@/config";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/admin/components/OrdersPanel";
import CommentPanel from "@/admin/components/CommentPanel";
import TagPanel from "@/admin/components/TagPanel";

interface AdminLayoutProps {
  onEnterAdmin: () => void;
  onExitAdmin: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  onEnterAdmin,
  onExitAdmin,
}) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [atelierItems, setAtelierItems] = useState<ComponentItem[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);

  const { token } = useAuth();



  /* ---------------- ADMIN MODE ---------------- */

  useEffect(() => {
    onEnterAdmin();
    return () => onExitAdmin();
  }, [onEnterAdmin, onExitAdmin]);

  /* ---------------- FETCH ORDERS ---------------- */

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to fetch orders", err));
  }, [token]);

  /* ---------------- POLLING ORDERS (60s) ---------------- */
  useEffect(() => {
    if (!token) return;

    const fetchOrders = () => {
      axios
        .get(`${API}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setOrders(res.data);
        })
        .catch((err) => console.error("Polling orders failed", err));
    };

    const interval = setInterval(fetchOrders, 60000);
    return () => clearInterval(interval);
  }, [token]);

  /* ---------------- TITLES ---------------- */

  const sidebarTitles: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/products": "Products",
    "/admin/categories": "Categories",
    "/admin/orders": "Orders",
    "/admin/atelier": "Atelier Items",
    "/admin/customers": "Customers",
    "/admin/comments": "Comments",
    "/admin/tickets": "Support Tickets",
    "/admin/tags": "Tag Management",
  };

  const currentTitle =
    Object.entries(sidebarTitles).find(([path]) =>
      location.pathname.startsWith(path),
    )?.[1] || "Dashboard";

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col md:flex-row font-sans text-[#1A1A1A]">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between sticky top-0 z-[60]">
        <img
          src="/newLogo.png"
          alt="Mangalam Admin"
          className="h-8 w-auto object-contain"
        />

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-500 hover:text-black transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
              {currentTitle}
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Welcome back, Head Florist
            </p>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductPanel />} />
          <Route path="/categories" element={<CategoryPanel />} />

          {/* 🔥 LIVE ORDERS */}
          <Route
            path="/orders"
            element={<OrdersPanel orders={orders} setOrders={setOrders} />}
          />

          <Route
            path="/atelier"
            element={
              <AtelierPanel items={atelierItems} setItems={setAtelierItems} />
            }
          />
          <Route path="/comments" element={<CommentPanel />} />
          <Route path="/customers" element={<CustomersPanel />} />
          <Route path="/tickets" element={<TicketsPanel />} />
          <Route path="/tags" element={<TagPanel />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
