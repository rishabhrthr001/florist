import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Product } from "../types";
import { optimizeCloudinaryUrl } from "../lib/cloudinary";
import API from "../config";
import axios from "axios";

/* ---------------- PREFETCH CACHE ---------------- */
const prefetchCache = new Set<string>();

interface ProductCardProps {
  product: Product;
  showControls?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showControls = false,
}) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const queryClient = useQueryClient();

  const [qty, setQty] = useState(1);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  const inWishlist = isInWishlist(product._id);

  const prefetchProduct = async () => {
    const detailKey = product.slug || product._id;
    if (prefetchCache.has(detailKey)) return;
    
    // Prefetch Product Details
    queryClient.prefetchQuery({
      queryKey: ["product", detailKey],
      queryFn: async () => {
        const { data } = await axios.get(`${API}/product/slug/${detailKey}`);
        sessionStorage.setItem(`product_detail_${detailKey}`, JSON.stringify(data));
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch Reviews
    queryClient.prefetchQuery({
      queryKey: ["reviews", detailKey],
      queryFn: async () => {
        const { data } = await axios.get(`${API}/reviews/product/${detailKey}`);
        sessionStorage.setItem(`product_reviews_${detailKey}`, JSON.stringify(data));
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    prefetchCache.add(detailKey);
  };

  const handleMouseEnter = () => {
    const timer = setTimeout(prefetchProduct, 150);
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
  };

  const handleAdd = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: qty,
    });
    toast.success(`Added ${product.name} to cart 🛒`);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product._id);
      toast.success("Removed from wishlist 💔");
    } else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        slug: product.slug || product._id,
      });
      toast.success("Added to wishlist ❤️");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group h-full flex flex-col ${product.isOutOfStock ? "opacity-60 grayscale-[0.3]" : ""}`}
    >
      <Link
        to={`/product/${product.slug || product._id}`}
        className="block relative overflow-hidden rounded-[1.25rem] bg-[#F9F9F9] aspect-[4/5] mb-4"
      >
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          src={optimizeCloudinaryUrl(product.images[0], 600, true)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors duration-300" />
        <div className="absolute top-3 right-3 z-10 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={toggleWishlist}
            className={`backdrop-blur-md p-2 rounded-full transition-all shadow-sm ${inWishlist ? "bg-white text-[#EE1C47]" : "bg-white/80 text-gray-400 hover:text-[#EE1C47]"}`}
          >
            <Heart size={16} fill={inWishlist ? "currentColor" : "none"} strokeWidth={inWishlist ? 1 : 1.5} />
          </button>
        </div>
        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 px-1">
        <Link to={`/product/${product.slug || product._id}`} className="w-full">
          <h3 className="font-sans text-[13px] md:text-[15px] font-medium text-gray-900 group-hover:text-pink-600 transition-colors leading-[1.3] mb-1.5 line-clamp-2">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex items-center gap-1 bg-[#FBFBFB] px-1.5 py-0.5 rounded border border-gray-100">
             <span className="text-yellow-500 text-[10px] font-bold">★</span>
             <span className="text-gray-700 text-[10px] font-bold">4.8</span>
          </div>
          <span className="text-gray-300 text-[10px]">|</span>
          <span className="text-gray-400 text-[10px] hover:underline cursor-pointer">420 reviews</span>
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <p className="font-sans font-bold text-[14px] md:text-[16px] text-gray-900">₹{product.price.toLocaleString()}</p>
          <p className="text-[11px] md:text-[12px] text-gray-400 line-through font-light">₹{(product.price * 1.4).toFixed(0).toLocaleString()}</p>
        </div>
        {showControls && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center bg-gray-50 rounded-full border p-1">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white transition-all text-gray-500"><Minus size={12} /></button>
              <span className="text-[11px] w-5 text-center font-medium text-gray-700">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white transition-all text-gray-500"><Plus size={12} /></button>
            </div>
            <button
              onClick={handleAdd} disabled={product.isOutOfStock}
              className={`flex-1 text-[10px] uppercase tracking-widest font-bold py-2.5 rounded-full transition-all ${product.isOutOfStock ? "bg-gray-200 text-gray-400" : "bg-black text-white hover:bg-gray-800"}`}
            >
              {product.isOutOfStock ? "Out of Stock" : "Add"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
