import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Search, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import API from "../config";

import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";

/* ---------------- TYPES ---------------- */

interface Category {
  _id: string;
  name: string;
  slug: string;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedSlug, setSelectedSlug] = useState("all");

  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [subFilter, setSubFilter] = useState<string>("all");

  /* ---------------- FETCH CATEGORIES ---------------- */

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API}/category`);

        setCategories(data);

        const urlCat = searchParams.get("category");
        setSelectedSlug(urlCat || "all");
      } catch {
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  /* ---------------- FETCH PRODUCTS ---------------- */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

        // 👉 ALL
        if (selectedSlug === "all") {
          const { data } = await axios.get(`${API}/product`);
          setProducts(data);
          return;
        }

        // 👉 slug -> id
        const category = categories.find((c) => c.slug === selectedSlug);

        if (!category) {
          setProducts([]);
          return;
        }

        const { data } = await axios.get(
          `${API}/product?categoryId=${category._id}`,
        );

        setProducts(data);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    if (categories.length) {
      fetchProducts();
    }
  }, [selectedSlug, categories]);

  /* ---------------- CATEGORY CLICK ---------------- */

  const handleSelectCategory = (slug: string) => {
    setSelectedSlug(slug);
    setSubFilter("all");
    setSearchParams(slug === "all" ? {} : { category: slug });
  };

  /* ---------------- SEARCH FILTER ---------------- */

  const filteredProducts = products.filter((p) => {
    const term = search.toLowerCase();
    const searchMatch = p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
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

    return searchMatch && priceMatch && subMatch;
  });

  /* ---------------- RENDER ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-12 py-8 pt-32 min-h-screen"
    >
      <div className="flex gap-10">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-36 space-y-4">
            <h2 className="font-serif text-2xl font-bold mb-4">Collections</h2>

            <div className="bg-white rounded-3xl border border-gray-100 p-3 space-y-1 shadow-sm">
              {/* ALL */}
              <button
                onClick={() => handleSelectCategory("all")}
                className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  selectedSlug === "all"
                    ? "bg-[#EE1C47] text-white shadow-[0_4px_15px_rgba(238,28,71,0.2)] scale-[1.02]"
                    : "text-gray-500 hover:bg-pink-50 hover:text-[#EE1C47]"
                }`}
              >
                All Products
              </button>

              {/* BACKEND */}
              {categories.map((cat) => {
                const active = selectedSlug === cat.slug;

                return (
                  <button
                    key={cat._id}
                    onClick={() => handleSelectCategory(cat.slug)}
                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                      active
                        ? "bg-[#EE1C47] text-white shadow-[0_4px_15px_rgba(238,28,71,0.2)] scale-[1.02]"
                        : "text-gray-500 hover:bg-pink-50 hover:text-[#EE1C47]"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Price Filter */}
            <div className="mt-8">
              <h3 className="font-serif italic text-xl mb-4 text-gray-900 border-t border-gray-100 pt-6">Filter by Price</h3>
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Up to</span>
                  <span className="text-sm font-bold text-gray-900">₹{maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EE1C47]"
                />
                <div className="flex justify-between mt-3 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>₹0</span>
                  <span>₹15,000+</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* ---------------- MAIN ---------------- */}
        <main className="flex-1">
          {/* ---------------- MOBILE CATEGORY DROPDOWN ---------------- */}
          <div className="lg:hidden mb-8 relative w-full">
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="w-full bg-white border border-gray-100 rounded-full px-5 h-11 flex items-center justify-between text-xs uppercase tracking-widest font-bold shadow-sm"
            >
              <span>
                {selectedSlug === "all"
                  ? "All Products"
                  : categories.find((c) => c.slug === selectedSlug)?.name ||
                    "Collection"}
              </span>

              <ChevronDown
                size={14}
                className={`transition-transform ${
                  mobileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute z-40 mt-3 w-full bg-white rounded-3xl border shadow-xl overflow-hidden"
                >
                  <button
                    onClick={() => {
                      handleSelectCategory("all");
                      setMobileOpen(false);
                    }}
                    className={`w-full text-left px-6 py-4 text-xs uppercase tracking-widest font-bold ${
                      selectedSlug === "all"
                        ? "bg-black text-white"
                        : "hover:bg-[#FDF2F5]"
                    }`}
                  >
                    All Products
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => {
                        handleSelectCategory(cat.slug);
                        setMobileOpen(false);
                      }}
                      className={`w-full text-left px-6 py-4 text-xs uppercase tracking-widest font-bold ${
                        selectedSlug === cat.slug
                          ? "bg-black text-white"
                          : "hover:bg-[#FDF2F5]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}

                </motion.div>
              )}
            </AnimatePresence>

            {/* MOBILE PRICE FILTER */}
            <div className="mt-6 px-5 py-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Filter by Price</span>
                  <span className="text-sm font-bold text-gray-900">₹{maxPrice.toLocaleString()}</span>
               </div>
               <input
                  type="range"
                  min="0"
                  max="15000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EE1C47]"
               />
               <div className="flex justify-between mt-3 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>₹0</span>
                  <span>₹15,000+</span>
               </div>
            </div>
          </div>

          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-gray-100 pb-6">
            <div>
              <h1 className="font-serif italic text-4xl md:text-5xl lg:text-[3.5rem] tracking-tight text-gray-900 mb-3 leading-[1.1]">
                {selectedSlug === "all"
                  ? "All Collections"
                  : categories.find((c) => c.slug === selectedSlug)?.name ||
                    "Collection"}
              </h1>

              <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">
                Explore our elegantly curated selection.
              </p>

              {/* FLOWERS SUB-FILTERS */}
              {selectedSlug === "flowers" && (
                 <div className="flex flex-wrap gap-2 mt-6">
                   {["all", "red roses", "white roses", "pink roses", "orchids", "lilies"].map(f => (
                      <button 
                        key={f}
                        onClick={() => setSubFilter(f)}
                        className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors border ${
                           subFilter === f 
                             ? "bg-[#EE1C47] text-white border-[#EE1C47]" 
                             : "bg-white text-gray-500 border-gray-200 hover:border-[#EE1C47] hover:text-[#EE1C47]"
                        }`}
                      >
                         {f}
                      </button>
                   ))}
                 </div>
              )}
            </div>

            {/* SEARCH */}
            <div className="w-full md:w-64 relative group">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full h-11 bg-white border border-gray-100 rounded-full pl-10 pr-4 text-xs shadow-sm focus:outline-none focus:border-[#F8BBD0]"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ---------------- PRODUCTS GRID ---------------- */}

          {loadingProducts && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          )}

          <motion.div
            layout
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="sync">
              {!loadingProducts &&
                filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ProductCard product={product} showControls />
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>

          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] mt-10">
              <p className="text-gray-400 font-serif italic text-xl">
                No products found in this collection...
              </p>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
};

export default ExplorePage;
