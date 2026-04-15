import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import API from "../../config";
import { useAuth } from "../../context/AuthContext";

/* ---------------- TYPES ---------------- */

export interface CustomAddition {
  item: {
    id: string;
    name: string;
    price: number;
  };
  qty: number;
}

export interface CustomBouquet {
  base?: {
    id: string;
    name: string;
    price: number;
  };

  paper?: {
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

export interface OrderItem {
  productId: any | null;
  name: string;
  quantity: number;
  price: number;
  image?: string;

  isCustom?: boolean;
  hasPremiumWrapping?: boolean;
  custom?: CustomBouquet;
  slug?: string;
}

export interface Order {
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

  gift?: {
    name: string;
    phone: string;
    address: string;
    from?: string | null;
    includeGiftCard?: boolean;
    giftMessage?: string;
  };

  // ✅ SPECIAL REQUEST
  specialRequest?: string | null;

  items?: OrderItem[];

  totalAmount: number;

  orderStatus: "placed" | "confirmed" | "preparing" | "delivered" | "cancelled";

  paymentStatus: string;

  createdAt: string;
  deliveryType?: "standard" | "scheduled";
  deliveryDate?: string;
  deliveryTime?: string;
}

/* ---------------- COMPONENT ---------------- */

interface OrdersProps {
  orders?: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const OrdersPanel = ({ orders = [], setOrders }: OrdersProps) => {
  const [filter, setFilter] = useState<"all" | Order["orderStatus"]>("all");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { token } = useAuth();

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.orderStatus === filter);

  /* ---------------- UPDATE STATUS ---------------- */

  const copyOrderDetails = (order: Order) => {
    let text = `📦 ORDER: ${order.orderId}\n`;
    text += `👤 CUSTOMER: ${order.customerName} (${order.phone})\n`;
    text += `📍 ADDRESS: ${order.address.line1}, ${order.address.city}\n\n`;
    
    if (order.items) {
      text += `🛒 ITEMS:\n`;
      order.items.forEach((item, idx) => {
        text += `${idx + 1}. ${item.name} (QTY: ${item.quantity})\n`;
        if (item.hasPremiumWrapping) text += `   [PREMIUM WRAPPING REQUIRED]\n`;
        if (item.isCustom && item.custom) {
          text += `   --- CUSTOM BOUQUET ---\n`;
          if (item.custom.base) text += `   Base: ${item.custom.base.name}\n`;
          if (item.custom.ribbon) text += `   Ribbon: ${item.custom.ribbon.name}\n`;
          if (item.custom.paper || item.custom.wrapper) text += `   Paper: ${(item.custom.paper || item.custom.wrapper).name}\n`;
          if (item.custom.additions.length > 0) {
            text += `   Additions:\n`;
            item.custom.additions.forEach(a => {
              text += `     • ${a.item.name} (QTY: ${a.qty})\n`;
            });
          }
          if (item.custom.message) text += `   Note: ${item.custom.message}\n`;
        }
        text += `\n`;
      });
    }

    if (order.specialRequest) text += `💡 SPECIAL REQUEST: ${order.specialRequest}\n\n`;
    if (order.gift) {
      text += `🎁 GIFT INFO:\n`;
      text += `   Recipient: ${order.gift.name}\n`;
      if (order.gift.giftMessage) text += `   Card: "${order.gift.giftMessage}"\n`;
    }

    navigator.clipboard.writeText(text);
    alert("Order details copied for fulfillment 📋");
  };

  const updateStatus = async (id: string, newStatus: Order["orderStatus"]) => {
    try {
      const { data } = await axios.patch(
        `${API}/orders/${id}/status`,
        { orderStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));

      setSelectedOrder(null);
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-2 px-2">
          {[
            "all",
            "placed",
            "confirmed",
            "preparing",
            "delivered",
            "cancelled",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wider border border-[#E5E5E5] transition-all ${
                filter === status
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-white text-[#4A4A4A] hover:bg-[#FDF2F5]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-50 border-b text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Delivery</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-right">Manage</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs">{order.orderId}</span>
                        {order.items?.some(i => i.hasPremiumWrapping) && (
                          <span className="bg-pink-100 text-pink-600 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tighter w-fit border border-pink-200">
                             Premium Wrap
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-sm">
                        {order.customerName}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm">{order.phone}</td>

                    <td className="px-6 py-4 text-xs text-gray-500">
                      {order.address?.line1}, {order.address?.city},{" "}
                      {order.address?.state}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${
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
                    </td>

                    <td className="px-6 py-4 font-bold">
                      ₹{order.totalAmount}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md w-fit ${order.deliveryType === 'scheduled' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                          {order.deliveryType || 'Standard'}
                        </span>
                        {order.deliveryType === 'scheduled' && (
                          <p className="text-[10px] text-gray-400 font-medium">
                            {order.deliveryDate} @ {order.deliveryTime}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs font-bold text-pink-500 hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}
            <motion.div
              className="bg-white rounded-[2rem] max-w-xl w-full z-10 shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
            >
              {/* Header */}
              <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    Order
                  </p>
                  <h3 className="font-serif text-xl font-bold">
                    {selectedOrder.orderId}
                  </h3>
                  <button 
                    onClick={() => copyOrderDetails(selectedOrder)}
                    className="text-[9px] bg-gray-900 text-white px-2.5 py-1 rounded-md uppercase font-bold tracking-widest mt-1 hover:bg-black transition-colors"
                  >
                    Copy for Making
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedOrder.orderStatus === "delivered"
                      ? "bg-green-100 text-green-700"
                      : selectedOrder.orderStatus === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : selectedOrder.orderStatus === "confirmed"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {selectedOrder.orderStatus}
                </span>
              </div>

              {/* Body */}
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Customer */}
                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-50">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">
                      Customer
                    </p>
                    <p className="font-semibold">
                      {selectedOrder.customerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">
                      Delivery
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedOrder.deliveryType === 'scheduled' ? 'Scheduled' : 'Standard Delivery'}
                    </p>
                    {selectedOrder.deliveryType === 'scheduled' && (
                      <p className="text-xs text-purple-600 font-bold mt-0.5">
                        {selectedOrder.deliveryDate} — {selectedOrder.deliveryTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* ✅ GIFT INFO */}
                {selectedOrder.gift && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                    <p className="text-[10px] uppercase tracking-widest text-purple-400 mb-2">
                       Gift Details
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Recipient</p>
                          <p className="text-sm font-bold text-gray-900">{selectedOrder.gift.name}</p>
                       </div>
                       {selectedOrder.gift.from && (
                         <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">From</p>
                            <p className="text-sm font-bold text-gray-900">{selectedOrder.gift.from}</p>
                         </div>
                       )}
                    </div>
                    
                    {selectedOrder.gift.includeGiftCard && (
                      <div className="bg-white/60 p-4 rounded-lg border border-purple-200">
                         <p className="text-[10px] text-purple-600 uppercase font-bold mb-1 flex items-center gap-1.5">
                           📩 Handwritten Card
                         </p>
                         <p className="text-sm text-gray-700 font-medium italic">
                           “{selectedOrder.gift.giftMessage}”
                         </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Address */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    Address
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedOrder.address?.line1},{" "}
                    {selectedOrder.address?.city},{" "}
                    {selectedOrder.address?.state}
                  </p>
                </div>

                {/* ✅ SPECIAL REQUEST */}
                {selectedOrder.specialRequest && (
                  <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-pink-400 mb-1">
                      Special Request
                    </p>

                    <p className="text-sm italic text-gray-700">
                      “{selectedOrder.specialRequest}”
                    </p>
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">
                    Items
                  </p>

                  <div className="space-y-4">
                    {selectedOrder.items?.map((i, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-xl px-4 py-3"
                      >
                          <div className="flex justify-between items-start">
                            <div>
                              {(() => {
                                const prodDetails =
                                  typeof i.productId === "object" && i.productId !== null
                                    ? i.productId
                                    : null;
                                const itemSlug = i.slug || prodDetails?.slug;
                                const description = prodDetails?.description;

                                return (
                                  <>
                                    {itemSlug ? (
                                      <a
                                        href={`/product/${itemSlug}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                                      >
                                        {i.name}
                                        <span className="text-[10px]">↗</span>
                                      </a>
                                    ) : (
                                      <p className="text-sm font-semibold">{i.name}</p>
                                    )}
                                    <p className="text-[11px] text-gray-500">
                                      ₹{i.price} × {i.quantity}
                                    </p>
                                    {description && (
                                      <p className="text-xs text-gray-600 mt-2 italic bg-white p-2 rounded border border-gray-100">
                                        💐 <strong>Contains:</strong> {description}
                                      </p>
                                    )}
                                  </>
                                );
                              })()}
                            </div>

                            <p className="text-sm font-bold">
                              ₹{i.price * i.quantity}
                            </p>
                          </div>

                        {i.hasPremiumWrapping && (
                          <div className="mt-2 flex items-center gap-1.5 text-pink-500 bg-pink-50 w-fit px-2 py-0.5 rounded-full border border-pink-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                             <span className="text-[9px] font-bold uppercase tracking-widest">Premium Wrapping Applied</span>
                          </div>
                        )}

                        {i.isCustom && i.custom && (
                          <div className="mt-3 bg-white border rounded-lg p-3 text-xs space-y-1">
                            <p className="font-semibold text-pink-600">
                              Custom Bouquet
                            </p>

                            {i.custom.base && (
                              <p>
                                <strong>Base:</strong> {i.custom.base.name} — ₹
                                {i.custom.base.price}
                              </p>
                            )}

                            {(i.custom.paper || i.custom.wrapper) && (
                              <p>
                                <strong>Paper:</strong>{" "}
                                {(i.custom.paper || i.custom.wrapper).name} — ₹
                                {(i.custom.paper || i.custom.wrapper).price}
                              </p>
                            )}

                            {i.custom.ribbon && (
                              <p>
                                <strong>Ribbon:</strong> {i.custom.ribbon.name}{" "}
                                — ₹{i.custom.ribbon.price}
                              </p>
                            )}

                            {i.custom.additions?.length > 0 && (
                              <div>
                                <strong>Additions:</strong>
                                <div className="ml-3">
                                  {i.custom.additions.map((a) => (
                                    <p key={a.item.id}>
                                      • {a.item.name} × {a.qty} — ₹
                                      {a.item.price}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {i.custom.message && (
                              <p className="italic mt-1">
                                💌 {i.custom.message}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                  <button
                    onClick={() => updateStatus(selectedOrder._id, "confirmed")}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full text-[11px] font-bold uppercase"
                  >
                    Confirm
                  </button>

                  <button
                    onClick={() => updateStatus(selectedOrder._id, "preparing")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-full text-[11px] font-bold uppercase"
                  >
                    Preparing
                  </button>

                  <button
                    onClick={() => updateStatus(selectedOrder._id, "delivered")}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-[11px] font-bold uppercase"
                  >
                    Delivered
                  </button>

                  <button
                    onClick={() => updateStatus(selectedOrder._id, "cancelled")}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-full text-[11px] font-bold uppercase"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OrdersPanel;
