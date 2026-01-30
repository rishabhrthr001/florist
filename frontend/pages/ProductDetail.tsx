import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  Minus,
  Plus,
} from "lucide-react";

import API from "../config";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

/* ---------------- TYPES ---------------- */

interface Category {
  _id: string;
  name: string;
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
  const { user, token } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

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
      .catch(() => {});
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
        },
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
        },
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
      <div className="p-32 text-center font-serif text-2xl text-gray-400">
        Loading product…
      </div>
    );

  if (!product)
    return (
      <div className="p-32 text-center font-serif text-2xl">
        Product not found
      </div>
    );

  /* ---------------- IMAGE CONTROLS ---------------- */

  const nextImg = () =>
    setActiveImg((prev) => (prev + 1) % product.images.length);

  const prevImg = () =>
    setActiveImg(
      (prev) => (prev - 1 + product.images.length) % product.images.length,
    );

  /* ---------------- UI ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FAFAFA]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 pt-28 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12">
          {/* GALLERY */}

          <div className="bg-white p-6 rounded-3xl shadow-sm border">
            <div className="space-y-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F0F0F0]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={product.images[activeImg]}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between">
                  <button onClick={prevImg}>
                    <ChevronLeft />
                  </button>
                  <button onClick={nextImg}>
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* INFO */}

          <div className="bg-white rounded-3xl p-8 shadow-sm border">
            <h1 className="font-serif text-4xl mb-4">{product.name}</h1>

            <p className="text-xl font-semibold mb-6">
              ₹{product.price.toLocaleString()}
            </p>

            <p className="mb-10 whitespace-pre-line">{product.description}</p>

            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-3 bg-[#F7F7F7] px-4 py-2 rounded-full border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus size={14} />
                </button>

                <span>{qty}</span>

                <button onClick={() => setQty((q) => q + 1)}>
                  <Plus size={14} />
                </button>
              </div>

              <Button
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
            </div>

            <div className="border-t mt-10 pt-6 space-y-5">
              <div className="flex gap-3">
                <Truck size={18} />
                Complimentary Delivery
              </div>

              <div className="flex gap-3">
                <RefreshCw size={18} />
                Freshness Promise
              </div>
            </div>
          </div>
        </div>

        {/* ---------- REVIEWS ---------- */}

        <div className="mt-28 max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif mb-6">Customer Reviews</h2>

          {reviews.length === 0 && (
            <p className="text-gray-400 text-sm italic mb-6">
              No reviews yet — be the first 🌸
            </p>
          )}

          {user && (
            <div className="bg-white p-6 rounded-xl mb-8">
              <div className="flex gap-1 mb-3 text-[#F8BBD0]">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={20}
                    onClick={() => setRating(n)}
                    fill={rating >= n ? "currentColor" : "none"}
                    className="cursor-pointer"
                  />
                ))}
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Write your review..."
              />

              <Button className="mt-3" onClick={submitReview}>
                Submit Review
              </Button>
            </div>
          )}

          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white p-5 rounded-xl">
                <p className="font-semibold">{r.user.name}</p>

                <div className="flex gap-1 text-[#F8BBD0]">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>

                <p className="mt-2">{r.comment}</p>

                <div className="ml-6 mt-4 space-y-3">
                  {r.replies.map((rep) => (
                    <div key={rep._id}>
                      <p className="text-sm font-semibold">{rep.user.name}</p>
                      <p className="text-sm">{rep.comment}</p>
                    </div>
                  ))}

                  {user && (
                    <div className="flex gap-2 mt-2">
                      <input
                        value={replyText[r._id] || ""}
                        onChange={(e) =>
                          setReplyText((p) => ({
                            ...p,
                            [r._id]: e.target.value,
                          }))
                        }
                        className="flex-1 border rounded-lg px-3 py-1 text-sm"
                        placeholder="Reply..."
                      />

                      <Button size="sm" onClick={() => submitReply(r._id)}>
                        Send
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;
