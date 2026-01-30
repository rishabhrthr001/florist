import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import API from "../config";

import ProductCard from "../components/ProductCard";

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

    setSearchParams(slug === "all" ? {} : { category: slug });
  };

  /* ---------------- SEARCH FILTER ---------------- */

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  );

  /* ---------------- RENDER ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 py-8 pt-32 min-h-screen"
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
                className={`w-full text-left px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition ${
                  selectedSlug === "all"
                    ? "bg-[#1A1A1A] text-white shadow"
                    : "text-gray-500 hover:bg-[#FDF2F5]"
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
                    className={`w-full text-left px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition ${
                      active
                        ? "bg-[#1A1A1A] text-white shadow"
                        : "text-gray-500 hover:bg-[#FDF2F5]"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ---------------- MAIN ---------------- */}
        <main className="flex-1">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <h1 className="font-serif text-4xl mb-2">
                {selectedSlug === "all"
                  ? "All Products"
                  : categories.find((c) => c.slug === selectedSlug)?.name ||
                    "Collection"}
              </h1>

              <p className="text-gray-400 text-sm italic">
                Explore our curated selection.
              </p>
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

          {/* Skeleton Loader */}
          {loadingProducts && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-3xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Animated Grid */}
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

          {/* EMPTY */}
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
