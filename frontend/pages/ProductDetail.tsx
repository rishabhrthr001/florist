import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

import Button from "../components/Button";
import {
  ShoppingBag,
  Star,
  ChevronDown,
  Minus,
  Plus,
  Heart,
  Trash2,
} from "lucide-react";

import API from "../config";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

/* ---------------- TYPES ---------------- */

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
  replies?: Reply[];
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
}

/* ---------------- COMPONENT ---------------- */

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const { user, token } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [replyBox, setReplyBox] = useState<Record<string, string>>({});

  const inWishlist = product ? isInWishlist(product._id) : false;

  /* ---------------- FETCH PRODUCT ---------------- */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API}/product/slug/${slug}`);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  /* ---------------- FETCH REVIEWS ---------------- */

  useEffect(() => {
    if (!slug) return;

    axios
      .get(`${API}/reviews/product/${slug}`)
      .then((res) => setReviews(res.data));
  }, [slug]);

  /* ---------------- REVIEW ACTIONS ---------------- */

  const submitReview = async () => {
    if (!newComment.trim()) return;

    try {
      const { data } = await axios.post(
        `${API}/reviews`,
        { slug, rating, comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setReviews((prev) => [data, ...prev]);
      setNewComment("");
      toast.success("Review added 🌸");
    } catch {
      toast.error("Failed to submit review");
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await axios.delete(`${API}/reviews/${id}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("Review deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const submitReply = async (id: string) => {
    if (!replyBox[id]) return;

    try {
      const { data } = await axios.post(
        `${API}/reviews/${id}/reply`,
        { comment: replyBox[id] },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setReviews((prev) => prev.map((r) => (r._id === id ? data : r)));
      setReplyBox((p) => ({ ...p, [id]: "" }));
    } catch {
      toast.error("Reply failed");
    }
  };

  const deleteReply = async (reviewId: string, replyId: string) => {
    try {
      const { data } = await axios.delete(
        `${API}/reviews/${reviewId}/reply/${replyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setReviews((prev) => prev.map((r) => (r._id === reviewId ? data : r)));

      toast.success("Reply deleted");
    } catch {
      toast.error("Delete reply failed");
    }
  };

  /* ---------------- CART / BUY ---------------- */

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: qty,
    });

    toast.success("Added to cart 🛒");
  };

  /* ---------------- WISHLIST ---------------- */

  const handleWishlist = () => {
    if (!product) return;

    if (inWishlist) {
      removeFromWishlist(product._id);
      toast.success("Removed from wishlist 💔");
    } else {
      addToWishlist({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        slug: product.slug,
      });

      toast.success("Added to wishlist ❤️");
    }
  };

  /* ---------------- UI ---------------- */

  if (loading)
    return <div className="min-h-screen grid place-items-center">Loading…</div>;
  if (!product)
    return (
      <div className="min-h-screen grid place-items-center">
        <Link to="/explore">← Back</Link>
      </div>
    );

  return (
    <motion.div className="bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 pt-28">
        {/* GRID */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.1fr] gap-12">
          {/* IMAGE */}
          <div className="lg:sticky lg:top-32">
            <div className="rounded-[36px] overflow-hidden">
              <img
                src={product.images[activeImg]}
                className="w-full h-[48vh] sm:h-[55vh] md:h-[420px] lg:h-[520px] object-contain"
              />
            </div>
          </div>

          {/* INFO */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border">
            <h1 className="text-3xl font-serif mb-2">{product.name}</h1>
            <p className="text-xl mb-6">₹{product.price}</p>

            {/* ACTIONS */}
            <div className="space-y-3">
              {/* Qty + Wishlist */}
              <div className="flex gap-3">
                <div className="flex items-center border h-8 w-24 rounded-full">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus size={12} />
                  </button>
                  <span className="flex-1 text-center text-xs">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)}>
                    <Plus size={12} />
                  </button>
                </div>

                <button
                  onClick={handleWishlist}
                  className={`h-8 w-10 border rounded-full grid place-items-center ${
                    inWishlist
                      ? "bg-pink-100 border-pink-300 text-pink-600"
                      : ""
                  }`}
                >
                  <Heart
                    size={14}
                    fill={inWishlist ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Cart + Buy */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-8 text-xs bg-black text-white rounded-full"
                >
                  <ShoppingBag size={14} /> Add
                </Button>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-8 border-t pt-6">
              <p className={`${!isDescExpanded ? "line-clamp-3" : ""}`}>
                {product.description}
              </p>

              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-[#F8BBD0] text-sm mt-2 flex gap-1"
              >
                {isDescExpanded ? "Read Less" : "Read More"}
                <ChevronDown size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif mb-6">Reviews</h2>

          {/* WRITE */}
          {user && (
            <div className="bg-white p-6 rounded-2xl border mb-10">
              <textarea
                rows={3}
                placeholder="Write your review"
                className="w-full resize-none"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />

              <Button className="mt-3 text-sm" onClick={submitReview}>
                Post Review
              </Button>
            </div>
          )}

          {/* LIST */}
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="bg-white p-5 rounded-2xl border">
                <div className="flex justify-between">
                  <p className="font-semibold">{rev.user.name}</p>

                  {rev.user._id === user?._id && (
                    <Trash2
                      size={16}
                      className="cursor-pointer text-red-400"
                      onClick={() => deleteReview(rev._id)}
                    />
                  )}
                </div>

                <p className="mt-2 text-gray-600">{rev.comment}</p>

                {/* REPLIES */}
                <div className="ml-6 mt-4 space-y-3">
                  {rev.replies?.map((r) => (
                    <div
                      key={r._id}
                      className="bg-gray-50 p-3 rounded-xl flex justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{r.user.name}</p>
                        <p className="text-sm">{r.comment}</p>
                      </div>

                      {r.user._id === user?._id && (
                        <Trash2
                          size={14}
                          className="cursor-pointer text-red-400"
                          onClick={() => deleteReply(rev._id, r._id)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* REPLY BOX */}
                {user && (
                  <div className="mt-3 ml-6">
                    <input
                      value={replyBox[rev._id] || ""}
                      onChange={(e) =>
                        setReplyBox((p) => ({
                          ...p,
                          [rev._id]: e.target.value,
                        }))
                      }
                      placeholder="Reply..."
                      className="border rounded-lg px-3 py-1 text-sm w-full"
                    />

                    <Button
                      className="mt-2 text-xs"
                      onClick={() => submitReply(rev._id)}
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
