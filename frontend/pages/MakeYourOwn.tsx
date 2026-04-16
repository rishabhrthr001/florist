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
  
  const [vases, setVases] = useState<any[]>([]);
  const [selectedVase, setSelectedVase] = useState<any | null>(null);

  const [items, setItems] = useState<ComponentItem[]>([]);

  /* ================= FETCH ENABLED BOUQUET ITEMS ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Categories
        const catRes = await axios.get(`${API}/category`);
        const categories = catRes.data;
        
        // Define mapping of category keywords to builder types
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

        // 2. Fetch products for each matching category
        await Promise.all(categories.map(async (cat: any) => {
          const lowerName = cat.name.toLowerCase();
          let builderType = '';

          for (const [type, keywords] of Object.entries(typeMapping)) {
            if (keywords.some(k => lowerName.includes(k))) {
              builderType = type;
              break;
            }
          }

          if (builderType) {
            const prodRes = await axios.get(`${API}/product?categoryId=${cat._id}&limit=100`);
            const products = prodRes.data.products || [];
            
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
        }));

        // 3. Also fetch curated Custom Bouquet items (as fallback or for special items not in main categories)
        const res = await axios.get(`${API}/custom-bouquet`);
        const customItems: ComponentItem[] = res.data
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

        // Merge and deduplicate by ID
        const merged = [...allMappedProducts, ...customItems];
        const uniqueItems = Array.from(new Map(merged.map(item => [item.id, item])).values());
        
        setItems(uniqueItems);
        
        // Populate vases specifically for compatibility if needed (though StepCarousel now handles it)
        const vaseList = uniqueItems.filter(i => i.type === 'vase' || i.type === 'base');
        setVases(vaseList.map(v => ({
           _id: v.id,
           name: v.name,
           price: v.price,
           images: [v.image],
           isOutOfStock: v.isOutOfStock
        })));

      } catch (err) {
        console.error("BUILDER FETCH ERROR:", err);
        toast.error("Failed to load bouquet builder");
      }
    };

    fetchData();
  }, []);

  /* ================= ADD / REMOVE ================= */

  const handleAdd = (item: ComponentItem) => {
    if (item.type === "base") setSelectedBase(item);
    else if (item.type === "ribbon") setSelectedRibbon(item);
    else if (item.type === "paper") setSelectedPaper(item);
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
    setSelectedVase(null);
  };

  const steps = [
    { title: "1. Select Your Base", type: "base" },
    { title: "2. Choose Your Flowers", type: "flower" },
    { title: "3. Choose Fillers", type: "filler" },
    { title: "4. Add Sweetness", type: "chocolate" },
    { title: "5. Choose Paper Type", type: "paper" },
    { title: "6. The Final Ribbon", type: "ribbon" },
    { title: "7. Select Your Vessel", type: "vase" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-32">
      
      {/* HEADER / BREADCRUMBS */}
      <div className="max-w-full px-4 md:px-8 xl:px-12 mb-8">
        <nav className="flex text-[10px] sm:text-[11px] text-gray-400 border-b border-gray-200/50 pb-4 font-bold uppercase tracking-widest">
          <Link to="/" className="hover:text-black transition-colors shrink-0">Home</Link>
          <span className="mx-2 shrink-0">/</span>
          <span className="text-gray-900 truncate">Artisan Builder</span>
        </nav>
      </div>

      <div className="w-full px-4 md:px-10 xl:px-16 grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-10 xl:gap-16 md:items-start">
        {/* ================= LEFT BUILDER ================= */}
        <motion.div
           initial={{ opacity: 0, y: 12 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col gap-14"
        >
          {steps.map((step, idx) => (
            <StepCarousel 
               key={idx} 
               step={step} 
               items={items} 
               selectedBase={selectedBase} 
               selectedRibbon={selectedRibbon} 
               selectedPaper={selectedPaper}
               additions={additions} 
               handleAdd={handleAdd} 
               flowerSearch={flowerSearch} 
               setFlowerSearch={setFlowerSearch} 
            />
          ))}

          {/* ---------------- INSTRUCTIONS ---------------- */}
          <section className="bg-white rounded-[1.5rem] p-10 shadow-sm border border-gray-100">
            <h3 className="font-serif italic text-3xl text-gray-900 mb-2 tracking-tight">Special Instructions</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-8">Any wrapping style, color preference or notes?</p>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g. Wrap it in dark paper, keep it minimalistic..."
              rows={4}
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-2xl p-6 text-sm font-medium resize-none focus:outline-none focus:border-black focus:bg-white transition-all shadow-sm"
            />
          </section>
        </motion.div>

        {/* ---------------- DESKTOP SUMMARY ---------------- */}
        <div className="sticky top-32 z-10 hidden lg:block self-start">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col gap-8 min-w-0"
          >
             <h2 className="font-serif italic text-4xl text-gray-900 tracking-tight">
                Items Added
             </h2>
             
             <div className="min-h-[100px] flex flex-col justify-center border-b border-gray-100 pb-8">
               <SummaryContent
                {...{
                  selectedBase,
                  selectedRibbon,
                  selectedPaper,
                  additions,
                  handleAdd,
                  handleRemove,
                  clearBase: () => setSelectedBase(null),
                  clearRibbon: () => setSelectedRibbon(null),
                  clearPaper: () => setSelectedPaper(null),
                  selectedVase,
                  clearVase: () => setSelectedVase(null),
                }}
               />
             </div>

             <div className="space-y-6">
               <div className="flex justify-between items-baseline">
                 <span className="font-serif italic text-3xl text-gray-900">Total</span>
                 <span className="font-sans font-black text-3xl text-gray-900 leading-none">₹{totalPrice.toLocaleString()}</span>
               </div>
               <button 
                 disabled={!selectedBase}
                 onClick={finalizeBouquet}
                 className="w-full py-5 bg-[#A1A1A1] text-white rounded-full uppercase tracking-widest text-xs font-bold hover:bg-gray-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
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
                selectedPaper={selectedPaper}
                additions={additions}
                handleAdd={handleAdd}
                handleRemove={handleRemove}
                clearBase={() => setSelectedBase(null)}
                clearRibbon={() => setSelectedRibbon(null)}
                clearPaper={() => setSelectedPaper(null)}
                selectedVase={selectedVase}
                clearVase={() => setSelectedVase(null)}
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
  selectedPaper,
  additions,
  handleAdd,
  handleRemove,
  clearBase,
  clearRibbon,
  clearPaper,
  selectedVase,
  clearVase,
}: any) => (
  <div className="space-y-4">
    {selectedBase ? (
      <div className="flex justify-between items-center text-sm md:text-base font-bold text-gray-900 bg-white border border-gray-100 p-4 rounded-xl mb-3">
        <span className="leading-tight">{selectedBase.name}</span>
        <div className="flex items-center gap-2">
          <span className="font-black text-xs text-gray-400">₹{selectedBase.price.toLocaleString()}</span>
          <button onClick={clearBase} className="p-1 text-red-500 hover:text-red-700 transition-colors">
            <Trash2 size={14} strokeWidth={2.5}/>
          </button>
        </div>
      </div>
    ) : (
      <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-black mb-0 text-center">Select a base to start</p>
    )}

    {additions.length > 0 && (
       <div className="space-y-4 mb-3">
         {additions.map((a: any) => (
           <div key={a.item.id} className="flex justify-between items-center border border-gray-100 p-4 rounded-xl bg-white">
             <div className="flex flex-col">
               <span className="text-sm font-bold text-gray-900 leading-tight">
                 {a.item.name} x {a.qty}
               </span>
             </div>
             <div className="flex items-center gap-2">
               <span className="font-black text-xs text-gray-400">₹{(a.item.price * a.qty).toLocaleString()}</span>
               <button onClick={() => handleRemove(a.item.id)} className="p-1 text-red-500 hover:text-red-700">
                 <Trash2 size={14} strokeWidth={2.5}/>
               </button>
             </div>
           </div>
         ))}
       </div>
    )}

    {selectedPaper && (
      <div className="flex justify-between items-center text-sm font-bold text-gray-900 bg-white border border-gray-100 p-4 rounded-xl mb-3">
        <span className="leading-tight">{selectedPaper.name}</span>
        <div className="flex items-center gap-2">
          <span className="font-black text-xs text-gray-400">₹{selectedPaper.price.toLocaleString()}</span>
          <button onClick={clearPaper} className="p-1 text-red-500 hover:text-red-700">
            <Trash2 size={14} strokeWidth={2.5}/>
          </button>
        </div>
      </div>
    )}

    {selectedRibbon && (
      <div className="flex justify-between items-center text-sm font-bold text-gray-900 bg-white border border-gray-100 p-4 rounded-xl mb-3">
        <span className="leading-tight">{selectedRibbon.name}</span>
        <div className="flex items-center gap-2">
          <span className="font-black text-xs text-gray-400">₹{selectedRibbon.price.toLocaleString()}</span>
          <button onClick={clearRibbon} className="p-1 text-red-500 hover:text-red-700">
            <Trash2 size={14} strokeWidth={2.5}/>
          </button>
        </div>
      </div>
    )}

    {selectedVase && (
       <div className="flex justify-between items-center text-sm font-bold text-gray-900 bg-white border border-gray-100 p-4 rounded-xl mb-3">
         <span className="leading-tight">{selectedVase.name}</span>
         <div className="flex items-center gap-2">
           <span className="font-black text-xs text-gray-400">₹{selectedVase.price.toLocaleString()}</span>
           <button onClick={clearVase} className="p-1 text-red-500 hover:text-red-700">
             <Trash2 size={14} strokeWidth={2.5}/>
           </button>
         </div>
       </div>
     )}
  </div>
);

const StepCarousel = ({ step, items, selectedBase, selectedRibbon, selectedPaper, additions, handleAdd, flowerSearch, setFlowerSearch }: any) => {
  const [showAll, setShowAll] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      // Scroll by one full view width (exactly 5 items on desktop)
      const scrollAmount = containerRef.current.clientWidth;
      containerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  let displayItems = items.filter((i: any) => i.type === step.type);
  if (step.type === 'flower' && flowerSearch) {
    displayItems = displayItems.filter((i: any) => 
      i.name && i.name.toLowerCase().includes(flowerSearch.toLowerCase())
    );
  }

  const isEmpty = displayItems.length === 0;

  return (
    <section className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
         <div className="flex items-center gap-4">
           <span className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-sans font-bold shrink-0">
             {step.title.split('.')[0]}
           </span>
           <h2 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-tight">
             {step.title.split('. ')[1]}
           </h2>
         </div>
         {step.type === 'flower' && (
           <div className="relative mt-2 sm:mt-0 w-full sm:w-auto">
             <input 
               type="text" 
               placeholder="Search favorite flower..." 
               value={flowerSearch}
               onChange={(e) => setFlowerSearch(e.target.value)}
               className="pl-5 pr-12 py-3.5 text-xs border border-gray-200 rounded-full focus:outline-none focus:border-black bg-white w-full sm:w-72 transition-all shadow-sm font-medium"
             />
             <Search size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
           </div>
         )}
      </div>

      <div className="relative group/carousel">
        {displayItems.length > 5 && (
          <>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); scroll('left'); }}
              className="flex absolute -left-6 top-[40%] -translate-y-1/2 z-50 w-11 h-11 bg-white border border-gray-200 rounded-full items-center justify-center shadow-lg hover:bg-gray-50 active:scale-90 transition-all"
            >
              <ChevronLeft size={24} className="text-gray-900"/>
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); scroll('right'); }}
              className="flex absolute -right-6 top-[40%] -translate-y-1/2 z-50 w-11 h-11 bg-white border border-gray-200 rounded-full items-center justify-center shadow-lg hover:bg-gray-50 active:scale-90 transition-all"
            >
              <ChevronRight size={24} className="text-gray-900"/>
            </button>
          </>
        )}
         
        <div 
          ref={containerRef}
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar scroll-smooth py-6 px-1 w-full"
        >
          {displayItems.length === 0 && (
            <div className="w-full py-16 text-center text-xs text-gray-300 uppercase tracking-[0.2em] font-black">
              No items here
            </div>
          )}
          {displayItems.map((item: any) => {
            const isSelected = selectedBase?.id === item.id || selectedRibbon?.id === item.id || selectedPaper?.id === item.id;
            const addedItem = additions.find((a: any) => a.item.id === item.id);
            const isAdded = !!addedItem;

            return (
              <motion.div
                whileHover={item.isOutOfStock ? {} : { y: -5, scale: 1.02 }}
                key={item.id}
                onClick={() => !item.isOutOfStock && handleAdd(item)}
                className={`flex-none w-[calc(80%-12px)] sm:w-[calc(45%-12px)] md:w-[calc(20%-12.8px)] snap-start bg-white rounded-xl border transition-all duration-300 shadow-sm group flex flex-col items-center text-center cursor-pointer p-4 md:p-5 ${
                  item.isOutOfStock 
                    ? "opacity-50 grayscale cursor-not-allowed" 
                    : isSelected 
                      ? "border-black ring-2 ring-black shadow-md" 
                      : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="w-[20%] mb-4 relative shrink-0 flex items-center justify-center">
                   <img
                     src={optimizeCloudinaryUrl(item.image, 400, true)}
                     className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                     alt={item.name}
                     loading="lazy"
                   />
                   {isSelected && (
                     <div className="absolute top-2 right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center shadow-md z-10">
                        <Check size={10} strokeWidth={3} />
                     </div>
                   )}
                   {isAdded && (item.type !== 'base' && item.type !== 'ribbon' && item.type !== 'paper') && (
                     <div className="absolute top-2 right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center shadow-md text-[10px] font-bold z-10">
                        {addedItem.qty}
                     </div>
                   )}
                </div>

                <div className="w-full mt-auto">
                   <h3 className="font-serif font-bold text-[11px] md:text-[13px] text-gray-900 mb-1 leading-tight line-clamp-2">{item.name}</h3>
                   <p className="font-sans font-black text-gray-900 text-[10px] md:text-[12px]">₹{item.price.toLocaleString()}</p>
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
