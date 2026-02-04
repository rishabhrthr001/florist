import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

import Button from "../components/Button";
import {
  ShoppingBag,
  Truck,
  RefreshCw,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Minus,
  Plus,
  Shield,
  Heart,
  Share2,
} from "lucide-react";

import API from "../config";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

/* ---------------- TYPES ---------------- */

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  isHotPick?: boolean;
  categoryId: Category;
}

interface User {
  _id: string;
  name: string;
}

interface Reply {
  _id: string;
  user: User;
  comment: string;
}

interface Review {
  _id: string;
  user: User;
  rating: number;
  comment: string;
  replies: Reply[];
}

/* ---------------- COMPONENT ---------------- */

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user, token } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("description");

  const inWishlist = product ? isInWishlist(product._id) : false;

  // reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  /* ---------------- FETCH PRODUCT ---------------- */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API}/product/slug/${slug}`);
        setProduct(data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  /* ---------------- FETCH REVIEWS BY SLUG ---------------- */

  useEffect(() => {
    if (!slug) return;

    axios
      .get(`${API}/reviews/product/${slug}`)
      .then((res) => setReviews(res.data))
      .catch(() => { });
  }, [slug]);

  /* ---------------- SUBMIT REVIEW ---------------- */

  const submitReview = async () => {
    if (!newComment.trim()) return;

    try {
      const { data } = await axios.post(
        `${API}/reviews`,
        {
          slug,
          rating,
          comment: newComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews((prev) => [data, ...prev]);
      setNewComment("");
      setRating(5);
      toast.success("Review added 🌸");
    } catch {
      toast.error("Failed to submit review");
    }
  };

  /* ---------------- SUBMIT REPLY ---------------- */

  const submitReply = async (reviewId: string) => {
    if (!replyText[reviewId]) return;

    try {
      const { data } = await axios.post(
        `${API}/reviews/${reviewId}/reply`,
        {
          comment: replyText[reviewId],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews((prev) => prev.map((r) => (r._id === reviewId ? data : r)));

      setReplyText((p) => ({ ...p, [reviewId]: "" }));
    } catch {
      toast.error("Reply failed");
    }
  };

  /* ---------------- LOADING ---------------- */

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F8BBD0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-xl text-gray-400">
            Loading product…
          </p>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <p className="font-serif text-2xl mb-4">Product not found</p>
          <Link to="/explore" className="text-[#F8BBD0] hover:underline">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );

  /* ---------------- IMAGE CONTROLS ---------------- */

  const nextImg = () =>
    setActiveImg((prev) => (prev + 1) % product.images.length);

  const prevImg = () =>
    setActiveImg(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  /* ---------------- UI ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FAF9F6] min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 pt-28 md:pt-32">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 mb-8">
          <Link to="/" className="hover:text-[#F8BBD0] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/explore" className="hover:text-[#F8BBD0] transition-colors">
            Shop
          </Link>
          <span>/</span>
          {product.categoryId?.slug && (
            <>
              <Link
                to={`/category/${product.categoryId.slug}`}
                className="hover:text-[#F8BBD0] transition-colors"
              >
                {product.categoryId.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-600 font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12">
          {/* GALLERY */}
          <div className="flex gap-4 items-start sticky top-28 h-fit">
            {/* Thumbnail Strip */}
            <div className="hidden md:flex flex-col gap-3 w-20">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImg === idx
                    ? "border-[#F8BBD0] ring-2 ring-[#F8BBD0]/30"
                    : "border-gray-100 hover:border-gray-200"
                    }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F0F0F0]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    src={product.images[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Hot Pick Badge */}
                {product.isHotPick && (
                  <div className="absolute top-4 left-4 bg-[#F8BBD0] text-white text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full">
                    Hot Pick
                  </div>
                )}

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button
                      onClick={prevImg}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all pointer-events-auto"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <button
                      onClick={nextImg}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all pointer-events-auto"
                    >
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                  </div>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                  {activeImg + 1} / {product.images.length}
                </div>
              </div>

              {/* Mobile Thumbnail Strip */}
              <div className="flex md:hidden gap-2 mt-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImg === idx
                      ? "border-[#F8BBD0]"
                      : "border-transparent"
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INFO */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              {/* Category Tag */}
              {/* Vendor/Category Tag */}
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                MANGALAM
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#1A1A1A] leading-tight mb-3">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-1">
                  <div className="flex text-[#F8BBD0]">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        fill={avgRating >= n ? "currentColor" : "none"}
                        className={avgRating >= n ? "" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 ml-1">
                    {reviews.length} reviews
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded text-xs">
                  In Stock
                </span>
              </div>

              {/* Price Section */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-[#1A1A1A]">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-lg text-gray-400 line-through decoration-gray-400">
                  ₹{(product.price * 1.4).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="bg-[#FCE4EC] text-[#D81B60] text-xs font-bold px-2 py-1 rounded">
                  Save ₹{((product.price * 1.4) - product.price).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Short Description */}
              <p className="text-gray-600 leading-relaxed mb-8 text-sm">
                Add a cute and elegant touch to your look with these {product.name}.
                Designed with premium quality materials, crystal shine, and a classy finish,
                these are perfect for any occasion.
              </p>

              {/* Variant Selector (Hidden as requested) */}

              {/* Actions Row 1: Qty, Add to Cart, Wishlist */}
              <div className="flex gap-3 mb-3">
                {/* Quantity */}
                <div className="flex items-center border border-gray-200 rounded-lg h-12 w-32">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-l-lg transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="flex-1 text-center font-semibold text-gray-700">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-r-lg transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart */}
                <Button
                  variant="primary"
                  className="flex-1 h-12 bg-black hover:bg-gray-900 text-white rounded-lg shadow-none flex items-center justify-center gap-2 uppercase tracking-wide text-sm font-bold"
                  onClick={() => {
                    addToCart({
                      _id: product._id,
                      name: product.name,
                      price: product.price,
                      image: product.images[0],
                      quantity: qty,
                    });
                    toast.success("Added to cart 🛒");
                  }}
                >
                  <ShoppingBag size={18} />
                  Add to Cart
                </Button>

                {/* Wishlist */}
                <button
                  onClick={() => {
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
                  }}
                  className={`h-12 w-12 border rounded-lg flex items-center justify-center transition-all ${inWishlist
                    ? "bg-[#F8BBD0] text-white border-[#F8BBD0]"
                    : "border-gray-200 text-gray-400 hover:text-[#D81B60] hover:border-[#D81B60]"
                    }`}
                >
                  <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Actions Row 2: Buy Now */}
              <button className="w-full h-12 border-2 border-black bg-white text-black font-bold uppercase tracking-wide rounded-lg hover:bg-gray-50 transition-colors mb-10">
                Buy Now
              </button>

              {/* Accordion Sections */}
              <div className="border-t border-gray-100">
                {/* Description */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => setActiveSection(activeSection === "description" ? "" : "description")}
                    className="w-full py-4 flex justify-between items-center text-left hover:text-[#F8BBD0] transition-colors"
                  >
                    <span className="font-semibold text-[#1A1A1A]">Description</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${activeSection === "description" ? "rotate-180 text-[#F8BBD0]" : "text-gray-400"}`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === "description" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                          {product.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Product Details */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => setActiveSection(activeSection === "details" ? "" : "details")}
                    className="w-full py-4 flex justify-between items-center text-left hover:text-[#F8BBD0] transition-colors"
                  >
                    <span className="font-semibold text-[#1A1A1A]">Product Details</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${activeSection === "details" ? "rotate-180 text-[#F8BBD0]" : "text-gray-400"}`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === "details" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 text-gray-600 text-sm space-y-2">
                          <p>• Handpicked fresh flowers</p>
                          <p>• Premium packaging</p>
                          <p>• Includes care instructions</p>
                          <p>• Seasonal varieties</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Shipping & Returns */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => setActiveSection(activeSection === "shipping" ? "" : "shipping")}
                    className="w-full py-4 flex justify-between items-center text-left hover:text-[#F8BBD0] transition-colors"
                  >
                    <span className="font-semibold text-[#1A1A1A]">Shipping & Returns</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${activeSection === "shipping" ? "rotate-180 text-[#F8BBD0]" : "text-gray-400"}`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === "shipping" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 space-y-4">
                          <div className="flex items-start gap-3">
                            <Truck size={18} className="text-[#F8BBD0] mt-0.5" />
                            <div>
                              <p className="font-medium text-[#1A1A1A] text-sm">Free Delivery</p>
                              <p className="text-xs text-gray-500">On all orders above ₹500. Standard delivery takes 2-4 hours inside Delhi.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <RefreshCw size={18} className="text-[#F8BBD0] mt-0.5" />
                            <div>
                              <p className="font-medium text-[#1A1A1A] text-sm">Freshness Guarantee</p>
                              <p className="text-xs text-gray-500">If you're not satisfied with the freshness, we'll replace it immediately.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Shield size={18} className="text-[#F8BBD0] mt-0.5" />
                            <div>
                              <p className="font-medium text-[#1A1A1A] text-sm">Secure Payment</p>
                              <p className="text-xs text-gray-500">100% secure checkout with all major cards and UPI.</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- REVIEWS ---------- */}

        <div className="mt-20 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif">Customer Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={14}
                      className="text-[#F8BBD0]"
                      fill={avgRating >= n ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {avgRating.toFixed(1)} ({reviews.length})
                </span>
              </div>
            )}
          </div>

          {reviews.length === 0 && (
            <p className="text-gray-400 text-sm italic mb-6">
              No reviews yet — be the first 🌸
            </p>
          )}

          {user && (
            <div className="bg-white p-8 rounded-2xl mb-8 shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4 text-[#F8BBD0]">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={20}
                    onClick={() => setRating(n)}
                    fill={rating >= n ? "currentColor" : "none"}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  />
                ))}
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-4 focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all text-sm resize-none"
                placeholder="Write your review..."
                rows={3}
              />

              <button
                onClick={submitReview}
                className="mt-4 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-full hover:bg-black transition-colors"
              >
                Submit Review
              </button>
            </div>
          )}

          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">{r.user.name}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className="text-[#F8BBD0]"
                          fill={i < r.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>

                {/* Replies */}
                {r.replies.length > 0 && (
                  <div className="ml-6 mt-4 space-y-3 border-l-2 border-[#F8BBD0]/20 pl-4">
                    {r.replies.map((rep) => (
                      <div key={rep._id}>
                        <p className="text-sm font-semibold text-[#1A1A1A]">
                          {rep.user.name}
                        </p>
                        <p className="text-sm text-gray-500">{rep.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {user && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <input
                      value={replyText[r._id] || ""}
                      onChange={(e) =>
                        setReplyText((p) => ({
                          ...p,
                          [r._id]: e.target.value,
                        }))
                      }
                      className="flex-1 border border-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#F8BBD0]"
                      placeholder="Write a reply..."
                    />

                    <Button
                      size="sm"
                      onClick={() => submitReply(r._id)}
                      className="rounded-full"
                    >
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;

