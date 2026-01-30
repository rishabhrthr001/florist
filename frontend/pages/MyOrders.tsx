import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { io } from "socket.io-client";

import API from "../config";
import { useAuth } from "../context/AuthContext";

/* ---------------- TYPES ---------------- */

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
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

    const socket = io("http://localhost:3001", {
      auth: { token },
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("👤 User socket connected");
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

  /* ---------------- UI ---------------- */

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
    <div className="max-w-5xl mx-auto px-6 py-28">
      <h1 className="font-serif text-4xl mb-12">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const open = openId === order._id;

          return (
            <div
              key={order._id}
              className="bg-white rounded-3xl border shadow-sm overflow-hidden transition hover:shadow-md"
            >
              {/* HEADER */}
              <button
                onClick={() => setOpenId(open ? null : order._id)}
                className="w-full p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div>
                    <p className="font-mono text-xs text-gray-400">
                      {order.orderId}
                    </p>
                    <p className="font-semibold text-xl">
                      ₹{order.totalAmount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`w-fit px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${
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
                  size={20}
                  className={`ml-auto transition-transform ${
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
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden border-t"
                  >
                    <div className="px-6 pb-8 pt-6 space-y-8">
                      {/* Address */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                          Delivery Address
                        </p>
                        <p className="text-sm text-gray-600 max-w-xl">
                          {order.address.line1}, {order.address.city},{" "}
                          {order.address.state}
                        </p>
                      </div>

                      {/* Items */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">
                          Items
                        </p>

                        <div className="space-y-3">
                          {order.items.map((i, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-gray-50 rounded-2xl px-5 py-4"
                            >
                              <div>
                                <p className="font-semibold">{i.name}</p>
                                <p className="text-xs text-gray-500">
                                  ₹{i.price} × {i.quantity}
                                </p>
                              </div>

                              <p className="font-bold">
                                ₹{i.price * i.quantity}
                              </p>
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
