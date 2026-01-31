import React from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

const Cart: React.FC = () => {
  const navigate = useNavigate();

  const {
    items,
    updateQty,
    removeFromCart,
    incrementCustomAddition,
    decrementCustomAddition,
  } = useCart();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[2fr_1fr] gap-10">
        {/* ================= LEFT ================= */}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-3xl md:text-4xl mb-8">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow">
              <ShoppingBag size={36} className="mx-auto mb-4 text-[#F8BBD0]" />

              <p className="text-gray-500 mb-6 text-sm">
                Your cart is currently empty.
              </p>

              <button
                onClick={() => navigate("/explore")}
                className="px-8 py-3 bg-[#F8BBD0] rounded-full text-[11px] uppercase tracking-widest font-bold hover:bg-[#f797b9]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-[1.8rem] p-5 md:p-6 shadow flex flex-col sm:flex-row gap-4"
                >
                  {/* IMAGE */}
                  <img
                    src={item.image}
                    alt=""
                    className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover flex-shrink-0"
                  />

                  {/* CENTER */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg leading-tight mb-1">
                      {item.name}
                    </h3>

                    {/* CUSTOM */}
                    {item.custom && (
                      <div className="mt-3 space-y-2 bg-[#FAF9F6] rounded-xl p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Custom Composition
                        </p>

                        <div className="flex justify-between text-xs">
                          <span>Base: {item.custom.base.name}</span>
                          <span>₹{item.custom.base.price}</span>
                        </div>

                        {item.custom.additions.map((a: any) => (
                          <div
                            key={a.item.id}
                            className="flex justify-between items-center text-xs"
                          >
                            <span>
                              {a.item.name} × {a.qty}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  decrementCustomAddition(item._id, a.item.id)
                                }
                                className="p-1 rounded-full border"
                              >
                                <Minus size={10} />
                              </button>

                              <span className="min-w-[48px] text-right">
                                ₹{a.item.price * a.qty}
                              </span>

                              <button
                                onClick={() =>
                                  incrementCustomAddition(item._id, a.item.id)
                                }
                                className="p-1 rounded-full border"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {item.custom.ribbon && (
                          <div className="flex justify-between text-xs border-t pt-2">
                            <span>Ribbon: {item.custom.ribbon.name}</span>
                            <span>₹{item.custom.ribbon.price}</span>
                          </div>
                        )}

                        {item.custom.instructions && (
                          <p className="text-[10px] italic text-gray-400 pt-2">
                            "{item.custom.instructions}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* QTY */}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item._id, -1)}
                        className="p-1.5 rounded-full border"
                      >
                        <Minus size={12} />
                      </button>

                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQty(item._id, 1)}
                        className="p-1.5 rounded-full border"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex sm:flex-col justify-between sm:text-right">
                    <p className="font-semibold text-sm">
                      ₹{item.price * item.quantity}
                    </p>

                    <button
                      onClick={() => {
                        removeFromCart(item._id);
                        toast.success("Removed from cart");
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ================= SUMMARY ================= */}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] p-8 shadow h-fit sticky top-28"
        >
          <h2 className="font-serif text-xl mb-6">Order Summary</h2>

          <div className="flex justify-between mb-3 text-sm">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between mb-6 text-sm text-gray-500">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>

          <button
            disabled={items.length === 0}
            onClick={() => navigate("/checkout")}
            className="w-full py-3 bg-[#1A1A1A] text-white rounded-full uppercase tracking-widest text-[11px] hover:bg-[#F8BBD0] transition disabled:opacity-40"
          >
            Proceed to Checkout
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;
