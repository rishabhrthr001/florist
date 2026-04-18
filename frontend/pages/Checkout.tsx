import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { MapPin, Sun, Moon, Gift, MessageSquare, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import API from "../config";
import { DELIVERY_SLOTS } from "../constants";

/* ---------------- TYPES ---------------- */

type Address = {
  _id: string;
  label?: string;
  name?: string;
  phone?: string;

  addressLine1: string;
  addressLine2?: string;
  landmark: string;

  city: string;
  state: string;
  postalCode: string;

  isDefault?: boolean;
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  const { 
    items, 
    clearCart, 
    specialRequest, 
    setSpecialRequest,
    deliveryOption,
    deliveryDate,
    deliveryTime 
  } = useCart();
  const { user, token, login } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );


  const [isGift, setIsGift] = useState(false);

  const [giftName, setGiftName] = useState("");
  const [giftPhone, setGiftPhone] = useState("");
  const [giftAddress, setGiftAddress] = useState("");
  const [giftFrom, setGiftFrom] = useState("");
  const [includeGiftCard, setIncludeGiftCard] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  /* ---------------- INLINE ADDRESS FORM ---------------- */
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "Delhi",
    state: "Delhi",
    postalCode: "",
  });

  const handleAddAddress = async () => {
    const required = [
      newAddress.label, newAddress.name, newAddress.phone, 
      newAddress.addressLine1, newAddress.landmark, newAddress.postalCode
    ];
    if (required.some((v) => !v.trim())) {
      toast.error("All required address fields must be filled.");
      return;
    }
    if (!/^1100\d{2}$/.test(newAddress.postalCode)) {
      toast.error("We only deliver inside Delhi 📍");
      return;
    }

    try {
      setAddingAddress(true);
      const { data } = await axios.post(`${API}/user/addresses`, newAddress, {
        headers: { Authorization: `Bearer ${token}` },
      });
      login(token!, data); // Update user context with new addresses
      
      const updatedList = data.addresses || [];
      setAddresses(updatedList);
      
      if (updatedList.length > 0) {
        setSelectedAddressId(updatedList[updatedList.length - 1]._id);
      }
      
      toast.success("Address added and selected 📍");
      setShowAddressForm(false);
      setNewAddress({
        label: "", name: "", phone: "", addressLine1: "", addressLine2: "",
        landmark: "", city: "Delhi", state: "Delhi", postalCode: "",
      });
    } catch (error) {
       toast.error("Failed to add address.");
    } finally {
      setAddingAddress(false);
    }
  };

  /* ---------------- FETCH ADDRESSES ---------------- */

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = res.data.addresses || [];
        setAddresses(list);

        const def = list.find((a: Address) => a.isDefault);
        if (def) setSelectedAddressId(def._id);
      });
  }, [token]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  /* ---------------- PRICE ---------------- */

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const totalAmount = subtotal;

  /* ---------------- CONFETTI ---------------- */

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("online");

  /* ---------------- LOAD RAZORPAY SCRIPT ---------------- */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  /* ---------------- CONFETTI ---------------- */

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      angle: 60,
      spread: 80,
      origin: { x: 0 },
      colors: ['#EE1C47', '#000000', '#F8BBD0']
    });

    confetti({
      particleCount: 150,
      angle: 120,
      spread: 80,
      origin: { x: 1 },
      colors: ['#EEEEEE', '#EE1C47', '#F8BBD0']
    });
  };

  /* ---------------- PLACE ORDER ---------------- */

  const handlePay = async () => {
    if (!user) return;

    if (!isGift && !selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    if (isGift && (!giftName || !giftPhone || !giftAddress)) {
      toast.error("Please fill all recipient details to send as gift.");
      return;
    }

    try {
      setLoading(true);

      const finalName = isGift ? giftName : selectedAddress?.name || user.name;

      const finalPhone = isGift
        ? giftPhone
        : selectedAddress?.phone || user.phone || "";

      const finalAddress = isGift
        ? {
            line1: giftAddress,
            city: "Delhi",
            state: "Delhi",
            zip: "110001",
          }
        : {
            line1: selectedAddress!.addressLine1,
            line2: selectedAddress!.addressLine2 || "",
            landmark: selectedAddress!.landmark,
            city: selectedAddress!.city,
            state: selectedAddress!.state,
            zip: selectedAddress!.postalCode,
          };

      const payload = {
        customerName: finalName,
        phone: finalPhone,
        address: finalAddress,

        deliveryType: deliveryOption, // standard or scheduled
        deliveryDate: deliveryOption === 'scheduled' ? deliveryDate : null,
        deliveryTime: deliveryOption === 'scheduled' ? deliveryTime : 'ASAP',

        isGift,

        specialRequest,

        gift: isGift
              ? {
                  name: giftName,
                  phone: giftPhone,
                  address: giftAddress,
                  from: giftFrom || null,
                  includeGiftCard,
                  giftMessage: includeGiftCard ? giftMessage : null,
                }
              : null,

        items: items.map((i) => ({
          productId: i.custom ? null : i._id,
          isCustom: Boolean(i.custom),

          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          hasPremiumWrapping: i.hasPremiumWrapping || false,
          vase: i.vase || null,

          custom: i.custom || null,
        })),

        subtotal,
        totalAmount,

        paymentMethod: paymentMethod,
      };

      const { data } = await axios.post(`${API}/orders`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (paymentMethod === "online") {
        const { razorpayOrder, order } = data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Mangalam Florist",
          description: "Bouquet Purchase",
          order_id: razorpayOrder.id,
          handler: async (response: any) => {
            try {
              setLoading(true);
              const verifyRes = await axios.post(
                `${API}/orders/verify`,
                {
                  ...response,
                  orderId: order._id,
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (verifyRes.data.order) {
                setSuccessOrderId(verifyRes.data.order.orderId);
                fireConfetti();
                clearCart();
                setTimeout(() => navigate("/explore"), 5000);
              }
            } catch (err) {
              console.error("Verification failed", err);
              toast.error("Payment verification failed. Please contact support.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: finalName,
            contact: finalPhone,
            email: user.email,
          },
          theme: {
            color: "#EE1C47",
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        /* 🎉 SUCCESS COD */
        setSuccessOrderId(data.orderId);
        fireConfetti();
        clearCart();

        setTimeout(() => {
          navigate("/explore");
        }, 5000);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.msg || "Failed to place order.");
    } finally {
      if (paymentMethod === "cod") {
        setLoading(false);
      }
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-32 pb-20 px-4 md:px-6">
      
      {/* HEADER / BREADCRUMBS */}
      <div className="max-w-[120rem] mx-auto mb-10 overflow-hidden px-2 lg:px-8">
        <nav className="flex text-[10px] sm:text-[11px] text-gray-400 border-b border-gray-200/50 pb-4 font-bold uppercase tracking-widest">
          <Link to="/" className="hover:text-black transition-colors shrink-0">Home</Link>
          <span className="mx-2 shrink-0">/</span>
          <Link to="/cart" className="hover:text-black transition-colors shrink-0">Shopping Cart</Link>
          <span className="mx-2 shrink-0">/</span>
          <span className="text-gray-900 truncate">Secure Checkout</span>
        </nav>
      </div>

      <div className="max-w-[120rem] mx-auto px-2 lg:px-8 flex flex-col xl:grid xl:grid-cols-[1.5fr_1fr] gap-10 xl:gap-16">
        
        {/* ================= SUMMARY (TOP ON MOBILE) ================= */}
        <div className="xl:order-2">
          <div
            className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 lg:sticky lg:top-32 flex flex-col overflow-hidden"
          >
             <div className="bg-[#FAF9F6] border-b border-gray-100 p-8 text-center relative">
                <ShieldCheck size={40} className="mx-auto text-green-500 bg-white rounded-full shadow-sm mb-4" strokeWidth={1.5}/>
                <h2 className="font-serif italic text-2xl md:text-3xl text-gray-900 tracking-tight">
                   Order Summary
                </h2>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-2">Final Review</p>
             </div>

             <div className="p-8 space-y-6">
                
                {/* ITEMS LIST */}
                <div className="space-y-4 text-sm font-medium border-b border-gray-100 pb-6 max-h-[30vh] overflow-y-auto scrollbar-hide pr-2">
                    {items.map((i, idx) => (
                      <div key={`${i._id}-${idx}`} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                        <div className="flex justify-between items-start text-gray-600 gap-4 mb-1">
                          <span className="leading-snug text-sm font-bold text-gray-800">{i.name} <span className="text-gray-400 ml-1">× {i.quantity}</span></span>
                          <span className="font-bold text-gray-900 shrink-0">₹{(i.price * i.quantity).toLocaleString()}</span>
                        </div>
                        {i.vase && (
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2">
                             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                             With {i.vase.name}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* PRICING BREAKDOWN */}
                <div className="space-y-3 text-[13px] font-medium border-b border-gray-100 pb-6">
                   <div className="flex justify-between items-center text-gray-500">
                     <span>Subtotal</span>
                     <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString()}</span>
                   </div>

                   <div className="flex justify-between items-center text-gray-500">
                     <span>Taxes (Included)</span>
                     <span className="text-gray-900 font-bold">₹0</span>
                   </div>
                  </div>


                {/* FINAL TOTAL */}
                <div className="flex justify-between items-end pt-2">
                   <span className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Total to Pay</span>
                   <span className="font-sans font-bold text-4xl lg:text-[2.5rem] text-gray-900 tracking-tight">₹{totalAmount.toLocaleString()}</span>
                </div>

                <button
                  onClick={handlePay}
                  disabled={loading || items.length === 0}
                  className="mt-6 w-full py-4 md:py-5 bg-black text-white rounded-[1.25rem] md:rounded-[1.5rem] uppercase tracking-widest text-[11px] md:text-xs font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 hidden md:flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {loading ? (
                     "Processing Security..."
                  ) : (
                     <>Confirm Order <ArrowRight size={16} strokeWidth={2.5}/></>
                  )}
                </button>
                
                <p className="text-center text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-4 flex items-center justify-center gap-1.5">
                   <ShieldCheck size={12}/> Guaranteed freshness
                </p>

             </div>

          </div>
        </div>

        {/* ================= LEFT / FORMs (BOTTOM ON MOBILE) ================= */}
        <div className="space-y-8 md:space-y-12 xl:order-1">
          
          <div className="flex items-end justify-between mb-4">
             <h1 className="font-serif italic text-4xl md:text-5xl lg:text-[4rem] tracking-tight text-gray-900 leading-[1.1]">
               Checkout
             </h1>
          </div>

          {/* 1. ADDRESS */}
          {!isGift && (
            <section className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-gray-100 p-6 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#EE1C47]" />
              
              <div className="flex items-center justify-between gap-3 mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-[#EE1C47]">
                      <MapPin size={20} strokeWidth={2}/>
                    </div>
                    <h2 className="font-serif italic text-2xl md:text-3xl text-gray-900">Delivery Address</h2>
                 </div>
                 <div className="hidden md:flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Swipe for more</span>
                 </div>
              </div>

              {addresses.length === 0 || showAddressForm ? (
                <div className="bg-[#FBFBFB] border border-gray-200 rounded-[1.5rem] p-6 md:p-8 relative">
                   {addresses.length > 0 && (
                     <button onClick={() => setShowAddressForm(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black text-xs font-bold uppercase tracking-widest">Cancel</button>
                   )}
                   <h3 className="font-serif italic text-2xl text-gray-900 mb-6">{addresses.length === 0 ? "Add Delivery Address" : "New Address"}</h3>
                   <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Label (e.g. Home)</label>
                        <input value={newAddress.label} onChange={(e) => setNewAddress({...newAddress, label: e.target.value})} className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm bg-white" placeholder="Home, Office..." />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Recipient Name</label>
                        <input value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm bg-white" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Phone</label>
                        <input value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value.replace(/\D/g, "")})} inputMode="numeric" className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm bg-white" placeholder="10-digit number" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Address Line 1</label>
                        <input value={newAddress.addressLine1} onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})} className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm bg-white" placeholder="House/Flat No., Building Name" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Address Line 2 (Optional)</label>
                        <input value={newAddress.addressLine2} onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})} className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm bg-white" placeholder="Street, Sector, Area" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Landmark</label>
                        <input value={newAddress.landmark} onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})} className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm bg-white" placeholder="Near Apollo Hospital" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Pincode (Delhi Only)</label>
                        <input value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value.replace(/\D/g, "")})} inputMode="numeric" className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm bg-white" placeholder="1100xx" />
                      </div>
                   </div>
                   <div className="mt-8 flex justify-end">
                      <button 
                        onClick={handleAddAddress}
                        disabled={addingAddress}
                        className="bg-black text-white px-8 py-3.5 rounded-full hover:bg-gray-800 transition-all shadow-md text-[11px] uppercase tracking-widest font-bold disabled:opacity-50"
                      >
                         {addingAddress ? "Saving..." : "Save Address"}
                      </button>
                   </div>
                </div>
              ) : (
                <div className="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto pb-4 md:pb-0 no-scrollbar snap-x snap-mandatory">
                  {addresses.map((addr) => (
                    <button
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`text-left rounded-3xl border p-6 transition-all relative overflow-hidden group min-w-[280px] md:min-w-0 snap-center ${
                        selectedAddressId === addr._id
                          ? "border-[#EE1C47] bg-white ring-4 ring-pink-50 shadow-md"
                          : "border-gray-200 bg-[#FBFBFB] hover:border-gray-300 hover:bg-white"
                      }`}
                    >
                      {selectedAddressId === addr._id && (
                         <div className="absolute top-4 right-4 text-[#EE1C47]">
                           <CheckCircle2 size={24} fill="#FFF0F3" strokeWidth={1.5}/>
                         </div>
                      )}

                      <p className="font-sans font-bold text-gray-900 text-lg mb-1">{addr.name}</p>
                      <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-4">{addr.phone}</p>
                      
                      <div className="text-sm font-medium text-gray-600 leading-relaxed max-w-[90%]">
                        <p>{addr.addressLine1}</p>
                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                        <p className="text-gray-400 mt-1 italic text-xs">Landmark: {addr.landmark}</p>
                        <p className="mt-2 font-bold text-gray-800">{addr.city}, {addr.state} — {addr.postalCode}</p>
                      </div>
                    </button>
                  ))}
                  
                  {/* ADD NEW BTN */}
                  <button 
                    onClick={() => setShowAddressForm(true)}
                    className="text-left rounded-3xl border border-dashed border-gray-300 p-6 transition-all bg-[#FBFBFB] hover:border-gray-400 hover:bg-white flex flex-col items-center justify-center min-h-[160px] min-w-[200px] md:min-w-0 group snap-center"
                  >
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors mb-3">
                        <span className="text-xl">+</span>
                     </div>
                     <span className="font-sans font-bold text-gray-600 text-sm">Add New Address</span>
                  </button>
                </div>
              )}
            </section>
          )}

          {/* 1. OR GIFT */}
          <section className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-gray-100 p-6 md:p-10 relative overflow-hidden overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-500 ${isGift ? 'bg-purple-500' : 'bg-gray-100'}`} />
            
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                 <input
                   type="checkbox"
                   className="sr-only"
                   checked={isGift}
                   onChange={(e) => setIsGift(e.target.checked)}
                 />
                 <div className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 shadow-inner ${isGift ? 'bg-purple-500' : 'bg-gray-200'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform shadow-md ${isGift ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isGift ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
                   <Gift size={20} strokeWidth={2}/>
                 </div>
                 <div>
                    <span className="font-serif italic text-2xl md:text-3xl text-gray-900 block group-hover:text-purple-600 transition-colors">Surprise Someone</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mt-1">Send this order directly as a gift</span>
                 </div>
              </div>
            </label>

            {isGift && (
              <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               style={{ transformOrigin: 'top' }}
               className="mt-8 grid md:grid-cols-2 gap-4 origin-top overflow-hidden"
              >
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">Recipient Name</label>
                   <input
                     placeholder="E.g. Priya Sharma"
                     value={giftName}
                     onChange={(e) => setGiftName(e.target.value)}
                     className="w-full bg-[#FBFBFB] border border-gray-200 rounded-xl p-3 md:p-4 text-sm font-medium focus:outline-none focus:border-purple-300 focus:bg-white transition-all shadow-sm"
                   />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">Recipient Phone</label>
                   <input
                     placeholder="+91"
                     value={giftPhone}
                     onChange={(e) => setGiftPhone(e.target.value)}
                     className="w-full bg-[#FBFBFB] border border-gray-200 rounded-xl p-3 md:p-4 text-sm font-medium focus:outline-none focus:border-purple-300 focus:bg-white transition-all shadow-sm"
                   />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">Complete Delivery Address</label>
                   <textarea
                     rows={2}
                     placeholder="House number, Street, Landmark, Area (Delhi Only)"
                     value={giftAddress}
                     onChange={(e) => setGiftAddress(e.target.value)}
                     className="w-full bg-[#FBFBFB] border border-gray-200 rounded-xl p-3 md:p-4 text-sm font-medium resize-none focus:outline-none focus:border-purple-300 focus:bg-white transition-all shadow-sm"
                   />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">From (Optional)</label>
                   <input
                     placeholder="E.g. Secret Admirer, or Your Name"
                     value={giftFrom}
                     onChange={(e) => setGiftFrom(e.target.value)}
                     className="w-full bg-[#FBFBFB] border border-gray-200 rounded-xl p-3 md:p-4 text-sm font-medium focus:outline-none focus:border-purple-300 focus:bg-white transition-all shadow-sm"
                   />
                </div>

                <div className="md:col-span-2 mt-4 pt-4 border-t border-purple-100">
                   <label className="flex items-center gap-3 cursor-pointer group">
                     <div className="relative flex items-center justify-center">
                       <input
                         type="checkbox"
                         className="sr-only"
                         checked={includeGiftCard}
                         onChange={(e) => setIncludeGiftCard(e.target.checked)}
                       />
                       <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${includeGiftCard ? 'bg-purple-500' : 'bg-gray-200'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${includeGiftCard ? 'translate-x-4' : 'translate-x-0'}`} />
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">Add Handwritten Gift Card</span>
                        <span className="bg-purple-50 text-purple-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Complimentary</span>
                     </div>
                   </label>

                   <AnimatePresence>
                     {includeGiftCard && (
                       <motion.div
                         initial={{ opacity: 0, height: 0, marginTop: 0 }}
                         animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                         exit={{ opacity: 0, height: 0, marginTop: 0 }}
                         className="overflow-hidden"
                       >
                         <textarea
                           rows={3}
                           placeholder="Write your beautiful message here... (Max 200 characters)"
                           maxLength={200}
                           value={giftMessage}
                           onChange={(e) => setGiftMessage(e.target.value)}
                           className="w-full bg-purple-50/30 border border-purple-100 rounded-xl p-4 text-sm font-medium italic resize-none focus:outline-none focus:border-purple-300 focus:bg-white transition-all shadow-sm"
                         />
                         <p className="text-[9px] text-gray-400 mt-1 ml-1 uppercase font-bold tracking-widest text-right">
                           {giftMessage.length}/200
                         </p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </motion.div>
            )}
          </section>



          {/* 3. SPECIAL REQUEST */}
          <section className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-gray-100 p-6 md:p-10 relative overflow-hidden">
            
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                 <MessageSquare size={20} strokeWidth={2}/>
               </div>
               <h2 className="font-serif italic text-2xl md:text-3xl text-gray-900">Special Notes</h2>
            </div>

            <textarea
              rows={3}
              placeholder="Any special instructions for the artisan? (e.g., leave at front door, avoid lilies, call upon arrival...)"
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              className="w-full bg-[#FBFBFB] border border-gray-200 rounded-2xl p-5 text-sm font-medium resize-none focus:outline-none focus:border-blue-300 focus:bg-white transition-all shadow-sm"
            />
          </section>

          {/* 4. PAYMENT METHOD */}
          <section className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-gray-100 p-6 md:p-10 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                 <ShieldCheck size={20} strokeWidth={2}/>
               </div>
               <h2 className="font-serif italic text-2xl md:text-3xl text-gray-900">Secure Online Payment</h2>
            </div>

            <div className="max-w-md">
               <div
                 className="text-left rounded-3xl border p-6 transition-all relative overflow-hidden border-[#EE1C47] bg-white ring-4 ring-pink-50 shadow-md"
               >
                 <div className="flex items-center justify-between mb-4">
                    <span className="font-sans font-bold text-gray-900 text-lg">Razorpay Secure</span>
                    <CheckCircle2 size={24} className="text-[#EE1C47]" />
                 </div>
                 <p className="text-xs text-gray-500 leading-relaxed font-medium">
                   Pay securely using UPI, Credit/Debit Cards, or Netbanking. Your payment information is encrypted and never stored on our servers.
                 </p>
                 <div className="mt-4 flex gap-3">
                    <div className="h-6 w-10 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">UPI</div>
                    <div className="h-6 w-10 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">CARD</div>
                    <div className="h-6 w-10 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">NET</div>
                 </div>
               </div>
            </div>
          </section>

        </div>


      </div>

      {/* ---------------- SUCCESS MODAL (ULTRA PREMIUM) ---------------- */}

      {successOrderId && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-3xl z-[999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="bg-white rounded-[3rem] p-10 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 text-center max-w-lg w-full relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#EE1C47] to-[#F8BBD0]" />
            
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8 border-[6px] border-green-100">
               <CheckCircle2 size={40} strokeWidth={2}/>
            </div>
            
            <h2 className="font-serif italic text-4xl md:text-5xl mb-4 text-gray-900 tracking-tight">Order Placed</h2>

            <p className="font-sans text-lg font-medium text-gray-500 mb-8 max-w-[80%] mx-auto leading-relaxed">
              Your stunning floral arrangement is being prepared by our artisans.
            </p>

            <div className="bg-[#FAF9F6] border border-gray-100 rounded-[1.5rem] p-6 mb-8">
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Order Reference</p>
              <p className="font-mono text-xl md:text-2xl font-bold tracking-widest text-[#EE1C47]">{successOrderId}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
              Redirecting you magically...
            </div>
          </motion.div>
        </div>
      )}

      {/* MOBILE STICKY PLACE ORDER */}
      {!successOrderId && items.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 z-50 flex gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-6">
           <div className="flex flex-col justify-center">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-tight mb-0.5">Payable</p>
              <p className="font-sans font-bold text-xl text-gray-900 leading-tight">₹{totalAmount.toLocaleString()}</p>
           </div>
           <button 
             onClick={handlePay}
             disabled={loading}
             className="flex-1 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 shadow-lg transition-colors h-14 flex items-center justify-center gap-2"
           >
              {loading ? "Processing..." : <>Confirm Order <ArrowRight size={16} strokeWidth={2.5}/></>}
           </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
