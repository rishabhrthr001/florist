import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
      .then((res) => setOrders(res.data))
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
                    <div className="px-4 sm:px-6 pb-6 pt-5 space-y-6">
                      {/* Address */}
                      <div>
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
                              className="bg-gray-50 rounded-xl px-4 py-3"
                            >
                              <div className="flex justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-sm">
                                    {i.name}
                                  </p>

                                  <p className="text-[11px] text-gray-500">
                                    ₹{i.price} × {i.quantity}
                                  </p>
                                </div>

                                <p className="font-bold text-sm">
                                  ₹{i.price * i.quantity}
                                </p>
                              </div>

                              {/* CUSTOM */}
                              {i.isCustom && i.custom && (
                                <div className="mt-3 bg-white border rounded-lg p-3 text-[11px] space-y-1">
                                  <p className="font-semibold text-pink-600 text-[11px]">
                                    Custom Bouquet
                                  </p>

                                  {i.custom.base && (
                                    <p>
                                      <strong>Base:</strong>{" "}
                                      {i.custom.base.name}
                                    </p>
                                  )}

                                  {i.custom.wrapper && (
                                    <p>
                                      <strong>Wrapper:</strong>{" "}
                                      {i.custom.wrapper.name}
                                    </p>
                                  )}

                                  {i.custom.ribbon && (
                                    <p>
                                      <strong>Ribbon:</strong>{" "}
                                      {i.custom.ribbon.name}
                                    </p>
                                  )}

                                  {i.custom.additions?.length > 0 && (
                                    <div className="ml-2">
                                      {i.custom.additions.map((a) => (
                                        <p key={a.item.id}>
                                          • {a.item.name} × {a.qty}
                                        </p>
                                      ))}
                                    </div>
                                  )}

                                  {i.custom.message && (
                                    <p className="italic text-gray-500">
                                      💌 {i.custom.message}
                                    </p>
                                  )}
                                </div>
                              )}
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
