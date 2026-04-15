import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Clock, Calendar, Sun, Moon, ChevronDown } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { optimizeCloudinaryUrl } from "../lib/cloudinary";
import { DELIVERY_SLOTS } from "../constants";

const Cart: React.FC = () => {
  const navigate = useNavigate();

  const {
    items,
    updateQty,
    removeFromCart,
    incrementCustomAddition,
    decrementCustomAddition,
    deliveryOption,
    setDeliveryOption,
    deliveryDate,
    setDeliveryDate,
    deliveryTime,
    setDeliveryTime,
    addVaseToItem,
  } = useCart();


  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const total = subtotal;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-24 sm:pt-32 pb-20 px-2 sm:px-4 md:px-6">
      
      {/* HEADER / BREADCRUMBS */}
      <div className="max-w-[120rem] mx-auto mb-6 sm:mb-10 overflow-hidden px-2 lg:px-8">
        <nav className="flex text-[9px] sm:text-[11px] text-gray-400 border-b border-gray-200/50 pb-3 sm:pb-4 font-bold uppercase tracking-widest">
          <Link to="/" className="hover:text-black transition-colors shrink-0">Home</Link>
          <span className="mx-2 shrink-0">/</span>
          <Link to="/explore" className="hover:text-black transition-colors shrink-0">Products</Link>
          <span className="mx-2 shrink-0">/</span>
          <span className="text-gray-900 truncate">Shopping Cart ({items.length})</span>
        </nav>
      </div>

      <div className="max-w-[120rem] mx-auto grid md:grid-cols-[1.8fr_1fr] gap-6 md:gap-10 xl:gap-16 px-2 lg:px-8">
        {/* ================= LEFT ================= */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:gap-6"
        >
          <div className="flex items-end justify-between mb-1 sm:mb-2">
             <h1 className="font-serif italic text-3xl md:text-5xl lg:text-[4rem] tracking-tight text-gray-900 leading-[1.1]">
               Your Cart
             </h1>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-16 text-center shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center justify-center min-h-[40vh]">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                 <ShoppingBag size={40} className="text-gray-300" strokeWidth={1} />
              </div>

              <h2 className="font-serif italic text-3xl mb-3 text-gray-900">Your cart is empty</h2>
              <p className="text-gray-400 mb-8 text-sm font-medium">
                Looks like you haven't added anything yet. Let's find something beautiful.
              </p>

              <button
                onClick={() => navigate("/explore")}
                className="px-10 py-4 bg-black text-white rounded-full text-[11px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-all shadow-md hover:-translate-y-0.5"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-[1.25rem] md:rounded-[2rem] p-3 md:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-100 flex gap-3 md:gap-6 relative group"
                >
                  {/* PUSH TRASH TO TOP RIGHT ON MOBILE */}
                  <button
                     onClick={() => {
                       removeFromCart(item._id);
                       toast.success("Removed from cart");
                     }}
                     className="absolute top-3 right-3 sm:hidden w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors z-10"
                  >
                     <Trash2 size={12} strokeWidth={2} />
                  </button>

                  {/* IMAGE */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 shrink-0 rounded-xl md:rounded-[1.25rem] overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                    <img
                      src={optimizeCloudinaryUrl(item.image, 200, true)}
                      alt={item.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* CENTER INFO */}
                  <div className="flex-1 flex flex-col relative justify-center pr-2">
                    
                    <div className="flex justify-between items-start mb-1">
                       <h3 className="font-serif text-[1.1rem] md:text-[1.4rem] leading-tight text-gray-900 tracking-tight pr-6 sm:pr-10 line-clamp-2">
                         {item.name}
                       </h3>
                       <p className="font-sans font-bold text-lg md:text-xl text-gray-900 shrink-0 hidden sm:block">
                         ₹{(item.price * item.quantity).toLocaleString()}
                       </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <p className="text-gray-400 text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
                         ₹{item.price.toLocaleString()} Each
                      </p>
                      
                      {item.hasPremiumWrapping && (
                        <span className="text-[8px] md:text-[9px] bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-pink-100 flex items-center gap-1 shrink-0">
                           <span className="w-1 h-1 rounded-full bg-pink-500"></span> Premium Wrap
                        </span>
                      )}

                      {item.isOutOfStock && (
                        <span className="text-[8px] md:text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-red-600 flex items-center gap-1 shrink-0 animate-pulse">
                           Out of Stock
                        </span>
                      )}
                    </div>

                    {item.vase ? (
                      <div className="flex items-center gap-2.5 mb-4 bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                        <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-xs">
                          <img src={item.vase.image} alt={item.vase.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-800 line-clamp-1 leading-tight">{item.vase.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Vase Add-on • ₹{item.vase.price}</p>
                        </div>
                        <button
                          onClick={() => addVaseToItem(item._id, null as any)}
                          className="p-1 px-2 text-[8px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null}

                    {/* CUSTOM COMPOSITION BREAKDOWN */}
                    {item.custom && (
                      <div className="mb-4 bg-[#FBFBFB] border border-gray-100 rounded-xl md:rounded-[1.25rem] p-3 md:p-4">
                        <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#EE1C47] mb-2 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#EE1C47] block shadow-sm"></span> Custom Composition
                        </p>

                        <div className="space-y-3">
                          <div className="flex justify-between text-[11px] md:text-xs font-medium text-gray-800">
                             <span className="flex items-center gap-2"><span className="text-gray-400 text-[9px] border bg-white px-1 py-0.5 rounded uppercase font-bold tracking-wide">Base</span> {item.custom.base.name}</span>
                             <span className="font-semibold text-gray-500">₹{item.custom.base.price}</span>
                          </div>

                          {item.custom.additions.map((a: any) => (
                            <div
                              key={a.item.id}
                              className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center text-[11px] md:text-xs font-medium text-gray-800 border-t border-gray-100 pt-3"
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-gray-400 text-[9px] border bg-white px-1 py-0.5 rounded uppercase font-bold tracking-wide">Add</span> {a.item.name} × {a.qty}
                              </span>

                              <div className="flex items-center justify-between md:justify-end gap-3 rounded-full border border-gray-200/60 p-1 md:w-auto shadow-sm bg-white self-start md:self-auto w-full">
                                <button
                                  onClick={() => decrementCustomAddition(item._id, a.item.id)}
                                  className="w-6 h-6 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
                                >
                                  <Minus size={12} strokeWidth={2.5}/>
                                </button>
                                <span className="min-w-[40px] text-center font-bold text-[10px] text-gray-900">
                                  ₹{a.item.price * a.qty}
                                </span>
                                <button
                                  onClick={() => incrementCustomAddition(item._id, a.item.id)}
                                  className="w-6 h-6 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
                                >
                                  <Plus size={12} strokeWidth={2.5}/>
                                </button>
                              </div>
                            </div>
                          ))}

                          {item.custom.ribbon && (
                            <div className="flex justify-between text-[11px] md:text-xs font-medium text-gray-800 border-t border-gray-100 pt-3">
                              <span className="flex items-center gap-2"><span className="text-gray-400 text-[9px] border bg-white px-1 py-0.5 rounded uppercase font-bold tracking-wide">Trim</span> {item.custom.ribbon.name}</span>
                              <span className="font-semibold text-gray-500">₹{item.custom.ribbon.price}</span>
                            </div>
                          )}

                          {item.custom.instructions && (
                            <div className="border-t border-gray-100 pt-3 mt-2">
                               <p className="text-[11px] italic text-gray-500 font-medium">
                                 Note: "{item.custom.instructions}"
                               </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CONTROLS (QTY & REMOVE) */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                       <div className="flex items-center justify-between bg-white rounded-full border border-gray-200 p-1 w-[5.5rem] md:w-[6rem] h-[2rem] md:h-[2.25rem] shadow-sm">
                          <button onClick={() => updateQty(item._id, -1)} className="w-6 md:w-7 h-6 md:h-7 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all text-gray-600">
                            <Minus size={12} strokeWidth={2}/>
                          </button>
                          <span className="font-bold text-gray-800 text-[11px] md:text-xs">{item.quantity}</span>
                          <button onClick={() => updateQty(item._id, 1)} className="w-6 md:w-7 h-6 md:h-7 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all text-gray-600">
                            <Plus size={12} strokeWidth={2} />
                          </button>
                       </div>

                       <div className="flex items-center gap-4">
                         <span className="font-sans font-bold text-xl text-gray-900 sm:hidden block truncate max-w-[120px]">
                           ₹{(item.price * item.quantity).toLocaleString()}
                         </span>

                         <button
                           onClick={() => {
                             removeFromCart(item._id);
                             toast.success("Removed from cart");
                           }}
                           className="hidden sm:flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#EE1C47] hover:text-red-700 transition-colors px-4 py-2 bg-red-50 hover:bg-red-100 rounded-full"
                         >
                           <Trash2 size={12} strokeWidth={2.5} /> Remove
                         </button>
                       </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ================= RIGHT: SUMMARY ================= */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100 md:sticky md:top-32 flex flex-col gap-6 !overflow-visible"
          >
            <h2 className="font-serif italic text-3xl md:text-4xl text-gray-900 border-b border-gray-100 pb-6 tracking-tight">
               Summary
            </h2>

             <div className="space-y-4 text-[13px] md:text-sm font-medium border-b border-gray-100 pb-6">
                
                {/* DELIVERY SELECTION */}
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Delivery Preference</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setDeliveryOption("standard")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${deliveryOption === 'standard' ? 'border-black bg-black text-white' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                    >
                      <Truck size={18} className="mb-1" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Deliver Now</span>
                    </button>
                    <button 
                      onClick={() => setDeliveryOption("scheduled")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${deliveryOption === 'scheduled' ? 'border-black bg-black text-white' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                    >
                      <Clock size={18} className="mb-1" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Schedule</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {deliveryOption === 'scheduled' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-2 !overflow-visible"
                      >
                        <div className="relative mb-3">
                          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-black transition-all"
                          />
                        </div>

                        <div className="relative" ref={dropdownRef}>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2 px-1">Select Time Slot</p>
                          <button
                            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-bold text-gray-900 hover:border-black/20 transition-all"
                          >
                            <span className="flex items-center gap-2">
                              {deliveryTime || "Select a slot"}
                              {DELIVERY_SLOTS.find(s => s.label === deliveryTime)?.premium && (
                                <span className="bg-pink-50 text-pink-500 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Premium</span>
                              )}
                            </span>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isTimeDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[1.25rem] shadow-[0_25px_70px_rgba(0,0,0,0.2)] z-[150] overflow-hidden max-h-[420px] overflow-y-auto"
                              >
                                <div className="p-2.5 space-y-1">
                                  {DELIVERY_SLOTS.map((slot) => (
                                    <button
                                      key={slot.label}
                                      onClick={() => {
                                        setDeliveryTime(slot.label);
                                        setIsTimeDropdownOpen(false);
                                      }}
                                      className={`w-full flex items-center justify-between px-4 py-3.5 text-left rounded-xl transition-all whitespace-nowrap ${
                                        deliveryTime === slot.label 
                                          ? 'bg-black text-white shadow-lg' 
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex flex-col">
                                        <span className="text-[12px] font-bold uppercase tracking-tight">{slot.label}</span>
                                        {slot.premium && deliveryTime !== slot.label && (
                                          <span className="text-[9px] text-pink-500 font-bold uppercase tracking-tighter">Premium Delivery</span>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  
                </div>
             </div>

             <div className="flex justify-between items-end pt-2">
                <span className="text-[11px] md:text-[12px] uppercase tracking-widest font-bold text-gray-400 mb-1">Total</span>
                <span className="font-sans font-bold text-3xl md:text-4xl text-gray-900 tracking-tight">₹{total.toLocaleString()}</span>
             </div>
             <p className="text-[10px] text-gray-400 text-right uppercase tracking-widest font-bold mt-[-8px]">Inclusive of all taxes</p>

            <button
              disabled={items.length === 0 || items.some(i => i.isOutOfStock)}
              onClick={() => navigate("/checkout")}
              className="mt-6 w-full py-4 bg-black text-white rounded-full uppercase tracking-widest text-[11px] md:text-xs font-bold hover:bg-gray-800 transition-all shadow-md hover:-translate-y-0.5 hidden md:flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {items.some(i => i.isOutOfStock) ? "Remove Out of Stock Items" : <><ShoppingBag size={16} strokeWidth={2.5}/> Checkout Securely <ArrowRight size={16} strokeWidth={2.5}/></>}
            </button>

            {/* TRUST BADGES */}
            <div className="mt-4 pt-4 border-t border-gray-100/50 text-center flex flex-wrap justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest"><span className="text-green-500 text-sm">✓</span> SSL Secured</span>
              <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest"><span className="text-green-500 text-sm">✓</span> 100% Guaranteed</span>
            </div>

          </motion.div>
        </div>
      </div>
      
      {/* MOBILE STICKY CHECKOUT */}
      {items.length > 0 && (
        <div className="md:hidden fixed bottom-1 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 z-50 flex gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-6">
           <div className="flex flex-col justify-center">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-tight mb-0.5">Total</p>
              <p className="font-sans font-bold text-xl text-gray-900 leading-tight">₹{total.toLocaleString()}</p>
           </div>
           <button 
             disabled={items.some(i => i.isOutOfStock)}
             onClick={() => navigate("/checkout")}
             className="flex-1 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 shadow-lg transition-colors h-14 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
           >
              {items.some(i => i.isOutOfStock) ? "Check Cart Items" : <>Checkout <ArrowRight size={16} strokeWidth={2.5}/></>}
           </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
