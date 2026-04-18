import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { optimizeCloudinaryUrl } from "../lib/cloudinary";

/* ---------------- TYPES ---------------- */

interface User { _id: string; name: string; }
interface Reply { _id: string; user: User; comment: string; }
interface Review { _id: string; user: User; rating: number; comment: string; replies?: Reply[]; }
interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  premiumWrapping?: boolean;
  isOutOfStock?: boolean;
  categoryId?: { _id: string; name: string; slug: string; };
}

/* ---------------- CACHE ---------------- */

const getProductCache = (slug: string) => {
  try {
    const cached = sessionStorage.getItem(`product_detail_${slug}`);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
};

const getReviewsCache = (slug: string) => {
  try {
    const cached = sessionStorage.getItem(`product_reviews_${slug}`);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
};

/* ---------------- COMPONENT ---------------- */

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user, token } = useAuth();

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [replyBox, setReplyBox] = useState<Record<string, string>>({});
  const [hasPremiumWrapping, setHasPremiumWrapping] = useState(false);
  const [selectedVase, setSelectedVase] = useState<any | null>(null);

  /* ---------------- FETCH PRODUCT ---------------- */
  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/product/slug/${slug}`);
      sessionStorage.setItem(`product_detail_${slug!}`, JSON.stringify(data));
      return data as Product;
    },
    enabled: !!slug,
    initialData: slug ? getProductCache(slug) : undefined,
  });

  /* ---------------- FETCH CROSS-SELLS ---------------- */
  const { data: crossSells = [] } = useQuery({
    queryKey: ["cross_sells"],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/product?limit=25`);
      return (data.products || []).filter((p: any) => p.slug !== slug).slice(0, 4) as Product[];
    },
  });

  /* ---------------- FETCH VASES ---------------- */
  const { data: vases = [] } = useQuery({
    queryKey: ["vases"],
    queryFn: async () => {
      const res = await axios.get(`${API}/custom-bouquet`);
      return res.data
        .filter((item: any) => (item.type === 'vase' || item.type === 'base') && item.isActive)
        .map((item: any) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          images: [item.image],
          isOutOfStock: item.isOutOfStock
        })) as Product[];
    },
  });

  /* ---------------- FETCH REVIEWS ---------------- */
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", slug],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/reviews/product/${slug}`);
      sessionStorage.setItem(`product_reviews_${slug!}`, JSON.stringify(data));
      return data as Review[];
    },
    enabled: !!slug,
    initialData: slug ? getReviewsCache(slug) : undefined,
  });

  const inWishlist = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  /* ---------------- MUTATIONS ---------------- */
  const reviewMutation = useMutation({
    mutationFn: async (review: any) => {
      const { data } = await axios.post(`${API}/reviews`, review, { headers: { Authorization: `Bearer ${token}` } });
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["reviews", slug], (old: any) => [data, ...(old || [])]);
      setNewComment("");
      toast.success("Review added 🌸");
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API}/reviews/${id}/user`, { headers: { Authorization: `Bearer ${token}` } });
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(["reviews", slug], (old: any) => old?.filter((r: any) => r._id !== id));
      toast.success("Review deleted");
    }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, comment }: any) => {
      const { data } = await axios.post(`${API}/reviews/${id}/reply`, { comment }, { headers: { Authorization: `Bearer ${token}` } });
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["reviews", slug], (old: any) => old?.map((r: any) => r._id === data._id ? data : r));
      toast.success("Reply added");
    }
  });

  const deleteReplyMutation = useMutation({
    mutationFn: async ({ reviewId, replyId }: any) => {
      const { data } = await axios.delete(`${API}/reviews/${reviewId}/reply/${replyId}`, { headers: { Authorization: `Bearer ${token}` } });
      return { reviewId, data };
    },
    onSuccess: ({ reviewId, data }) => {
      queryClient.setQueryData(["reviews", slug], (old: any) => old?.map((r: any) => r._id === reviewId ? data : r));
      toast.success("Reply deleted");
    }
  });

  /* ---------------- HANDLERS ---------------- */
  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price + (product.premiumWrapping ? 0 : (hasPremiumWrapping ? 300 : 0)) + (selectedVase ? selectedVase.price : 0),
      image: product.images[0],
      quantity: qty,
      hasPremiumWrapping: product.premiumWrapping || hasPremiumWrapping,
      vase: selectedVase ? { id: selectedVase._id, name: selectedVase.name, price: selectedVase.price, image: selectedVase.images[0] } : undefined,
      categorySlug: (product as any).categoryId?.slug
    });
    toast.success(`Handcrafted ${product.name} added to cart 🛒`);
  };

  const handleWishlist = () => {
    if (!product) return;
    if (inWishlist) {
      removeFromWishlist(product._id);
      toast.success("Removed from wishlist 💔");
    } else {
      addToWishlist({ _id: product._id, name: product.name, price: product.price, image: product.images[0], slug: product.slug });
      toast.success("Added to wishlist ❤️");
    }
  };

  if (loadingProduct && !product) return <div className="min-h-screen grid place-items-center">Loading…</div>;
  if (!product) return <div className="min-h-screen grid place-items-center"><Link to="/explore">← Back</Link></div>;

  return (
    <motion.div className="bg-[#FAF9F6] min-h-screen">
      <Helmet>
        <title>{product.name} | Mangalam Florist</title>
        <meta name="description" content={product.description.substring(0, 150) + "..."} />
        <link rel="canonical" href={`https://mangalamflorist.com/product/${product.slug}`} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 pt-28">
        <nav className="flex text-[10px] sm:text-[11px] text-gray-400 mb-6 border-b border-gray-200/50 pb-4 font-bold uppercase tracking-widest overflow-hidden">
          <Link to="/" className="hover:text-black shrink-0">Home</Link>
          <span className="mx-2 shrink-0">/</span>
          <Link to="/explore" className="hover:text-black shrink-0">Products</Link>
          <span className="mx-2 shrink-0">/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        <div className="flex flex-col md:grid md:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16">
          <div className="flex flex-col-reverse md:flex-row gap-4 md:sticky md:top-32 h-max self-start">
            {product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto no-scrollbar w-full md:w-auto shrink-0">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImg(idx)} className={`w-16 sm:w-20 md:w-24 aspect-[4/5] rounded-[1rem] overflow-hidden border-2 transition-all ${idx === activeImg ? "border-pink-300 shadow-md" : "border-transparent opacity-60"}`}>
                    <img src={optimizeCloudinaryUrl(img, 200, true)} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="w-full rounded-[1.5rem] overflow-hidden bg-white border border-gray-100 relative group aspect-[4/5] shadow-sm">
              <img src={optimizeCloudinaryUrl(product.images[activeImg], 1200, true)} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.15] transition-transform duration-700" title={product.name} />
              <button onClick={handleWishlist} className={`absolute top-4 right-4 backdrop-blur-md p-3 rounded-full transition-all ${inWishlist ? "bg-white text-[#EE1C47]" : "bg-white/80 text-gray-400"}`}>
                <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="border-b border-gray-100 pb-6">
              <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-[#FBFBFB] px-2.5 py-1 rounded-md border text-yellow-500 text-sm font-bold">★ 4.8</span>
                <span className="text-gray-400 text-sm font-medium">Read {reviews.length || 120} Reviews</span>
              </div>
              <div className="flex flex-wrap items-end gap-3 mb-1">
                <span className="font-sans font-bold text-3xl text-gray-900">₹{product.price.toLocaleString()}</span>
                <span className="text-sm text-gray-400 line-through mb-1">₹{(product.price * 1.4).toFixed(0).toLocaleString()}</span>
                {product.isOutOfStock ? <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">Out of Stock</span> : <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">28% OFF</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-white border p-4 rounded-2xl flex flex-col items-center gap-1">
                <span className="text-2xl">🛵</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#EE1C47]">Express Delivery</span>
              </div>
              {product.premiumWrapping ? (
                <div className="bg-white border-2 border-pink-500 p-4 rounded-2xl flex flex-col items-center gap-1 relative">
                  <span className="absolute top-0 right-0 bg-pink-500 text-white text-[8px] px-2 py-0.5 uppercase">Complimentary</span>
                  <span className="text-2xl">🎀</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-pink-600">Premium Wrapping</span>
                </div>
              ) : (
                <button onClick={() => setHasPremiumWrapping(!hasPremiumWrapping)} className={`p-4 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${hasPremiumWrapping ? 'border-pink-500 bg-pink-50/10' : 'border-gray-100 bg-white'}`}>
                  <span className="text-2xl">🎀</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${hasPremiumWrapping ? 'text-pink-600' : 'text-gray-800'}`}>Premium Wrapping</span>
                  <span className="text-[9px] font-bold text-gray-400">{hasPremiumWrapping ? 'ADDED ✓' : 'Add + ₹300'}</span>
                </button>
              )}
            </div>

            {((product as any).categoryId?.slug === 'flowers' || (product as any).categoryId?.slug === 'bouquets') && vases.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-[1.25rem] p-4">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-800 mb-3">Complete the Look with a Vase</h4>
                 <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {vases.map((v) => (
                      <button key={v._id} onClick={() => setSelectedVase(selectedVase?._id === v._id ? null : v)} className={`flex-none w-[70px] transition-all ${selectedVase?._id === v._id ? 'scale-105' : 'opacity-70'}`}>
                        <div className={`aspect-square rounded-lg overflow-hidden border ${selectedVase?._id === v._id ? 'border-pink-500 shadow-sm' : 'border-transparent'}`}><img src={v.images[0]} className="w-full h-full object-cover" /></div>
                        <p className="text-[8px] font-bold mt-1 truncate">{v.name}</p>
                      </button>
                    ))}
                 </div>
              </div>
            )}

            <div className="md:flex gap-4 mt-2 hidden">
              <div className="flex items-center justify-between bg-white rounded-full border p-1.5 w-36 h-14">
                <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50"><Minus size={16}/></button>
                <span className="font-bold text-gray-800">{qty}</span>
                <button onClick={() => setQty(q => q+1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50"><Plus size={16}/></button>
              </div>
              <button onClick={handleAddToCart} disabled={product.isOutOfStock} className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${product.isOutOfStock ? "bg-gray-200 text-gray-400" : "bg-black text-white hover:bg-gray-800"}`}>
                <ShoppingBag size={18} /> {product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            <div className="mt-4 border border-gray-100 bg-white rounded-[1.5rem] overflow-hidden">
              <div className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => setIsDescExpanded(!isDescExpanded)}>
                <span className="font-bold text-xs tracking-widest text-gray-800 uppercase">Product Details</span>
                <ChevronDown size={18} className={`transition-transform ${isDescExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isDescExpanded && <div className="p-6 pt-2 text-[#4A4A4A] text-sm whitespace-pre-line border-t border-gray-100">{product.description}</div>}
            </div>
          </div>
        </div>

        {crossSells.length > 0 && (
          <div className="mt-24">
             <h2 className="font-serif italic text-3xl mb-8 border-b border-gray-100 pb-4">You Might Also Like</h2>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">{crossSells.map(p => <ProductCard key={p._id} product={p} />)}</div>
          </div>
        )}

        <div className="mt-28 border-t border-gray-200 pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <h2 className="text-3xl font-serif italic mb-2">Customer Reviews</h2>
            <div className="flex items-center gap-2 px-5 py-2.5 border rounded-full bg-white"><Star size={18} fill="#EAB308" className="text-yellow-500" /><span className="font-bold text-lg">4.8</span> <span className="text-gray-400 text-xs font-bold">({reviews.length || 120} reviews)</span></div>
          </div>
          <div className="grid lg:grid-cols-[1fr_2.5fr] gap-10">
            <div className="w-full">{user ? (
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm sticky top-32">
                  <h3 className="font-bold font-serif text-2xl mb-4 italic">Write a Review</h3>
                  <textarea rows={4} className="w-full resize-none p-5 bg-gray-50 border rounded-2xl text-sm mb-4" placeholder="Share your experience..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                  <button className="w-full bg-black text-white py-4 rounded-full uppercase text-xs font-bold" onClick={() => reviewMutation.mutate({ slug, rating, comment: newComment })}>Post Review</button>
                </div>
              ) : <div className="bg-[#FBFBFB] p-8 rounded-[2rem] text-center border"><h3>Join the Conversation</h3><p className="text-gray-500 text-sm mb-6">Login to leave a review.</p><Button onClick={() => navigate('/auth')}>Login Here</Button></div>}
            </div>
            <div className="space-y-6">{reviews.length === 0 ? <div className="bg-white p-12 text-center rounded-[2rem]">No reviews yet...</div> : reviews.map(rev => (
                  <div key={rev._id} className="bg-white p-6 rounded-[2rem] border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center font-bold text-lg">{rev.user.name.charAt(0)}</div><div><p className="font-bold">{rev.user.name}</p></div></div>
                      {rev.user._id === user?._id && <button onClick={() => deleteReviewMutation.mutate(rev._id)} className="p-2 text-red-500"><Trash2 size={16} /></button>}
                    </div>
                    <p className="text-[#4A4A4A] mb-4">{rev.comment}</p>
                    {rev.replies?.map(r => (
                      <div key={r._id} className="ml-12 mt-4 p-4 bg-gray-50 rounded-2xl flex justify-between">
                        <div><p className="text-xs font-bold">{r.user.name}</p><p className="text-sm">{r.comment}</p></div>
                        {r.user._id === user?._id && <button onClick={() => deleteReplyMutation.mutate({ reviewId: rev._id, replyId: r._id })} className="text-red-500"><Trash2 size={14} /></button>}
                      </div>
                    ))}
                    {user && <div className="mt-6 ml-12 flex gap-2"><input className="flex-1 bg-gray-50 border rounded-full px-5 py-2" placeholder="Write a reply..." value={replyBox[rev._id] || ""} onChange={e => setReplyBox({...replyBox, [rev._id]: e.target.value})} /><button className="bg-black text-white rounded-full px-5 py-2 text-[10px] font-bold" onClick={() => replyMutation.mutate({ id: rev._id, comment: replyBox[rev._id] })}>Reply</button></div>}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t p-5 z-50 flex gap-3 pb-8">
         <div className="flex items-center justify-between bg-white rounded-full border p-1 w-[120px] h-14">
            <button onClick={() => setQty(Math.max(1, qty-1))} className="w-11 h-11"><Minus size={16}/></button>
            <span className="font-bold text-sm">{qty}</span>
            <button onClick={() => setQty(qty+1)} className="w-11 h-11"><Plus size={16}/></button>
         </div>
         <button onClick={handleAddToCart} disabled={product.isOutOfStock} className="flex-1 bg-black text-white rounded-full text-[11px] font-bold h-14">
            {product.isOutOfStock ? "Out of Stock" : `Add • ₹${((product.price + (product.premiumWrapping ? 0 : (hasPremiumWrapping ? 300 : 0)) + (selectedVase ? selectedVase.price : 0)) * qty).toLocaleString()}`}
         </button>
      </div>
    </motion.div>
  );
};

export default ProductDetail;
