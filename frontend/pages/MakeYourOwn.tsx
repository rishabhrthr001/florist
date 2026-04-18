import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, ShoppingBag, ChevronUp, ChevronDown, Check, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ComponentItem } from "../types";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import axios from "axios";
import API from "@/config";
import { optimizeCloudinaryUrl } from "../lib/cloudinary";
import { useQuery } from "@tanstack/react-query";

/* ================= CACHE ================= */
const BUILDER_CACHE_KEY = "builder_items_cache_v1";

const getBuilderCache = () => {
  try {
    const cached = sessionStorage.getItem(BUILDER_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
};

const setBuilderCache = (data: any) => {
  try {
    sessionStorage.setItem(BUILDER_CACHE_KEY, JSON.stringify(data));
  } catch (e) { console.error("Cache save error", e); }
};

const MakeYourOwn: React.FC = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedBase, setSelectedBase] = useState<ComponentItem | null>(null);
  const [selectedRibbon, setSelectedRibbon] = useState<ComponentItem | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<ComponentItem | null>(null);

  const [additions, setAdditions] = useState<{ item: ComponentItem; qty: number }[]>([]);

  const [instructions, setInstructions] = useState("");
  const [flowerSearch, setFlowerSearch] = useState("");
  const [isSummaryMobileOpen, setIsSummaryMobileOpen] = useState(false);
  
  const [selectedVase, setSelectedVase] = useState<any | null>(null);

  /* ================= FETCH ENABLED BOUQUET ITEMS ================= */
  const { data: builderData, isLoading } = useQuery({
    queryKey: ["builder_items"],
    queryFn: async () => {
      const [catRes, allProdRes, customRes] = await Promise.all([
        axios.get(`${API}/category`),
        axios.get(`${API}/product?limit=1000`),
        axios.get(`${API}/custom-bouquet`)
      ]);

      const categories = catRes.data;
      const allSystemProducts = allProdRes.data.products || [];
      
      const typeMapping = {
        flower: ['flower', 'stem'],
        base: ['base', 'basket', 'box'],
        filler: ['filler', 'gyp', 'greenery'],
        ribbon: ['ribbon', 'bow'],
        paper: ['paper', 'wrap'],
        chocolate: ['chocolate', 'sweet', 'cake'],
        vase: ['vase', 'vessel', 'pot', 'glass']
      };

      const allMappedProducts: ComponentItem[] = [];

      categories.forEach((cat: any) => {
        const lowerName = cat.name.toLowerCase();
        let builderType = '';
        for (const [type, keywords] of Object.entries(typeMapping)) {
          if (keywords.some(k => lowerName.includes(k))) {
            builderType = type;
            break;
          }
        }

        if (builderType) {
          const products = allSystemProducts.filter((p: any) => p.categoryId && (p.categoryId._id === cat._id || p.categoryId === cat._id));
          products.forEach((p: any) => {
            allMappedProducts.push({
              id: p._id,
              name: p.name,
              price: p.price,
              image: (p.images && p.images[0]) || "/placeholder.jpg",
              type: builderType,
              isOutOfStock: p.isOutOfStock || false,
            });
          });
        }
      });

      const customItems: ComponentItem[] = (customRes.data || [])
        .map((item: any) => {
          if (item.product) {
            return {
              id: item.product._id,
              name: item.product.name,
              price: item.product.price,
              image: (item.product.images && item.product.images[0]) || "/placeholder.jpg",
              type: item.type,
              isOutOfStock: item.product.isOutOfStock || false,
            };
          }
          if (item.name) {
            return {
              id: item._id,
              name: item.name,
              price: item.price,
              image: item.image || "/placeholder.jpg",
              type: item.type,
              isOutOfStock: item.isOutOfStock || false,
            };
          }
          return null;
        })
        .filter((i: any): i is ComponentItem => i !== null);

      const merged = [...allMappedProducts, ...customItems];
      const uniqueItems = Array.from(new Map(merged.map(item => [item.id, item])).values());
      const vaseList = uniqueItems.filter(i => i.type === 'vase' || i.type === 'base');
      const mappedVases = vaseList.map(v => ({
         _id: v.id,
         name: v.name,
         price: v.price,
         images: [v.image],
         isOutOfStock: v.isOutOfStock
      }));

      const result = { items: uniqueItems, vases: mappedVases };
      setBuilderCache(result);
      return result;
    },
    initialData: getBuilderCache() || undefined,
  });

  const items = builderData?.items || [];
  const vases = builderData?.vases || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ================= ADD / REMOVE ================= */

  const handleAdd = (item: ComponentItem) => {
    if (item.type === "base") {
      if (selectedBase?.id === item.id) setSelectedBase(null);
      else setSelectedBase(item);
    }
    else if (item.type === "ribbon") {
      if (selectedRibbon?.id === item.id) setSelectedRibbon(null);
      else setSelectedRibbon(item);
    }
    else if (item.type === "paper") {
      if (selectedPaper?.id === item.id) setSelectedPaper(null);
      else setSelectedPaper(item);
    }
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
    (selectedPaper?.price || 0) +
    (selectedVase?.price || 0) +
    additions.reduce((acc, curr) => acc + curr.item.price * curr.qty, 0);

  /* ================= FINALIZE ================= */

  const finalizeBouquet = () => {
    const hasItems = selectedBase || selectedPaper || selectedRibbon || selectedVase || additions.length > 0;
    if (!hasItems) {
      toast.error("Please add at least one item to your bouquet 🌸");
      return;
    }

    const cartImage = selectedBase ? selectedBase.image : 
                      (additions.length > 0 ? additions[0].item.image : 
                      (selectedPaper ? selectedPaper.image : 
                      (selectedVase ? selectedVase.images[0] : "/placeholder.jpg")));

    addToCart({
      _id: `custom-${Date.now()}`,
      name: "Customized Bouquet",
      price: totalPrice,
      image: cartImage,
      quantity: 1,
      categorySlug: 'bouquets',
      custom: {
        base: selectedBase,
        paper: selectedPaper,
        ribbon: selectedRibbon,
        additions,
        message: instructions,
      },
      vase: selectedVase ? {
        id: selectedVase._id,
        name: selectedVase.name,
        price: selectedVase.price,
        image: selectedVase.images[0]
      } : undefined
    } as any);

    toast.success("Custom bouquet added to cart 💐");
    setSelectedBase(null);
    setSelectedPaper(null);
    setSelectedRibbon(null);
    setAdditions([]);
    setInstructions("");
  };

  const steps = [
    { title: "1. Select Your Base", type: "base" },
    { title: "2. Choose Your Flowers", type: "flower" },
    { title: "3. Choose Fillers", type: "filler" },
    { title: "4. Add Sweetness", type: "chocolate" },
    { title: "5. Choose Paper Type", type: "paper" },
    { title: "6. The Final Ribbon", type: "ribbon" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-32">
      <div className="max-w-full px-4 md:px-8 xl:px-12 mb-8">
        <nav className="flex text-[10px] sm:text-[11px] text-gray-400 border-b border-gray-200/50 pb-4 font-bold uppercase tracking-widest">
          <Link to="/" className="hover:text-black transition-colors shrink-0">Home</Link>
          <span className="mx-2 shrink-0">/</span>
          <span className="text-gray-900 truncate">Artisan Builder</span>
        </nav>
      </div>

      <div className="w-full px-4 md:px-10 xl:px-16 grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-10 xl:gap-16 md:items-start">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-14">
          {steps.map((step, idx) => (
            <StepCarousel 
               key={idx} step={step} items={items} 
               selectedBase={selectedBase} selectedRibbon={selectedRibbon} selectedPaper={selectedPaper}
               additions={additions} handleAdd={handleAdd} flowerSearch={flowerSearch} setFlowerSearch={setFlowerSearch} 
            />
          ))}
          <section className="bg-white rounded-[1.5rem] p-10 shadow-sm border border-gray-100">
            <h3 className="font-serif italic text-3xl text-gray-900 mb-2 tracking-tight">Special Instructions</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-8">Any wrapping style, color preference or notes?</p>
            <textarea
              value={instructions} onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g. Wrap it in dark paper, keep it minimalistic..."
              rows={4}
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-2xl p-6 text-sm font-medium resize-none focus:outline-none focus:border-black focus:bg-white transition-all shadow-sm"
            />
          </section>
        </motion.div>

        <div className="sticky top-32 z-10 hidden lg:block self-start">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col gap-8 min-w-0">
             <h2 className="font-serif italic text-4xl text-gray-900 tracking-tight">Items Added</h2>
             <div className="min-h-[100px] flex flex-col justify-center border-b border-gray-100 pb-8">
               <SummaryContent {...{ selectedBase, selectedRibbon, selectedPaper, additions, handleAdd, handleRemove, clearBase: () => setSelectedBase(null), clearRibbon: () => setSelectedRibbon(null), clearPaper: () => setSelectedPaper(null), selectedVase, clearVase: () => setSelectedVase(null), }} />
             </div>
             <div className="space-y-6">
               <div className="flex justify-between items-baseline">
                 <span className="font-serif italic text-3xl text-gray-900">Total</span>
                 <span className="font-sans font-black text-3xl text-gray-900 leading-none">₹{totalPrice.toLocaleString()}</span>
               </div>
               <button 
                 disabled={!(selectedBase || selectedPaper || selectedRibbon || selectedVase || additions.length > 0)}
                 onClick={finalizeBouquet}
                 className="w-full py-5 bg-[#A1A1A1] text-white rounded-full uppercase tracking-widest text-xs font-bold hover:bg-gray-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
               >
                 <ShoppingBag size={14} strokeWidth={2.5}/> Add to Cart
               </button>
             </div>
          </motion.div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex flex-col">
        <AnimatePresence>
          {isSummaryMobileOpen && (
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} className="bg-white rounded-t-[2.5rem] p-8 shadow-[0_-15px_60px_rgba(0,0,0,0.15)] border-t border-gray-100 overflow-y-auto max-h-[70vh]">
              <h2 className="font-serif italic text-2xl text-gray-900 border-b border-gray-100 pb-4 mb-4">Composition</h2>
              <SummaryContent selectedBase={selectedBase} selectedRibbon={selectedRibbon} selectedPaper={selectedPaper} additions={additions} handleAdd={handleAdd} handleRemove={handleRemove} clearBase={() => setSelectedBase(null)} clearRibbon={() => setSelectedRibbon(null)} clearPaper={() => setSelectedPaper(null)} selectedVase={selectedVase} clearVase={() => setSelectedVase(null)} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 px-6 flex items-center justify-between cursor-pointer pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]" onClick={() => setIsSummaryMobileOpen(!isSummaryMobileOpen)}>
           <div className="flex flex-col flex-1">
             <div className="flex items-center gap-1.5">
               <p className="text-[10px] uppercase font-bold tracking-widest text-[#EE1C47]">Total Price</p>
               <ChevronUp size={12} strokeWidth={3} className={`text-gray-400 transition-transform ${isSummaryMobileOpen ? 'rotate-180' : ''}`} />
             </div>
             <p className="font-sans font-bold text-xl leading-tight text-gray-900">₹{totalPrice.toLocaleString()}</p>
           </div>
           <button 
             disabled={!(selectedBase || selectedPaper || selectedRibbon || selectedVase || additions.length > 0)}
             onClick={(e) => { e.stopPropagation(); finalizeBouquet(); }}
             className="py-4 px-8 bg-black text-white rounded-full uppercase tracking-widest text-[10px] font-bold hover:bg-gray-800 transition-all disabled:opacity-40 shrink-0 shadow-lg"
           >Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

const SummaryContent = ({ selectedBase, selectedRibbon, selectedPaper, additions, handleAdd, handleRemove, clearBase, clearRibbon, clearPaper, selectedVase, clearVase }: any) => (
  <div className="space-y-4">
    {selectedBase && (
      <div className="flex justify-between items-center text-sm font-bold text-gray-900 bg-white border border-gray-100 p-4 rounded-xl">
        <span className="leading-tight">{selectedBase.name}</span>
        <div className="flex items-center gap-2">
          <span className="font-black text-xs text-gray-400">₹{selectedBase.price.toLocaleString()}</span>
          <button onClick={clearBase} className="p-1 text-red-500 hover:text-red-700 transition-colors"><Trash2 size={14} strokeWidth={2.5}/></button>
        </div>
      </div>
    )}
    {!selectedBase && additions.length === 0 && !selectedPaper && !selectedRibbon && !selectedVase && (
      <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-black text-center py-4">Start crafting your bouquet</p>
    )}
    {additions.length > 0 && (
       <div className="space-y-4">
         {additions.map((a: any) => (
           <div key={a.item.id} className="flex justify-between items-center border border-gray-100 p-4 rounded-xl bg-white">
             <span className="text-sm font-bold text-gray-900 leading-tight">{a.item.name} x {a.qty}</span>
             <div className="flex items-center gap-2">
               <span className="font-black text-xs text-gray-400">₹{(a.item.price * a.qty).toLocaleString()}</span>
               <button onClick={() => handleRemove(a.item.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14} strokeWidth={2.5}/></button>
             </div>
           </div>
         ))}
       </div>
    )}
    {selectedPaper && (
      <div className="flex justify-between items-center text-sm font-bold text-gray-900 bg-white border border-gray-100 p-4 rounded-xl">
        <span className="leading-tight">{selectedPaper.name}</span>
        <div className="flex items-center gap-2">
          <span className="font-black text-xs text-gray-400">₹{selectedPaper.price.toLocaleString()}</span>
          <button onClick={clearPaper} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14} strokeWidth={2.5}/></button>
        </div>
      </div>
    )}
    {selectedRibbon && (
      <div className="flex justify-between items-center text-sm font-bold text-gray-900 bg-white border border-gray-100 p-4 rounded-xl">
        <span className="leading-tight">{selectedRibbon.name}</span>
        <div className="flex items-center gap-2">
          <span className="font-black text-xs text-gray-400">₹{selectedRibbon.price.toLocaleString()}</span>
          <button onClick={clearRibbon} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14} strokeWidth={2.5}/></button>
        </div>
      </div>
    )}
  </div>
);

const StepCarousel = ({ step, items, selectedBase, selectedRibbon, selectedPaper, additions, handleAdd, flowerSearch, setFlowerSearch }: any) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth;
      containerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };
  let displayItems = items.filter((i: any) => i.type === step.type);
  if (step.type === 'flower' && flowerSearch) {
    displayItems = displayItems.filter((i: any) => i.name && i.name.toLowerCase().includes(flowerSearch.toLowerCase()));
  }

  return (
    <section className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
         <div className="flex items-center gap-4">
           <span className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-sans font-bold shrink-0">{step.title.split('.')[0]}</span>
           <h2 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-tight">{step.title.split('. ')[1]}</h2>
         </div>
         {step.type === 'flower' && (
           <div className="relative mt-2 sm:mt-0 w-full sm:w-auto">
             <input type="text" placeholder="Search favorite flower..." value={flowerSearch} onChange={(e) => setFlowerSearch(e.target.value)} className="pl-5 pr-12 py-3.5 text-xs border border-gray-200 rounded-full focus:outline-none focus:border-black bg-white w-full sm:w-72 transition-all shadow-sm font-medium" />
             <Search size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
           </div>
          )}
      </div>
      <div className="relative w-fit ml-0">
        {displayItems.length > 5 && (
          <><button onClick={(e) => { e.preventDefault(); e.stopPropagation(); scroll('left'); }} className="flex absolute -left-10 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white border border-gray-100 rounded-full items-center justify-center shadow-md hover:bg-gray-50 transition-all"><ChevronLeft size={20}/></button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); scroll('right'); }} className="flex absolute -right-10 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white border border-gray-100 rounded-full items-center justify-center shadow-md hover:bg-gray-50 transition-all"><ChevronRight size={20}/></button></>
        )}
        <div ref={containerRef} className="flex overflow-x-auto gap-8 snap-x snap-mandatory no-scrollbar scroll-smooth py-6 px-1 w-full max-w-[1000px]">
          {displayItems.length === 0 && <div className="w-full py-16 text-center text-xs text-gray-300 uppercase tracking-[0.2em] font-black">No items here</div>}
          {displayItems.map((item: any) => {
            const isSelected = selectedBase?.id === item.id || selectedRibbon?.id === item.id || selectedPaper?.id === item.id;
            const addedItem = additions.find((a: any) => a.item.id === item.id);
            return (
              <motion.div whileHover={item.isOutOfStock ? {} : { y: -5, scale: 1.02 }} key={item.id} onClick={() => !item.isOutOfStock && handleAdd(item)} className={`flex-none w-[180px] snap-start bg-transparent transition-all group flex flex-col items-center text-center cursor-pointer ${item.isOutOfStock ? "opacity-50 grayscale cursor-not-allowed" : isSelected ? "ring-1 ring-black/10 p-3 rounded-2xl" : ""}`}>
                <div className="w-[120px] h-[120px] mb-4 relative flex items-center justify-center shrink-0">
                   <img src={optimizeCloudinaryUrl(item.image, 400, true)} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700" alt={item.name} loading="lazy" />
                   {isSelected && <div className="absolute -top-1 -right-1 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-md z-10 scale-90"><Check size={12} strokeWidth={3} /></div>}
                   {addedItem && (item.type !== 'base' && item.type !== 'ribbon' && item.type !== 'paper') && <div className="absolute -top-1 -right-1 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-md text-[11px] font-bold z-10 scale-90">{addedItem.qty}</div>}
                </div>
                <div className="w-full mt-auto px-2">
                   <h3 className="font-serif font-bold text-[12px] md:text-[14px] text-gray-900 mb-1 leading-tight line-clamp-2 min-h-[2.5rem] flex items-center justify-center">{item.name}</h3>
                   <p className="font-sans font-black text-gray-900 text-[11px] md:text-[13px]">₹{item.price.toLocaleString()}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MakeYourOwn;
