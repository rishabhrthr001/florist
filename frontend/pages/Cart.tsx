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
    <div className="min-h-screen bg-[#FAF9F6] pt-40 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[2fr_1fr] gap-16">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-4xl md:text-5xl mb-10">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-16 text-center shadow">
              <ShoppingBag size={40} className="mx-auto mb-6 text-[#F8BBD0]" />
              <p className="text-gray-500 mb-6">
                Your cart is currently empty.
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="px-10 py-4 bg-[#F8BBD0] rounded-full text-xs uppercase tracking-widest font-bold hover:bg-[#f797b9]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-[2.5rem] p-8 shadow flex gap-6 items-center"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="w-28 h-28 rounded-2xl object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-serif text-xl mb-2">{item.name}</h3>

                    {/* CUSTOM BOUQUET BREAKDOWN */}
                    {item.custom && (
                      <div className="mt-4 space-y-3 bg-[#FAF9F6] rounded-xl p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                          Custom Composition
                        </p>

                        {/* BASE */}
                        <div className="flex justify-between text-sm">
                          <span>Base: {item.custom.base.name}</span>
                          <span>₹{item.custom.base.price}</span>
                        </div>

                        {/* ADDITIONS */}
                        {item.custom.additions.map((a: any) => (
                          <div
                            key={a.item.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span>
                              {a.item.name} × {a.qty}
                            </span>

                            <div className="flex items-center gap-4">
                              <button
                                onClick={() =>
                                  decrementCustomAddition(item._id, a.item.id)
                                }
                                className="p-1 rounded-full border"
                              >
                                <Minus size={12} />
                              </button>

                              <span className="min-w-[60px] text-right">
                                ₹{a.item.price * a.qty}
                              </span>

                              <button
                                onClick={() =>
                                  incrementCustomAddition(item._id, a.item.id)
                                }
                                className="p-1 rounded-full border"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* RIBBON */}
                        {item.custom.ribbon && (
                          <div className="flex justify-between text-sm border-t pt-2">
                            <span>Ribbon: {item.custom.ribbon.name}</span>
                            <span>₹{item.custom.ribbon.price}</span>
                          </div>
                        )}

                        {/* NOTES */}
                        {item.custom.instructions && (
                          <p className="text-[11px] italic text-gray-400 pt-2">
                            "{item.custom.instructions}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* MAIN QTY CONTROLS (FOR BOTH) */}
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => updateQty(item._id, -1)}
                        className="p-2 rounded-full border"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="w-8 text-center">{item.quantity}</span>

                      <button
                        onClick={() => updateQty(item._id, 1)}
                        className="p-2 rounded-full border"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right">
                    <p className="font-medium mb-4">
                      ₹{item.price * item.quantity}
                    </p>

                    <button
                      onClick={() => {
                        removeFromCart(item._id);
                        toast.success("Removed from cart");
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* SUMMARY */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-10 shadow h-fit sticky top-32"
        >
          <h2 className="font-serif text-2xl mb-8">Order Summary</h2>

          <div className="flex justify-between mb-4 text-sm">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between mb-8 text-sm">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>

          <button
            disabled={items.length === 0}
            onClick={() => navigate("/checkout")}
            className="w-full py-4 bg-[#1A1A1A] text-white rounded-full uppercase tracking-widest text-xs hover:bg-[#F8BBD0] transition disabled:opacity-40"
          >
            Proceed to Checkout
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;
