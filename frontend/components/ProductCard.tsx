import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";

import { Product } from "../types";

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

  const [qty, setQty] = useState(1);

  const inWishlist = isInWishlist(product._id);

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
      className="group h-full flex flex-col"
    >
      {/* IMAGE */}
      <Link
        to={`/product/${product.slug}`}
        className="block relative overflow-hidden rounded-xl bg-[#F5F5F5] aspect-[4/5]"
      >
        <motion.img
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={toggleWishlist}
            className={`backdrop-blur-sm p-1.5 rounded-full transition-all shadow-sm ${inWishlist
              ? "bg-[#F8BBD0] text-white"
              : "bg-white/90 text-[#4A4A4A] hover:bg-[#F8BBD0] hover:text-white"
              }`}
          >
            <Heart size={14} fill={inWishlist ? "currentColor" : "none"} />
          </button>
        </div>

        {product.isHotPick && (
          <div className="absolute top-3 left-3 bg-[#F8BBD0] text-white px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-sm">
            Hot Pick
          </div>
        )}
      </Link>

      {/* INFO */}
      <div className="mt-3 px-1 min-h-[70px] flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="max-w-[70%] flex-1 overflow-hidden">
            <h3 className="font-serif text-sm leading-tight mb-0.5 truncate">
              {product.name}
            </h3>

            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              {product.categoryId?.name}
            </p>
          </div>

          <p className="font-bold text-xs ml-2">
            ₹{product.price.toLocaleString()}
          </p>
        </div>

        {/* ADD CONTROLS */}
        {showControls && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-50"
              >
                <Minus size={12} />
              </button>

              <span className="text-xs w-4 text-center">{qty}</span>

              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-50"
              >
                <Plus size={12} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="text-[9px] uppercase tracking-widest font-bold px-4 py-2 rounded-full bg-[#F8BBD0] text-white hover:bg-[#f797b9] transition"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
