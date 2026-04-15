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
        // 1. Fetch Categories to find "Flowers"
        const catRes = await axios.get(`${API}/category`);
        const categories = catRes.data;
        
        // Find categories like "Flower" or "Bouquet" (for stems/fillers in shop)
        const flowerCat = categories.find((c: any) => 
          c.name.toLowerCase().includes('flower') || 
          c.name.toLowerCase().includes('stem')
        );

        let categoryFlowers: ComponentItem[] = [];
        if (flowerCat) {
          const prodRes = await axios.get(`${API}/product?categoryId=${flowerCat._id}&limit=100`);
          const products = prodRes.data.products || [];
          
          categoryFlowers = products.map((p: any) => ({
            id: p._id,
            name: p.name,
            price: p.price,
            image: (p.images && p.images[0]) || "/placeholder.jpg",
            type: "flower", // Force type to flower
            isOutOfStock: p.isOutOfStock || false,
          }));
        }

        // 2. Fetch curated Custom Bouquet items
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

        const curatedNonFlowers = customItems.filter(ci => ci.type !== 'flower');
        setItems([...categoryFlowers, ...curatedNonFlowers]);

        // 4. Extract Vases from custom bouquet items
        const vaseItems = res.data
          .filter((item: any) => (item.type === 'vase' || item.type === 'base') && item.isActive)
          .map((item: any) => ({
            _id: item._id,
            name: item.name,
            price: item.price,
            images: [item.image],
            isOutOfStock: item.isOutOfStock
          }));
        setVases(vaseItems);

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
    { title: "7. Choose Your Vase", type: "vase" },
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

      <div className="w-full px-4 md:px-8 xl:px-12 grid grid-cols-1 md:grid-cols-[60fr_40fr] lg:grid-cols-[65fr_35fr] gap-6 xl:gap-8 md:items-start">
        {/* ================= LEFT BUILDER ================= */}
        <motion.div
           initial={{ opacity: 0, y: 12 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col gap-10 lg:pr-4"
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

          {/* VASE SELECTION (OVERRIDE FOR STEP 7) */}
          <section className="space-y-4">
             <div className="flex border-b border-gray-100 pb-3 items-center gap-4">
               <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-serif italic shrink-0">
                 7
               </span>
               <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-tight">
                 Choose Your Vase (Optional)
               </h2>
             </div>
             
             <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
                {vases.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => setSelectedVase(v._id === selectedVase?._id ? null : v)}
                    className={`flex-none w-[calc(45%-16px)] sm:w-[calc(30%-16px)] md:w-[calc(25%-12px)] transition-all snap-start ${selectedVase?._id === v._id ? 'scale-[1.02]' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <div className={`aspect-square rounded-2xl overflow-hidden border-2 mb-2 transition-all ${selectedVase?._id === v._id ? 'border-pink-500 shadow-md ring-2 ring-pink-50' : 'border-transparent bg-gray-50'}`}>
                       <img src={v.images[0]} className="w-full h-full object-cover" alt={v.name} />
                    </div>
                    <p className={`text-[11px] font-bold line-clamp-1 mb-0.5 ${selectedVase?._id === v._id ? 'text-pink-600' : 'text-gray-700'}`}>{v.name}</p>
                    <p className="text-[10px] font-bold text-gray-400">Add + ₹{v.price}</p>
                  </button>
                ))}
             </div>
          </section>

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
        <div className="sticky top-32 z-10 hidden lg:block self-start">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-4 min-w-0"
          >
             <h2 className="font-serif italic text-2xl xl:text-3xl text-gray-900 border-b border-gray-100 pb-5 tracking-tight">
                Items Added
             </h2>
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
             <div className="border-t border-gray-100 pt-5 mt-auto space-y-4">
               <div className="flex justify-between items-end border-b border-gray-100 pb-5">
                 <span className="font-serif italic text-xl xl:text-2xl text-gray-900">Total</span>
                 <span className="font-sans font-bold text-xl xl:text-2xl text-gray-900">₹{totalPrice.toLocaleString()}</span>
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

    {selectedPaper && (
      <div className="flex justify-between items-center text-[13px] md:text-sm font-medium text-gray-800 bg-[#FBFBFB] border border-gray-100 p-4 rounded-2xl">
        <span className="flex items-center gap-2">
          <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Paper</span> 
          {selectedPaper.name}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-bold">₹{selectedPaper.price.toLocaleString()}</span>
          <button onClick={clearPaper} className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors">
            <Trash2 size={12} strokeWidth={2.5}/>
          </button>
        </div>
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

    {selectedVase && (
       <div className="flex justify-between items-center text-[13px] md:text-sm font-medium text-gray-800 bg-[#FFF0F3] border border-pink-100 p-4 rounded-2xl">
         <span className="flex items-center gap-2">
           <span className="text-pink-500 text-[9px] uppercase tracking-widest font-bold">Vase</span> 
           {selectedVase.name}
         </span>
         <div className="flex items-center gap-3">
           <span className="font-bold text-pink-600">₹{selectedVase.price.toLocaleString()}</span>
           <button onClick={clearVase} className="p-1.5 bg-white text-pink-500 rounded-full hover:bg-pink-50 transition-colors shadow-sm">
             <Trash2 size={12} strokeWidth={2.5}/>
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
      const scrollAmount = containerRef.current.clientWidth * 0.8;
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
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
         <div className="flex items-center gap-4">
           <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-serif italic shrink-0">
             {step.title.split('.')[0]}
           </span>
           <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-tight">
             {step.title.split('. ')[1]}
           </h2>
         </div>
         {step.type === 'flower' && (
           <div className="relative mt-2 sm:mt-0 w-full sm:w-auto">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search favorite flower..." 
               value={flowerSearch}
               onChange={(e) => setFlowerSearch(e.target.value)}
               className="pl-9 pr-4 py-2 sm:py-2 text-xs border border-gray-200 rounded-full focus:outline-none focus:border-gray-400 bg-white w-full sm:w-56 transition-all shadow-sm"
             />
           </div>
         )}
      </div>

      <div className="relative group/carousel">
         <button 
           onClick={() => scroll('left')}
           className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-gray-100 rounded-full items-center justify-center shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110 active:scale-95"
         >
           <ChevronLeft size={24} className="text-gray-900"/>
         </button>
         
         <div 
           ref={containerRef}
           className="flex overflow-x-auto gap-3 snap-x snap-mandatory no-scrollbar scroll-smooth"
         >
           {isEmpty && (
             <div className="w-full py-6 text-center text-[11px] text-gray-400 uppercase tracking-widest font-bold">
               No items here
             </div>
           )}
           {displayItems.map((item: any) => {
             const isSelected = selectedBase?.id === item.id || selectedRibbon?.id === item.id || selectedPaper?.id === item.id;
             const addedItem = additions.find((a: any) => a.item.id === item.id);
             const isAdded = !!addedItem;

             return (
               <motion.div
                 whileHover={item.isOutOfStock ? {} : { y: -4 }}
                 key={item.id}
                 onClick={() => !item.isOutOfStock && handleAdd(item)}
                 className={`flex-none w-[calc(48%-6px)] md:w-[calc(25%-9px)] max-w-[120px] md:max-w-[160px] snap-start bg-white p-1.5 rounded-xl border transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)] group hover:shadow-[0_6px_15px_rgba(0,0,0,0.06)] flex flex-col items-center text-center cursor-pointer ${
                   item.isOutOfStock 
                     ? "opacity-50 grayscale cursor-not-allowed" 
                     : isSelected 
                       ? "border-black ring-1 ring-black" 
                       : "border-gray-100 hover:border-gray-300"
                 }`}
               >
                 <div className="w-full aspect-square rounded-lg bg-gray-50 overflow-hidden mb-1.5 relative shrink-0">
                    <img
                      src={optimizeCloudinaryUrl(item.image, 300, true)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={item.name}
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center shadow-md">
                         <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                    {isAdded && (item.type !== 'base' && item.type !== 'ribbon' && item.type !== 'paper') && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center shadow-md text-[10px] font-bold">
                         {addedItem.qty}
                      </div>
                    )}
                    {item.isOutOfStock && (
                      <div className="absolute inset-x-0 bottom-0 py-1 bg-red-500/90 text-white text-[8px] font-bold uppercase tracking-widest text-center shadow-sm">
                        Stocked Out
                      </div>
                    )}
                 </div>

                 <div className="mt-auto text-center">
                    <h3 className="font-serif text-[10px] md:text-[12px] leading-tight text-gray-900 mb-0.5 line-clamp-2">{item.name}</h3>
                    <p className="font-sans font-bold text-gray-900 text-[10px] md:text-[11px]">₹{item.price.toLocaleString()}</p>
                 </div>
               </motion.div>
             );
           })}
         </div>

         <button 
           onClick={() => scroll('right')}
           className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-gray-100 rounded-full items-center justify-center shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110 active:scale-95"
         >
           <ChevronRight size={24} className="text-gray-900"/>
         </button>
      </div>
    </section>
  );
};

export default MakeYourOwn;
