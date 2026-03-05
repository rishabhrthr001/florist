import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
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
import { Helmet } from "react-helmet-async";

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
  premiumWrapping?: boolean;
}

/* ---------------- COMPONENT ---------------- */

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const { user, token } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [crossSells, setCrossSells] = useState<Product[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [replyBox, setReplyBox] = useState<Record<string, string>>({});

  const [hasPremiumWrapping, setHasPremiumWrapping] = useState(false);

  const inWishlist = product ? isInWishlist(product._id) : false;

  /* ---------------- FETCH PRODUCT ---------------- */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API}/product/slug/${slug}`);
        setProduct(data);
        
        // Fetch cross-sell
        if (data && data._id) {
           const crossRes = await axios.get(`${API}/product`);
           const others = crossRes.data.filter((p: any) => p._id !== data._id).slice(0, 4);
           setCrossSells(others);
        }
      } finally {
        setLoading(false);
      }
    };

    window.scrollTo(0, 0);

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
      price: product.price + (product.premiumWrapping ? 0 : (hasPremiumWrapping ? 300 : 0)),
      image: product.images[0],
      quantity: qty,
      hasPremiumWrapping: product.premiumWrapping || hasPremiumWrapping,
    });

    toast.success(`Handcrafted ${product.name} added to cart 🛒`);
  };

  /* ---------------- WISHLIST ---------------- */

  const handleWishlist = () => {
    if (!product) return;

    if (inWishlist) {
      removeFromWishlist(product._id);
      toast.success("Removed from wishlist 💔");
    } else {
      addToWishlist({
        _id: product._id,
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
      <Helmet>
        <title>{product.name} | Mangalam Florist</title>
        <meta name="description" content={product.description.substring(0, 150) + "..."} />
        <meta property="og:title" content={`${product.name} | Mangalam Florist`} />
        <meta property="og:description" content={product.description.substring(0, 150) + "..."} />
        <meta property="og:image" content={product.images[0]} />
        <link rel="canonical" href={`https://mangalamflorist.com/product/${product.slug}`} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 pt-28">
        
        {/* BREADCRUMBS */}
        <nav className="flex text-[10px] sm:text-[11px] text-gray-400 mb-6 md:mb-10 border-b border-gray-200/50 pb-4 font-bold uppercase tracking-widest max-w-[120rem] mx-auto overflow-hidden">
          <Link to="/" className="hover:text-black transition-colors shrink-0">Home</Link>
          <span className="mx-2 shrink-0">/</span>
          <Link to="/explore" className="hover:text-black transition-colors shrink-0">Products</Link>
          <span className="mx-2 shrink-0">/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        {/* PRODUCT SECTION */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 max-w-[120rem] mx-auto">
          
          {/* LEFT: IMAGE GALLERY (STICKY) */}
          <div className="flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-32 h-max lg:self-start lg:max-h-[calc(100vh-8rem)]">
            
            {/* THUMBNAILS */}
            {product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide w-full md:w-auto shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`shrink-0 w-16 sm:w-20 md:w-24 aspect-[4/5] rounded-[1rem] md:rounded-[1.25rem] overflow-hidden border-2 transition-all duration-300 ${
                      idx === activeImg ? "border-pink-300 shadow-md scale-[1.02]" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover bg-white" />
                  </button>
                ))}
              </div>
            )}

            {/* MAIN IMAGE */}
            <div className="w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white border border-gray-100 relative group aspect-[4/5] md:aspect-[3/4] lg:min-h-[650px] shadow-sm">
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.15] cursor-zoom-in"
              />
              
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={handleWishlist}
                  className={`backdrop-blur-md p-3 rounded-full transition-all shadow-[0_4px_15px_rgba(0,0,0,0.05)] ${
                    inWishlist
                      ? "bg-white text-[#EE1C47]"
                      : "bg-white/80 text-gray-400 hover:text-[#EE1C47] hover:bg-white"
                  }`}
                >
                  <Heart size={20} fill={inWishlist ? "currentColor" : "none"} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS (SCROLLABLE) */}
          <div className="relative">
            <div className="flex flex-col gap-6">
              
              <div className="border-b border-gray-100 pb-6 md:pb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-serif tracking-tight text-gray-900 mb-4 leading-[1.15]">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5 bg-[#FBFBFB] px-2.5 py-1 rounded-md border border-gray-200/60 shadow-sm">
                     <span className="text-yellow-500 text-sm font-bold">★ 4.8</span>
                  </div>
                  <span className="text-gray-400 text-sm hover:underline cursor-pointer font-medium">Read {reviews.length > 0 ? reviews.length : 120} Reviews</span>
                </div>

                <div className="flex flex-wrap items-end gap-3 mb-1">
                  <span className="font-sans font-bold text-3xl md:text-4xl text-gray-900 tracking-tight">₹{product.price.toLocaleString()}</span>
                  <span className="text-sm md:text-base text-gray-400 line-through mb-1 font-light">₹{(product.price * 1.4).toFixed(0).toLocaleString()}</span>
                  <span className="text-[10px] md:text-xs text-green-700 font-bold mb-1.5 ml-1 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase tracking-wide">28% OFF</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Inclusive of all taxes</p>
              </div>

              {/* PREMIUM WRAPPING BLOCKS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <div className="bg-white border text-center p-3 sm:p-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-0.5 border-pink-100/50">
                  <span className="text-2xl mb-1">🛵</span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#EE1C47]">Express Delivery</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-400 tracking-wide font-medium">Delhi NCR Only</span>
                </div>
                
                {product.premiumWrapping ? (
                  <div className="bg-white border-2 border-pink-500 text-center p-3 sm:p-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden transition-transform animate-pulse-subtle">
                    <div className="absolute top-0 right-0 bg-pink-500 text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-tighter">Complimentary</div>
                    <span className="text-2xl mb-1">🎀</span>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-pink-600">Premium Wrapping</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Included</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => setHasPremiumWrapping(!hasPremiumWrapping)}
                    className={`text-center p-3 sm:p-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all border-2 ${hasPremiumWrapping ? 'border-pink-500 bg-pink-50/10 scale-[1.02]' : 'border-gray-100 bg-white hover:border-pink-200'}`}
                  >
                    <span className="text-2xl mb-1">🎀</span>
                    <div className="flex flex-col items-center">
                      <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${hasPremiumWrapping ? 'text-pink-600' : 'text-gray-800'}`}>Premium Wrapping</span>
                      <span className={`text-[9px] sm:text-[10px] font-bold ${hasPremiumWrapping ? 'text-pink-500' : 'text-gray-400'}`}>
                        {hasPremiumWrapping ? 'ADDED ✓' : 'Add + ₹300'}
                      </span>
                    </div>
                  </button>
                )}
              </div>

              {/* ACTIONS - Hidden on mobile, sticky bar used instead */}
              <div className="hidden md:flex gap-4 mt-2">
                <div className="flex items-center justify-between bg-white rounded-full border border-gray-200/60 p-1.5 w-[120px] sm:w-36 h-[3.5rem] shadow-sm shrink-0">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all text-gray-600 border border-transparent hover:border-gray-200">
                    <Minus size={16} strokeWidth={2}/>
                  </button>
                  <span className="font-bold text-gray-800 text-sm">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all text-gray-600 border border-transparent hover:border-gray-200">
                    <Plus size={16} strokeWidth={2} />
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 h-[3.5rem] bg-black text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>
              </div>

              {/* ACCORDION DESC */}
              <div className="mt-4 border border-gray-100 bg-white rounded-[1.5rem] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div 
                  className="p-5 md:p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                >
                  <span className="font-bold text-xs md:text-sm tracking-widest text-gray-800 uppercase">Product Details</span>
                  <ChevronDown size={18} className={`transition-transform duration-300 text-gray-400 ${isDescExpanded ? 'rotate-180' : ''}`} />
                </div>
                
                <motion.div
                  initial={false}
                  animate={{ height: isDescExpanded ? "auto" : 0, opacity: isDescExpanded ? 1 : 0 }}
                  className="overflow-hidden bg-[#FBFBFB]"
                >
                  <div className="p-6 pt-2 text-[#4A4A4A] text-[13px] md:text-[14px] leading-[1.8] whitespace-pre-line border-t border-gray-100 font-medium">
                    {product.description}
                  </div>
                </motion.div>
              </div>
              
              {/* TRUST BADGES */}
              <div className="mt-4 text-center text-[10px] md:text-[11px] text-gray-400 flex flex-wrap justify-center gap-4 md:gap-6 font-bold uppercase tracking-wide">
                <span className="flex items-center gap-1.5"><span className="text-[#EE1C47]">✓</span> 100% Freshness</span>
                <span className="flex items-center gap-1.5"><span className="text-[#EE1C47]">✓</span> Secure Checkout</span>
                <span className="flex items-center gap-1.5"><span className="text-[#EE1C47]">✓</span> Easy Returns</span>
              </div>

            </div>
          </div>
        </div>

        {/* CROSS-SELLING */}
        {crossSells.length > 0 && (
          <div className="mt-24 max-w-[120rem] mx-auto">
             <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-4">
               <h2 className="font-serif italic font-semibold text-3xl md:text-4xl text-gray-900 tracking-tight">You Might Also Like</h2>
               <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-black transition-colors block pb-1 md:hidden" onClick={() => navigate('/explore')}>Discover More →</span>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
               {crossSells.map((p) => (
                 <ProductCard key={p._id} product={p} />
               ))}
             </div>
          </div>
        )}

        {/* REVIEWS SECTION */}
        <div className="mt-28 max-w-[120rem] mx-auto border-t border-gray-200/50 pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif italic mb-2 tracking-tight">Customer Reviews</h2>
              <p className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-widest">Real experiences from our customers.</p>
            </div>
            <div className="flex bg-white shadow-sm items-center gap-2 px-5 py-2.5 border border-gray-100 rounded-full shrink-0">
              <Star size={18} fill="#EAB308" className="text-yellow-500" />
              <span className="font-bold text-gray-800 text-lg">4.8</span>
              <span className="text-gray-400 text-xs font-bold tracking-wide uppercase">(Based on {reviews.length > 0 ? reviews.length : 120} reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10">
            {/* WRITE */}
            <div className="w-full">
              {user ? (
                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] lg:sticky lg:top-32">
                  <h3 className="font-bold font-serif text-2xl mb-4 italic">Write a Review</h3>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you loved about this product..."
                    className="w-full resize-none p-5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-pink-300 focus:bg-white transition-colors mb-4 font-medium"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />

                  <button 
                    className="w-full bg-black text-white text-[11px] uppercase tracking-widest font-bold py-4 rounded-full hover:bg-gray-800 transition-all shadow-md"
                    onClick={submitReview}
                  >
                    Post Review
                  </button>
                </div>
              ) : (
                <div className="bg-[#FBFBFB] p-8 rounded-[2rem] border border-gray-100 text-center flex flex-col items-center justify-center min-h-[250px] lg:sticky lg:top-32">
                  <h3 className="font-bold font-serif italic text-2xl mb-2">Join the Conversation</h3>
                  <p className="text-gray-500 text-sm mb-6 font-medium">You must be logged in to leave a review.</p>
                  <Button onClick={() => navigate('/auth?mode=login')} className="px-8 py-3.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Login Here</Button>
                </div>
              )}
            </div>

            {/* LIST */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                 <div className="bg-white p-12 rounded-[2rem] border border-gray-100 text-center flex flex-col items-center justify-center h-full min-h-[250px] shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
                    <p className="text-gray-400 font-serif italic text-2xl mb-2">No reviews yet...</p>
                    <p className="text-gray-400 text-sm font-medium tracking-wide">Be the first to share your thoughts!</p>
                 </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-gray-800 font-bold font-serif text-lg">
                          {rev.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-tight tracking-wide">{rev.user.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={11} fill={i < rev.rating ? "#EAB308" : "#E5E7EB"} className={i < rev.rating ? "text-yellow-500" : "text-gray-200"} />
                             ))}
                          </div>
                        </div>
                      </div>

                      {rev.user._id === user?._id && (
                        <button onClick={() => deleteReview(rev._id)} className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-colors shrink-0">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <p className="mt-2 text-[#4A4A4A] text-sm md:text-[15px] leading-relaxed mb-4 font-medium">{rev.comment}</p>

                    {/* REPLIES */}
                    {rev.replies && rev.replies.length > 0 && (
                      <div className="ml-6 md:ml-12 mt-6 space-y-3 pl-4 border-l-2 border-gray-100">
                        {rev.replies.map((r) => (
                          <div
                            key={r._id}
                            className="bg-[#FBFBFB] border border-gray-100 p-4 md:p-5 rounded-2xl flex justify-between group transition-colors hover:bg-white"
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-900 mb-1.5">{r.user.name} <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold ml-1 tracking-wider inline-block border border-blue-100">Author</span></p> 
                              <p className="text-[13px] md:text-sm text-gray-600 font-medium leading-relaxed">{r.comment}</p>
                            </div>

                            {r.user._id === user?._id && (
                              <button onClick={() => deleteReply(rev._id, r._id)} className="p-2 opacity-0 group-hover:opacity-100 bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all self-start">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* REPLY BOX */}
                    {user && (
                      <div className="mt-6 ml-6 md:ml-12 flex gap-2 w-full lg:w-3/4">
                        <input
                          value={replyBox[rev._id] || ""}
                          onChange={(e) =>
                            setReplyBox((p) => ({
                              ...p,
                              [rev._id]: e.target.value,
                            }))
                          }
                          placeholder="Write a reply..."
                          className="flex-1 bg-gray-50 border border-gray-100 focus:border-pink-200 focus:bg-white rounded-full px-5 py-2.5 text-sm outline-none transition-colors font-medium"
                        />

                        <button
                          className="bg-gray-900 text-white rounded-full px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold hover:bg-black transition-all shadow-sm shrink-0"
                          onClick={() => submitReply(rev._id)}
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* MOBILE STICKY ADD TO CART */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 z-50 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-6">
         <div className="flex items-center justify-between bg-white rounded-full border border-gray-200/60 p-1 w-[120px] shrink-0 h-14">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all text-gray-400">
               <Minus size={16} />
            </button>
            <span className="font-bold text-gray-800 text-sm">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all text-gray-400">
               <Plus size={16} />
            </button>
         </div>
         <button onClick={handleAddToCart} className="flex-1 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg h-14 flex items-center justify-center gap-2">
            Add • ₹{((product.price + (product.premiumWrapping ? 0 : (hasPremiumWrapping ? 300 : 0))) * qty).toLocaleString()}
         </button>
      </div>
    </motion.div>
  );
};

export default ProductDetail;
