import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Search, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import API from "../config";
import { Helmet } from "react-helmet-async";

import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";

/* ---------------- CACHE ---------------- */
const EXPLORE_CACHE_KEY = "explore_data_cache_v1";

const getExploreCache = () => {
  try {
    const cached = sessionStorage.getItem(EXPLORE_CACHE_KEY);
    return cached ? JSON.parse(cached) : { categories: null, initialProducts: null };
  } catch { return { categories: null, initialProducts: null }; }
};

const setExploreCache = (data: any) => {
  try {
    sessionStorage.setItem(EXPLORE_CACHE_KEY, JSON.stringify(data));
  } catch (e) { console.error("Cache error", e); }
};

/* ---------------- TYPES ---------------- */

interface Category {
  _id: string;
  name: string;
  slug: string;
  section?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  categoryId: Category;
}

/* ---------------- COMPONENT ---------------- */

const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSearch = searchParams.get("search") || "";
  const selectedSlug = searchParams.get("category") || "all";

  // Search input state (local to avoid excessive query refetches while typing)
  const [searchInput, setSearchInput] = useState(rawSearch);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [subFilter, setSubFilter] = useState<string>("all");

  const LIMIT = 12;

  /* ---------------- FETCH CATEGORIES ---------------- */
  const { data: categoriesData } = useQuery({
    queryKey: ["explore_categories"],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/category`);
      const cache = getExploreCache();
      cache.categories = data;
      setExploreCache(cache);
      return data as Category[];
    },
    initialData: getExploreCache().categories || undefined,
  });

  const categories = categoriesData || [];

  /* ---------------- FETCH PRODUCTS (INFINITE) ---------------- */
  const { 
    data: productsData, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading: isLoadingProducts 
  } = useInfiniteQuery({
    queryKey: ["explore_products", selectedSlug, rawSearch],
    queryFn: async ({ pageParam = 1 }) => {
      let prodUrl = `${API}/product?page=${pageParam}&limit=${LIMIT}`;
      if (selectedSlug !== "all") {
        prodUrl += `&tag=${selectedSlug.replace(/-/g, " ")}`;
      }
      if (rawSearch) prodUrl += `&search=${encodeURIComponent(rawSearch)}`;

      const { data } = await axios.get(prodUrl);
      
      // Update session cache if it's the first page of 'all'
      if (pageParam === 1 && selectedSlug === "all" && !rawSearch) {
        const cache = getExploreCache();
        cache.initialProducts = data.products;
        cache.initialHasMore = data.hasMore;
        setExploreCache(cache);
      }
      
      return data;
    },
    getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    initialData: (selectedSlug === "all" && !rawSearch && getExploreCache().initialProducts) 
      ? { 
          pages: [{ products: getExploreCache().initialProducts, hasMore: getExploreCache().initialHasMore }],
          pageParams: [1]
        } 
      : undefined,
  });

  const allProducts = productsData?.pages.flatMap(page => page.products) || [];
  const loadingProducts = isLoadingProducts && !allProducts.length;

  // Manual filtering for price and sub-category
  const filteredProducts = allProducts.filter((p) => {
    const priceMatch = p.price <= maxPrice;
    
    let subMatch = true;
    if (selectedSlug === "flowers" && subFilter !== "all") {
       const productText = (p.name + " " + p.description).toLowerCase();
       if (subFilter === "red roses") subMatch = productText.includes("red rose");
       else if (subFilter === "white roses") subMatch = productText.includes("white rose");
       else if (subFilter === "pink roses") subMatch = productText.includes("pink rose");
       else if (subFilter === "orchids") subMatch = productText.includes("orchid");
       else if (subFilter === "lilies") subMatch = productText.includes("lil");
    }

    return priceMatch && subMatch;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

  useEffect(() => {
    setSearchInput(rawSearch);
  }, [rawSearch]);

  const handleSelectCategory = (slug: string) => {
    setSubFilter("all");
    const newParams = new URLSearchParams(searchParams);
    if (slug === "all") newParams.delete("category");
    else newParams.set("category", slug);
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (!searchInput.trim()) newParams.delete("search");
    else newParams.set("search", searchInput);
    setSearchParams(newParams);
  };

  const handleLoadMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-12 py-8 pt-32 min-h-screen"
    >
      <Helmet>
        <title>{selectedSlug !== 'all' && categories.find(c => c.slug === selectedSlug)?.name ? `${categories.find(c => c.slug === selectedSlug)?.name} | Mangalam Florist` : "Explore Gifts & Flowers | Mangalam Florist"}</title>
        <meta name="description" content="Explore our luxurious collection of flowers, bouquets, and premium gifts for all occasions. Custom and premium wrapping available." />
        <link rel="canonical" href="https://mangalamflorist.com/explore" />
      </Helmet>
      <div className="flex gap-10">
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-36 space-y-4">
            <h2 className="font-serif text-2xl font-bold mb-4">Collections</h2>
            <div className="bg-white rounded-3xl border border-gray-100 p-3 space-y-1 shadow-sm">
              <button
                onClick={() => handleSelectCategory("all")}
                className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${selectedSlug === "all" ? "bg-[#EE1C47] text-white shadow-[0_4px_15px_rgba(238,28,71,0.2)] scale-[1.02]" : "text-gray-500 hover:bg-pink-50 hover:text-[#EE1C47]"}`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${selectedSlug === cat.slug ? "bg-[#EE1C47] text-white shadow-[0_4px_15px_rgba(238,28,71,0.2)] scale-[1.02]" : "text-gray-500 hover:bg-pink-50 hover:text-[#EE1C47]"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="mt-8">
              <h3 className="font-serif italic text-xl mb-4 text-gray-900 border-t border-gray-100 pt-6">Filter by Price</h3>
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Up to</span>
                  <span className="text-sm font-bold text-gray-900">₹{maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range" min="0" max="15000" step="500" value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EE1C47]"
                />
                <div className="flex justify-between mt-3 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>₹0</span> <span>₹15,000+</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="lg:hidden mb-8 relative w-full">
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="w-full bg-white border border-gray-100 rounded-full px-5 h-11 flex items-center justify-between text-xs uppercase tracking-widest font-bold shadow-sm"
            >
              <span>{selectedSlug === "all" ? "All Products" : categories.find((c) => c.slug === selectedSlug)?.name || (selectedSlug.charAt(0).toUpperCase() + selectedSlug.slice(1))}</span>
              <ChevronDown size={14} className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {mobileOpen && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute z-40 mt-3 w-full bg-white rounded-3xl border shadow-xl overflow-hidden">
                  <button onClick={() => { handleSelectCategory("all"); setMobileOpen(false); }} className={`w-full text-left px-6 py-4 text-xs uppercase tracking-widest font-bold ${selectedSlug === "all" ? "bg-black text-white" : "hover:bg-[#FDF2F5]"}`}>All Products</button>
                  {categories.map((cat) => (
                    <button key={cat._id} onClick={() => { handleSelectCategory(cat.slug); setMobileOpen(false); }} className={`w-full text-left px-6 py-4 text-xs uppercase tracking-widest font-bold ${selectedSlug === cat.slug ? "bg-black text-white" : "hover:bg-[#FDF2F5]"}`}>{cat.name}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-6 px-5 py-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Filter by Price</span>
                  <span className="text-sm font-bold text-gray-900">₹{maxPrice.toLocaleString()}</span>
               </div>
               <input type="range" min="0" max="15000" step="500" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EE1C47]" />
               <div className="flex justify-between mt-3 text-[9px] text-gray-400 font-bold uppercase tracking-widest"><span>₹0</span> <span>₹15,000+</span></div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-gray-100 pb-6">
            <div>
              <h1 className="font-serif italic text-4xl md:text-5xl lg:text-[3.5rem] tracking-tight text-gray-900 mb-3 leading-[1.1]">
                {selectedSlug === "all" ? "All Collections" : categories.find((c) => c.slug === selectedSlug)?.name || (selectedSlug.charAt(0).toUpperCase() + selectedSlug.slice(1))}
              </h1>
              <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">Explore our elegantly curated selection.</p>
              {selectedSlug === "flowers" && (
                 <div className="flex flex-wrap gap-2 mt-6">
                   {["all", "red roses", "white roses", "pink roses", "orchids", "lilies"].map(f => (
                      <button 
                        key={f} onClick={() => setSubFilter(f)}
                        className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors border ${subFilter === f ? "bg-[#EE1C47] text-white border-[#EE1C47]" : "bg-white text-gray-500 border-gray-200 hover:border-[#EE1C47] hover:text-[#EE1C47]"}`}
                      >{f}</button>
                   ))}
                 </div>
              )}
            </div>

            <form onSubmit={handleSearchSubmit} className="w-full md:w-64 relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full h-11 bg-white border border-gray-100 rounded-full pl-10 pr-10 text-xs shadow-sm focus:outline-none focus:border-[#F8BBD0]"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(""); const p = new URLSearchParams(searchParams); p.delete("search"); setSearchParams(p); }} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X size={14} />
                </button>
              )}
            </form>
          </div>

          {loadingProducts && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}

          <motion.div layout transition={{ duration: 0.35, ease: "easeInOut" }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            <AnimatePresence mode="popLayout">
              {!loadingProducts && filteredProducts.map((product) => (
                <motion.div key={product._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <ProductCard product={product} showControls />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {hasNextPage && !loadingProducts && (
            <div className="flex justify-center mt-16 mb-8">
              <button
                onClick={handleLoadMore} disabled={isFetchingNextPage}
                className={`relative px-10 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 active:translate-y-0 group ${isFetchingNextPage ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <span className={`transition-opacity duration-300 ${isFetchingNextPage ? "opacity-0" : "opacity-100"}`}>Load More Products</span>
                {isFetchingNextPage && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-pink-100 border-t-[#EE1C47] rounded-full animate-spin" /></div>}
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#EE1C47] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          )}

          {!hasNextPage && !loadingProducts && filteredProducts.length > 0 && (
            <div className="text-center mt-16 mb-8">
              <p className="text-gray-300 text-[10px] uppercase tracking-[0.3em] font-bold">You've reached the absolute end</p>
            </div>
          )}

          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] mt-10">
              <p className="text-gray-400 font-serif italic text-xl">No products found in this collection...</p>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
};

export default ExplorePage;
