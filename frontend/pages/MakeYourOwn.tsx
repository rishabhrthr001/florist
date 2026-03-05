import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, ShoppingBag, ChevronUp, ChevronDown, Check, Trash2 } from "lucide-react";
import { ComponentItem } from "../types";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import axios from "axios";
import API from "@/config";

const MakeYourOwn: React.FC = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedBase, setSelectedBase] = useState<ComponentItem | null>(null);
  const [selectedRibbon, setSelectedRibbon] = useState<ComponentItem | null>(
    null,
  );

  const [additions, setAdditions] = useState<
    { item: ComponentItem; qty: number }[]
  >([]);

  const [instructions, setInstructions] = useState("");
  const [isSummaryMobileOpen, setIsSummaryMobileOpen] = useState(false);

  const [items, setItems] = useState<ComponentItem[]>([]);

  /* ================= FETCH ENABLED BOUQUET ITEMS ================= */

  useEffect(() => {
    axios
      .get(`${API}/custom-bouquet`)
      .then((res) => {
        const mapped: ComponentItem[] = res.data
          .map((item: any) => {
            // flower / chocolate → must have a valid product
            if (item.type === "flower" || item.type === "chocolate") {
              if (!item.product) return null; // Skip if product is null
              return {
                id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                image: (item.product.images && item.product.images[0]) || "/placeholder.jpg",
                type: item.type,
              };
            }

            // base / ribbon → embedded
            return {
              id: item._id,
              name: item.name,
              price: item.price,
              image: item.image || "/placeholder.jpg",
              type: item.type,
            };
          })
          .filter(Boolean); // Remove null entries (deleted products)

        setItems(mapped);
      })
      .catch((err) => {
        console.error("BUILDER FETCH ERROR:", err);
        toast.error("Failed to load bouquet builder");
      });
  }, []);

  /* ================= ADD / REMOVE ================= */

  const handleAdd = (item: ComponentItem) => {
    if (item.type === "base") setSelectedBase(item);
    else if (item.type === "ribbon") setSelectedRibbon(item);
    else {
      setAdditions((prev) => {
        const existing = prev.find((a) => a.item.id === item.id);

        if (existing)
          return prev.map((a) =>
            a.item.id === item.id ? { ...a, qty: a.qty + 1 } : a,
          );

        return [...prev, { item, qty: 1 }];
      });
    }
  };

  const handleRemove = (id: string) => {
    setAdditions((prev) => {
      const existing = prev.find((a) => a.item.id === id);

      if (existing && existing.qty > 1)
        return prev.map((a) =>
          a.item.id === id ? { ...a, qty: a.qty - 1 } : a,
        );

      return prev.filter((a) => a.item.id !== id);
    });
  };

  /* ================= PRICE ================= */

  const totalPrice =
    (selectedBase?.price || 0) +
    (selectedRibbon?.price || 0) +
    additions.reduce((acc, curr) => acc + curr.item.price * curr.qty, 0);

  /* ================= FINALIZE ================= */

  const finalizeBouquet = () => {
    if (!selectedBase) {
      toast.error("Select a bouquet base first 🌸");
      return;
    }

    addToCart({
      _id: `custom-${Date.now()}`,
      name: "Customized Bouquet",
      price: totalPrice,
      image: selectedBase.image,
      quantity: 1,
      custom: {
        base: selectedBase,
        ribbon: selectedRibbon,
        additions,
        message: instructions,
      },
    } as any);

    toast.success("Custom bouquet added to cart 💐");

    setSelectedBase(null);
    setSelectedRibbon(null);
    setAdditions([]);
    setInstructions("");
  };

  const steps = [
    { title: "1. Select Your Base", type: "base" },
    { title: "2. Choose Your Flowers", type: "flower" },
    { title: "3. Add Sweetness", type: "chocolate" },
    { title: "4. The Final Ribbon", type: "ribbon" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-32 px-4 md:px-6">
      
      {/* HEADER / BREADCRUMBS */}
      <div className="max-w-[120rem] mx-auto mb-10 overflow-hidden">
        <nav className="flex text-[10px] sm:text-[11px] text-gray-400 border-b border-gray-200/50 pb-4 font-bold uppercase tracking-widest">
          <Link to="/" className="hover:text-black transition-colors shrink-0">Home</Link>
          <span className="mx-2 shrink-0">/</span>
          <span className="text-gray-900 truncate">Artisan Builder</span>
        </nav>
      </div>

      <div className="max-w-[120rem] mx-auto grid lg:grid-cols-[1.5fr_1fr] gap-10 xl:gap-16">
        {/* ================= LEFT BUILDER ================= */}
        <motion.div
           initial={{ opacity: 0, y: 12 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col gap-12"
        >
          <header>
            <span className="text-[10px] uppercase tracking-widest text-[#EE1C47] font-bold flex items-center gap-2 mb-3">
              <span className="w-1 h-1 rounded-full bg-[#EE1C47] block shadow-sm"></span> The Artisan Builder
            </span>
            <h1 className="font-serif italic text-4xl md:text-5xl lg:text-6xl tracking-tight text-gray-900 leading-[1.1]">
              Create Your Masterpiece
            </h1>
          </header>

          {steps.map((step, idx) => (
            <section key={idx} className="space-y-6">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-3">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-serif italic">
                  {idx + 1}
                </span>
                <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-tight">
                  {step.title}
                </h2>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {items
                  .filter((i) => i.type === step.type)
                  .map((item) => {
                    const isSelected =
                      selectedBase?.id === item.id ||
                      selectedRibbon?.id === item.id;
                      
                    const addedItem = additions.find((a) => a.item.id === item.id);
                    const isAdded = !!addedItem;

                    return (
                      <motion.div
                        whileHover={{ y: -4 }}
                        key={item.id}
                        onClick={() => handleAdd(item)}
                        className={`bg-white p-3 md:p-4 rounded-[1.25rem] md:rounded-[1.5rem] border transition-all duration-300 cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.02)] group hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex flex-col ${
                          isSelected ? "border-black ring-1 ring-black" : "border-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-full aspect-square rounded-xl bg-gray-50 overflow-hidden mb-3 md:mb-4 relative">
                           <img
                             src={item.image}
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                             alt={item.name}
                           />
                           {isSelected && (
                             <div className="absolute top-2 right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center shadow-md">
                                <Check size={10} strokeWidth={3} />
                             </div>
                           )}
                           {isAdded && (item.type !== 'base' && item.type !== 'ribbon') && (
                             <div className="absolute top-2 right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center shadow-md text-[10px] font-bold">
                                {addedItem.qty}
                             </div>
                           )}
                        </div>

                        <div className="mt-auto">
                           <h3 className="font-serif text-[13px] md:text-[15px] leading-tight text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                           <p className="font-sans font-bold text-gray-900 text-[11px] md:text-sm">₹{item.price.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </section>
          ))}

          {/* ---------------- INSTRUCTIONS ---------------- */}
          <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100">
            <h3 className="font-serif italic text-2xl md:text-3xl text-gray-900 mb-2 tracking-tight">Special Instructions</h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6">Any wrapping style, color preference or notes?</p>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g. Wrap it in dark paper, keep it minimalistic..."
              rows={3}
              className="w-full bg-[#FBFBFB] border border-gray-200 rounded-2xl p-4 md:p-5 text-sm font-medium resize-none focus:outline-none focus:border-gray-400 focus:bg-white transition-all shadow-sm"
            />
          </section>
        </motion.div>

        {/* ---------------- DESKTOP SUMMARY ---------------- */}
        <div className="relative z-10 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100 lg:sticky lg:top-32 flex flex-col gap-6"
          >
             <h2 className="font-serif italic text-3xl md:text-4xl text-gray-900 border-b border-gray-100 pb-6 tracking-tight">
                Composition
             </h2>
             <SummaryContent
              {...{
                selectedBase,
                selectedRibbon,
                additions,
                handleAdd,
                handleRemove,
                clearBase: () => setSelectedBase(null),
                clearRibbon: () => setSelectedRibbon(null),
              }}
             />
             <div className="border-t border-gray-100 pt-6 mt-2 space-y-4">
               <div className="flex justify-between items-end border-b border-gray-100 pb-6">
                 <span className="font-serif italic text-2xl text-gray-900">Total Price</span>
                 <span className="font-sans font-bold text-2xl md:text-3xl text-gray-900">₹{totalPrice.toLocaleString()}</span>
               </div>
               <button 
                 disabled={!selectedBase}
                 onClick={finalizeBouquet}
                 className="mt-4 w-full py-4 md:py-5 bg-black text-white rounded-[1.25rem] md:rounded-[1.5rem] uppercase tracking-widest text-[11px] md:text-xs font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:translate-y-0"
               >
                 <ShoppingBag size={14} strokeWidth={2.5}/> Add to Cart
               </button>
             </div>
          </motion.div>
        </div>
      </div>

      {/* ---------------- MOBILE SUMMARY & BOTTOM BAR ---------------- */}
      <div className="lg:hidden fixed bottom-6 inset-x-4 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {isSummaryMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-[2rem] p-6 shadow-[0_15px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-y-auto max-h-[65vh]"
            >
              <h2 className="font-serif italic text-2xl text-gray-900 border-b border-gray-100 pb-4 mb-4">
                 Composition
              </h2>
              <SummaryContent
                selectedBase={selectedBase}
                selectedRibbon={selectedRibbon}
                additions={additions}
                handleAdd={handleAdd}
                handleRemove={handleRemove}
                clearBase={() => setSelectedBase(null)}
                clearRibbon={() => setSelectedRibbon(null)}
             />
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          className="bg-white rounded-full p-2 pl-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => setIsSummaryMobileOpen(!isSummaryMobileOpen)}
        >
           <div className="flex flex-col flex-1">
             <div className="flex items-center gap-1.5">
               <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Total Price</p>
               <ChevronUp size={12} strokeWidth={3} className={`text-gray-400 transition-transform ${isSummaryMobileOpen ? 'rotate-180' : ''}`} />
             </div>
             <p className="font-sans font-bold text-lg leading-tight text-gray-900">₹{totalPrice.toLocaleString()}</p>
           </div>
           <button 
             disabled={!selectedBase}
             onClick={(e) => { e.stopPropagation(); finalizeBouquet(); }}
             className="py-3 px-6 bg-black text-white rounded-full uppercase tracking-widest text-[10px] font-bold hover:bg-gray-800 transition-all disabled:opacity-40 shrink-0 shadow-md"
           >
             Add to Cart
           </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- SUMMARY CONTENT ---------------- */

const SummaryContent = ({
  selectedBase,
  selectedRibbon,
  additions,
  handleAdd,
  handleRemove,
  clearBase,
  clearRibbon,
}: any) => (
  <div className="space-y-4">
    {selectedBase ? (
      <div className="flex justify-between items-center text-[13px] md:text-sm font-medium text-gray-800 bg-[#FBFBFB] border border-gray-100 p-4 rounded-2xl">
        <span className="flex items-center gap-2">
          <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Base</span> 
          {selectedBase.name}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-bold">₹{selectedBase.price.toLocaleString()}</span>
          <button onClick={clearBase} className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors">
            <Trash2 size={12} strokeWidth={2.5}/>
          </button>
        </div>
      </div>
    ) : (
      <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mb-4 text-center">Select a base to start</p>
    )}

    {additions.length > 0 && (
       <div className="space-y-3 bg-[#FBFBFB] border border-gray-100 p-4 rounded-2xl">
         <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold block mb-2">Flowers & Sweets</span>
         {additions.map((a: any) => (
           <div key={a.item.id} className="flex justify-between items-center border-b border-gray-100/50 pb-3 last:border-0 last:pb-0">
             <span className="text-xs font-medium text-gray-800">
               {a.item.name}
             </span>
             <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-1.5 py-1 shadow-sm">
                <button
                  onClick={() => handleRemove(a.item.id)}
                  className="w-5 h-5 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500">
                  <Minus size={10} strokeWidth={2.5}/>
                </button>
                <span className="w-[18px] text-center font-bold text-[10px] text-gray-800">
                  {a.qty}
                </span>
                <button
                  onClick={() => handleAdd(a.item)}
                  className="w-5 h-5 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500">
                  <Plus size={10} strokeWidth={2.5}/>
                </button>
              </div>
           </div>
         ))}
       </div>
    )}

    {selectedRibbon && (
      <div className="flex justify-between items-center text-[13px] md:text-sm font-medium text-gray-800 bg-[#FBFBFB] border border-gray-100 p-4 rounded-2xl">
        <span className="flex items-center gap-2">
          <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Trim</span> 
          {selectedRibbon.name}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-bold">₹{selectedRibbon.price.toLocaleString()}</span>
          <button onClick={clearRibbon} className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors">
            <Trash2 size={12} strokeWidth={2.5}/>
          </button>
        </div>
      </div>
    )}
  </div>
);

export default MakeYourOwn;
