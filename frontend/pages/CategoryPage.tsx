import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import { Helmet } from "react-helmet-async";
import SEO from "../components/SEO";
import API from "../config";

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // 1. Fetch Categories to find the ID for this slug
  const { data: categories, isLoading: isLoadingCats } = useQuery({
    queryKey: ["categories_all"],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/category`);
      return data as any[];
    },
  });

  const category = categories?.find((c) => c.slug === slug);

  // 2. Fetch Products for this specific category (with tag fallback)
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["category_products", slug, category?._id],
    queryFn: async () => {
      let prodUrl = `${API}/product?limit=50`;
      if (category?._id) {
        prodUrl += `&categoryId=${category._id}`;
      } else if (slug) {
        prodUrl += `&tag=${slug.replace(/-/g, " ")}`;
      }
      
      const { data } = await axios.get(prodUrl);
      return data;
    },
    enabled: !!slug && !isLoadingCats,
  });

  const products = productsData?.products || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoadingCats) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 pt-32">
        <div className="h-10 w-48 bg-gray-100 animate-pulse rounded-md mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!category && !isLoadingCats)
    return (
      <div className="p-40 text-center font-serif text-2xl">
        <h2 className="mb-4">Collection Not Found</h2>
        <button 
          onClick={() => navigate("/explore")}
          className="text-sm uppercase tracking-widest font-bold text-[#EE1C47] hover:underline"
        >
          Explore All Collections →
        </button>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[120rem] mx-auto px-4 md:px-8 lg:px-12 py-12 pt-32"
    >
      <SEO 
        title={category?.name}
        description={`Shop premium ${category?.name} at Mangalam Florist. Perfect for every occasion.`}
        canonical={`https://mangalamflorist.com/category/${slug}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": category?.name,
          "description": category?.description,
          "url": `https://mangalamflorist.com/category/${slug}`,
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://mangalamflorist.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": category?.name,
                "item": `https://mangalamflorist.com/category/${slug}`
              }
            ]
          }
        }}
      />
      
      <header className="mb-16 border-b border-gray-100 pb-12 relative overflow-hidden">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#EE1C47] font-bold mb-3 block">
            The Atelier Collection
          </span>
          <h1 className="font-serif italic text-5xl md:text-7xl text-gray-900 mb-6 leading-tight">
            {category?.name}
          </h1>
          <p className="text-gray-500 max-w-2xl text-base md:text-lg font-light leading-relaxed">
            {category?.description || "Exquisite botanical creations meticulously crafted for life's most cherished chapters."}
          </p>
        </motion.div>
        
        <div className="absolute -right-20 -top-20 text-[25rem] font-black text-pink-50/30 select-none pointer-events-none -z-10">
          {category?.name?.charAt(0)}
        </div>
      </header>

      {isLoadingProducts ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
          <p className="text-gray-400 font-serif italic text-xl">
            Curating new botanical wonders for this collection...
          </p>
          <button 
            onClick={() => navigate("/explore")}
            className="mt-6 text-xs uppercase tracking-widest font-bold text-gray-900 hover:text-[#EE1C47] transition-colors"
          >
            Browse Other Collections
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryPage;
