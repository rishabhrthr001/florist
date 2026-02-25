import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { io } from "socket.io-client";

import API from "../config";
import { useAuth } from "../context/AuthContext";

/* ---------------- TYPES ---------------- */

interface CustomAddition {
  item: {
    id: string;
    name: string;
    price: number;
  };
  qty: number;
}

interface CustomBouquet {
  base?: {
    id: string;
    name: string;
    price: number;
  };

  wrapper?: {
    id: string;
    name: string;
    price: number;
  };

  ribbon?: {
    id: string;
    name: string;
    price: number;
  };

  message?: string;

  additions: CustomAddition[];
}

interface OrderItem {
  productId: string | null;
  name: string;
  quantity: number;
  price: number;
  image?: string;

  isCustom?: boolean;
  custom?: CustomBouquet;
}

interface Order {
  _id: string;
  orderId: string;

  customerName: string;
  phone: string;

  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  items: OrderItem[];

  totalAmount: number;

  orderStatus: "placed" | "confirmed" | "preparing" | "delivered" | "cancelled";

  createdAt: string;
}

/* ---------------- COMPONENT ---------------- */

const MyOrders: React.FC = () => {
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [openId, setOpenId] = useState<string | null>(null);

  /* ---------------- FETCH USER ORDERS ---------------- */

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API}/orders/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // Show newest orders first
        const sorted = res.data.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      })
      .finally(() => setLoading(false));
  }, [token]);

  /* ---------------- SOCKET REALTIME ---------------- */

  useEffect(() => {
    if (!token) return;

    const socket = io(API, {
      auth: { token },
      withCredentials: true,
    });

    socket.on("order-updated", (updated: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o)),
      );
    });

    socket.on("new-order", (order: Order) => {
      setOrders((prev) => {
        if (prev.some((o) => o._id === order._id)) return prev;
        return [order, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  /* ---------------- UI STATES ---------------- */

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Loading orders…
      </div>
    );

  if (!orders.length)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        No orders yet 🌸
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
      <h1 className="font-serif text-3xl sm:text-4xl mb-8 sm:mb-12">
        My Orders
      </h1>

      <div className="space-y-4 sm:space-y-6">
        {orders.map((order) => {
          const open = openId === order._id;

          return (
            <div
              key={order._id}
              className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm overflow-hidden transition hover:shadow-md"
            >
              {/* HEADER */}
              <button
                onClick={() => setOpenId(open ? null : order._id)}
                className="w-full px-4 py-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 text-left"
              >
                {/* LEFT */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <div>
                    <p className="font-mono text-[10px] text-gray-400">
                      {order.orderId}
                    </p>

                    <p className="font-semibold text-lg sm:text-xl">
                      ₹{order.totalAmount}
                    </p>

                    <p className="text-[11px] text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-wide w-fit ${
                      order.orderStatus === "delivered"
                        ? "bg-green-100 text-green-700"
                        : order.orderStatus === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : order.orderStatus === "confirmed"
                            ? "bg-blue-100 text-blue-600"
                            : order.orderStatus === "preparing"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <ChevronDown
                  size={18}
                  className={`transition-transform shrink-0 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* BODY */}
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t"
                  >
                    <div className="px-4 sm:px-6 pb-6 pt-5 space-y-6 md:space-y-8">
                      {/* TIMELINE */}
                      {order.orderStatus !== "cancelled" && (
                        <div className="py-2">
                           <div className="flex justify-between relative max-w-2xl mx-auto items-center">
                              {/* Background Line */}
                              <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 rounded-full -z-10" />
                              
                              {["placed", "confirmed", "preparing", "delivered"].map((step, idx) => {
                                 const statuses = ["placed", "confirmed", "preparing", "delivered"];
                                 const currentIdx = statuses.indexOf(order.orderStatus);
                                 const isActive = idx <= currentIdx;
                                 
                                 return (
                                   <div key={step} className="flex flex-col items-center gap-2 relative bg-white z-10 px-2 sm:px-4">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shadow-sm transition-colors duration-500 delay-[${idx * 100}ms] ${isActive ? "bg-[#EE1C47] shadow-[0_2px_10px_rgba(238,28,71,0.3)]" : "bg-gray-200"}`}>
                                        {isActive ? <Check strokeWidth={3} size={14} /> : <span className="w-2 h-2 rounded-full bg-white opacity-50" />}
                                     </div>
                                     <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-widest transition-colors ${isActive ? "text-[#EE1C47]" : "text-gray-300"}`}>
                                       {step}
                                     </span>
                                   </div>
                                 );
                              })}
                           </div>
                        </div>
                      )}

                      {/* Address */}
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">
                          Delivery Address
                        </p>

                        <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
                          {order.address.line1}, {order.address.city},{" "}
                          {order.address.state}
                        </p>
                      </div>

                      {/* Items */}
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-3">
                          Items
                        </p>

                        <div className="space-y-3">
                          {order.items.map((i, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded-[1.25rem] md:rounded-[1.5rem] p-4 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-row gap-4 relative group"
                            >
                               {/* IMAGE */}
                               {i.image ? (
                                 <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                                   <img src={i.image} alt={i.name} className="w-full h-full object-cover object-center" />
                                 </div>
                               ) : (
                                 <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-300 text-xs text-center p-2 font-mono">
                                   No Image
                                 </div>
                               )}
                               {/* CENTER INFO */}
                               <div className="flex-1 flex flex-col relative justify-center">
                                 <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-serif text-[1.1rem] md:text-[1.3rem] leading-tight text-gray-900 tracking-tight pr-6 line-clamp-2">
                                      {i.name}
                                    </h3>
                                    <p className="font-sans font-bold text-lg text-gray-900 shrink-0">
                                      ₹{(i.price * i.quantity).toLocaleString()}
                                    </p>
                                 </div>
                                 <p className="text-gray-400 text-[9px] md:text-[10px] font-bold tracking-widest uppercase mb-3">
                                    ₹{i.price.toLocaleString()} Each <span className="text-gray-300 mx-1">|</span> Qty: {i.quantity}
                                 </p>

                              {/* CUSTOM */}
                              {i.isCustom && i.custom && (
                                <div className="mt-1 bg-[#FBFBFB] border border-gray-100 rounded-xl p-3 md:p-4">
                                  <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#EE1C47] mb-2 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-[#EE1C47] block shadow-sm"></span> Custom Composition
                                  </p>

                                  <div className="space-y-2">
                                    {i.custom.base && (
                                      <div className="flex justify-between text-[10px] md:text-[11px] font-medium text-gray-800">
                                        <span className="flex items-center gap-1.5"><span className="text-gray-400 text-[8px] border bg-white px-1 py-0.5 rounded uppercase font-bold tracking-wide">Base</span> {i.custom.base.name}</span>
                                      </div>
                                    )}

                                    {i.custom.additions?.length > 0 && (
                                        i.custom.additions.map((a) => (
                                          <div key={a.item.id} className="flex justify-between text-[10px] md:text-[11px] font-medium text-gray-800 border-t border-gray-100 pt-2">
                                             <span className="flex items-center gap-1.5"><span className="text-gray-400 text-[8px] border bg-white px-1 py-0.5 rounded uppercase font-bold tracking-wide">Add</span> {a.item.name} × {a.qty}</span>
                                          </div>
                                        ))
                                    )}

                                    {i.custom.ribbon && (
                                      <div className="flex justify-between text-[10px] md:text-[11px] font-medium text-gray-800 border-t border-gray-100 pt-2">
                                        <span className="flex items-center gap-1.5"><span className="text-gray-400 text-[8px] border bg-white px-1 py-0.5 rounded uppercase font-bold tracking-wide">Trim</span> {i.custom.ribbon.name}</span>
                                      </div>
                                    )}

                                    {i.custom.message && (
                                      <div className="border-t border-gray-100 pt-2 mt-2">
                                         <p className="text-[10px] italic text-gray-500 font-medium">
                                           Note: "{i.custom.message}"
                                         </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
