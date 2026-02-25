import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";

import { Heart, Gift, Users, User as UserIcon, Clock, Sparkles, ShieldCheck } from "lucide-react";

import API from "../config";

/* ---------------- TYPES ---------------- */

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Banner {
  _id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  link: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  categoryId: Category;
}

/* ---------------- COMPONENT ---------------- */

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH HOME SECTIONS ---------------- */

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchHome = async () => {
      try {
        setLoading(true);

        const [productRes, catRes] = await Promise.all([
          axios.get(`${API}/product`), // Fetching all products
          axios.get(`${API}/category`),
        ]);

        const allProducts = Array.isArray(productRes.data) ? productRes.data : [];

        // Randomly pull 8 products but prioritize those with real images over placeholders
        const shuffled = [...allProducts].sort((a, b) => {
          const aValid = (a.images?.[0] && !a.images[0].includes("placeholder")) ? 1 : 0;
          const bValid = (b.images?.[0] && !b.images[0].includes("placeholder")) ? 1 : 0;
          if (aValid !== bValid) return bValid - aValid;
          return 0.5 - Math.random();
        });
        const bestSellerItems = shuffled.slice(0, 8);

        const catList: Category[] = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.categories || catRes.data?.items || [];

        setCategories(catList);
        setBestSellers(bestSellerItems);
      } catch (err) {
        console.error("Homepage fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, []);

  /* ---------------- DESKTOP & DEFAULT BANNERS ---------------- */

  const defaultBanners: Banner[] = [
    { _id: 'b1', title: 'Birthdays', description: 'Make their day unforgettable with our premium arrangements.', category: 'Birthday', link: '/explore', imageUrl: '/banners/birthday.png' },
    { _id: 'b2', title: 'Anniversary', description: 'Celebrate your love with timeless romance and fresh blooms.', category: 'Anniversary', link: '/explore', imageUrl: '/banners/anniversary.png' },
    { _id: 'b3', title: 'Wedding', description: 'Elegant gifts for their perfect beginning together.', category: 'Wedding', link: '/explore', imageUrl: '/banners/wedding.png' },
    { _id: 'b4', title: 'For Her', description: 'Chic, delicate curations designed beautifully for her.', category: 'For Her', link: '/explore', imageUrl: '/banners/for_her.png' },
    { _id: 'b5', title: 'For Him', description: 'Sophisticated and sleek luxury gifts for the modern man.', category: 'For Him', link: '/explore', imageUrl: '/banners/for_him.png' },
  ];

  const displayBanners = defaultBanners;

  /* ---------------- SHOP CATEGORIES ---------------- */

  const shopCategories = [
    { name: "Birthdays", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=300&q=80", link: "/explore?category=birthday" },
    { name: "Anniversary", image: "/categories-new/anniversary.png", link: "/explore?category=anniversary" },
    { name: "Chocolates", image: "/categories-new/chocolates.png", link: "/explore?category=chocolates" },
    { name: "Cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80", link: "/explore?category=cakes" },
    { name: "Balloon Decor", image: "/categories-new/balloons.png", link: "/explore?category=decorations" },
    { name: "Plants", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&q=80", link: "/explore?category=plants" },
    { name: "Big Bunches", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=300&q=80", link: "/explore?category=big-bunches" },
  ];

  /* ---------------- CELEBRATE LOVE ---------------- */

  const celebrateLoveCategories = [
    { name: "Wedding", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&q=80", link: "/explore?category=wedding" },
    { name: "Anniversary", image: "/categories-new/anniversary.png", link: "/explore?category=anniversary" },
    { name: "Thinking Of You", image: "/categories-new/thinking.png", link: "/explore?category=thinking-of-you" },
    { name: "I Am Sorry", image: "/categories-new/sorry.png", link: "/explore?category=sorry" },
    { name: "Romantic Flowers", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=300&q=80", link: "/explore?category=flowers" },
    { name: "For Girlfriend", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300&q=80", link: "/explore?category=girlfriend" },
    { name: "For Boyfriend", image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=300&q=80", link: "/explore?category=boyfriend" },
    { name: "Miss You", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=300&q=80", link: "/explore?category=miss-you" },
  ];

  /* ---------------- CHERISHED CELEBRATIONS ---------------- */

  const favouriteFlowers = [
    { name: "Classic Roses", slug: "roses", image: "/bouquets/bouquet_roses_1771938143113.png" },
    { name: "White Lilies", slug: "lilies", image: "/bouquets/bouquet_lilies_1771939456508.png" },
    { name: "Bright Sunflowers", slug: "sunflowers", image: "/bouquets/bouquet_sunflowers_1771938400635.png" },
    { name: "Purple Orchids", slug: "orchids", image: "/bouquets/bouquet_orchids_1771938645237.png" },
    { name: "Soft Carnations", slug: "carnations", image: "/bouquets/bouquet_carnations_1771938818246.png" },
    { name: "Mixed Blooms", slug: "mixed", image: "/bouquets/bouquet_mixed_1771939118931.png" },
  ];

  const cherishedCelebrationsCategories = [
    { name: "Baby Shower", image: "/banners/icon_baby_shower.png", link: "/explore?category=baby-shower" },
    { name: "Retirement", image: "/banners/icon_retirement.png", link: "/explore?category=retirement" },
    { name: "New Born", image: "/categories-new/newborn.png", link: "/explore?category=new-born" },
    { name: "Wellness & Care", image: "/categories-new/wellness.png", link: "/explore?category=wellness" },
    { name: "Thank You", image: "/categories-new/thankyou.png", link: "/explore?category=thank-you" },
    { name: "Best Wishes", image: "/categories-new/bestwishes.png", link: "/explore?category=best-wishes" },
    { name: "Balloons", image: "/categories-new/balloons.png", link: "/explore?category=decorations" },
    { name: "Housewarming", image: "/categories-new/housewarming.png", link: "/explore?category=housewarming" },
  ];

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-32 pb-10">
      
      {/* ---------------- BANNERS SECTION ---------------- */}
      <section className="mb-20 max-w-[120rem] mx-auto px-4 md:px-8">
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {displayBanners.map((banner, idx) => (
            <motion.div
              key={banner._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              onClick={() => navigate(banner.link || '/explore')}
              className="min-w-[88vw] md:min-w-[900px] aspect-[16/9] md:aspect-[21/9] relative rounded-[2.5rem] overflow-hidden cursor-pointer group snap-center shadow-md border border-gray-200/50 flex-shrink-0"
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center">
                <span className="text-pink-200 text-xs md:text-[13px] font-bold tracking-[0.2em] uppercase mb-3">
                  {banner.category}
                </span>
                <h3 className="text-white font-serif italic text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-4 lg:w-2/3 leading-tight tracking-tight drop-shadow-sm">
                  {banner.title}
                </h3>
                {banner.description && (
                  <p className="text-white/80 text-sm md:text-lg font-medium max-w-[85%] md:max-w-[50%] mb-6 leading-relaxed line-clamp-2">
                    {banner.description}
                  </p>
                )}
                <div className="mt-auto md:mt-4">
                  <span className="inline-flex items-center text-[10px] md:text-xs text-black bg-white/95 font-bold tracking-widest uppercase rounded-full px-6 py-3 md:px-8 md:py-3.5 hover:bg-black hover:text-white transition-colors duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                    Explore Collection
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>



      {/* ---------------- BROWSE BY CATEGORY ---------------- */}
      <section className="mb-16 md:mb-20 max-w-[120rem] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8 px-2 border-b border-gray-100 pb-4">
          <h2 className="font-serif italic font-semibold text-3xl md:text-4xl text-gray-900 tracking-tight">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
          {shopCategories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                onClick={() => navigate(cat.link)}
                className="flex flex-col items-center cursor-pointer group w-full"
              >
                <div className="w-full aspect-square max-w-[110px] sm:max-w-[150px] md:max-w-[170px] lg:max-w-[200px] rounded-full overflow-hidden mb-4 sm:mb-6 border-[2px] border-gray-100 group-hover:border-[#EE1C47]/30 transition-all duration-500 shadow-[0_2px_10px_rgba(0,0,0,0.02)] group-hover:shadow-[0_15px_30px_rgba(238,28,71,0.1)] bg-white relative p-[4px] md:p-[6px] group-hover:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10" />
                    <img
                      src={cat.image}
                      className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={cat.name}
                    />
                  </div>
                </div>
                <h3 className="font-sans text-[11px] sm:text-[13px] md:text-sm lg:text-[15px] font-bold text-center text-gray-800 leading-tight group-hover:text-[#EE1C47] transition-colors tracking-wide">
                  {cat.name}
                </h3>
              </motion.div>
            ))}
        </div>
      </section>

      {/* ---------------- PICK THEIR FAVOURITE FLOWERS ---------------- */}
      <section className="mb-20 max-w-[120rem] mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-8 px-2 border-b border-gray-100 pb-4">
          <h2 className="font-serif italic font-semibold text-3xl md:text-4xl text-gray-900 tracking-tight">Pick Their Favourite Flowers</h2>
          <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-black transition-colors block pb-1 md:hidden" onClick={() => navigate('/explore')}>Discover More →</span>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
        >
          {favouriteFlowers.map((flower) => (
             <motion.div 
               key={flower.name} 
               variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
               onClick={() => navigate(`/explore`)}
               className="group cursor-pointer flex flex-col items-center"
             >
               <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden mb-4 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group-hover:shadow-[0_10px_30px_rgba(238,28,71,0.08)] bg-[#FDFBF9] transition-all duration-500 relative">
                 <img src={flower.image} alt={flower.name} className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700" />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
               </div>
               <span className="font-sans font-bold text-[13px] md:text-sm text-gray-800 tracking-wide group-hover:text-[#EE1C47] transition-colors">{flower.name}</span>
             </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------------- BEST SELLER OF TODAY ---------------- */}
      <section className="mb-20 max-w-[120rem] mx-auto px-2 md:px-8">
        <div className="flex items-end justify-between mb-8 px-2 border-b border-gray-100 pb-4">
          <h2 className="font-serif italic font-semibold text-3xl md:text-4xl text-gray-900 tracking-tight">Best Seller</h2>
          <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-black transition-colors block pb-1 md:hidden" onClick={() => navigate('/explore')}>Discover More →</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {loading
            ? [...Array(6)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            : bestSellers.slice(0, 6).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
        </div>
      </section>

      {/* ---------------- CELEBRATE LOVE SECTION ---------------- */}
      <section className="py-12 md:py-20 max-w-[120rem] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center bg-white rounded-[2.5rem] p-4 lg:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-pink-50">
          
          {/* LEFT PROMO BANNER */}
          <div className="w-full lg:w-[42%] flex-shrink-0 rounded-[2rem] overflow-hidden group cursor-pointer" onClick={() => navigate('/explore')}>
            <img 
              src="/banners/celebrate_love_banner.png" 
              className="w-full h-auto block transform scale-100 group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
              alt="Celebrate Love - Perfect gifts for every story"
            />
          </div>

          {/* RIGHT GRID MAP */}
          <div className="flex-1 grid grid-cols-4 gap-x-2 sm:gap-x-4 gap-y-8 lg:gap-y-12 items-center content-center py-6 lg:py-4 w-full">
            {celebrateLoveCategories.map((item, idx) => {
              const heartMask = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E\")";

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  onClick={() => navigate(item.link)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  {/* Heart container */}
                  <div className="w-full max-w-[80px] xs:max-w-[100px] sm:max-w-[140px] lg:max-w-[160px] aspect-square mb-3 sm:mb-4 relative transition-all duration-500 group-hover:-translate-y-2 group-hover:drop-shadow-[0_15px_15px_rgba(238,28,71,0.2)] flex justify-center items-center p-[4px] sm:p-[6px]">
                    
                    {/* The Background Red Heart (acts as a border) */}
                    <div 
                      className="absolute inset-0 bg-[#FFD1DA] group-hover:bg-[#EE1C47] transition-colors duration-500 scale-100"
                      style={{
                        WebkitMaskImage: heartMask, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                        maskImage: heartMask, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center'
                      }}
                    />
                    
                    {/* The Foreground Image Heart */}
                    <div 
                      className="w-[96%] h-[96%] relative bg-white z-10 shrink-0"
                      style={{
                        WebkitMaskImage: heartMask, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                        maskImage: heartMask, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center'
                      }}
                    >
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  </div>

                  <h3 className="font-sans font-bold text-[10px] sm:text-xs md:text-sm text-gray-800 text-center tracking-wide leading-tight group-hover:text-[#EE1C47] transition-colors">
                    {item.name}
                  </h3>
                </motion.div>
              );
            })}
          </div>
          
        </div>
      </section>

      {/* ---------------- CHERISHED CELEBRATIONS SECTION ---------------- */}
      <section className="py-12 md:py-20 max-w-[120rem] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center bg-white rounded-[2.5rem] p-4 lg:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-yellow-50">
          
          {/* LEFT PROMO BANNER */}
          <div className="w-full lg:w-[42%] flex-shrink-0 rounded-[2rem] overflow-hidden group cursor-pointer" onClick={() => navigate('/explore')}>
            <img 
              src="/banners/cherished_celebrations_banner.png" 
              className="w-full h-auto block transform scale-100 group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
              alt="Gifts for Cheers, Congrats & Cherished Celebrations"
            />
          </div>

          {/* RIGHT GRID MAP */}
          <div className="flex-1 grid grid-cols-4 gap-x-2 sm:gap-x-4 gap-y-8 lg:gap-y-12 items-center content-center py-6 lg:py-4 w-full">
            {cherishedCelebrationsCategories.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                onClick={() => navigate(item.link)}
                className="flex flex-col items-center cursor-pointer group"
              >
                  {/* Square soft shape container */}
                <div className="w-full max-w-[80px] xs:max-w-[100px] sm:max-w-[140px] lg:max-w-[160px] aspect-square mb-3 sm:mb-4 relative transition-all duration-500 group-hover:-translate-y-2 group-hover:drop-shadow-[0_15px_15px_rgba(241,200,101,0.3)]">
                  
                  {/* The Background Yellow Rounded Box & Masked Image */}
                  <div 
                    className="absolute inset-0 bg-[#FCE8A1] rounded-[1.5rem] md:rounded-[2rem] shadow-sm transform group-hover:bg-[#F3D573] transition-colors duration-500 overflow-hidden flex justify-center items-center"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="relative z-10 w-[140%] h-[140%] object-contain object-center scale-100 group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                    />
                  </div>
                </div>

                <h3 className="font-sans font-bold text-[10px] sm:text-xs md:text-sm text-gray-800 text-center tracking-wide leading-tight group-hover:text-[#B27012] transition-colors mt-2 sm:mt-4">
                  {item.name}
                </h3>
              </motion.div>
            ))}
          </div>
          
        </div>
      </section>

      {/* ---------------- ABOUT & USPS ---------------- */}
      <section className="mb-20 max-w-[120rem] mx-auto px-4 md:px-8 mt-12 md:mt-24">
        <div className="bg-[#FAF9F6] border-t border-gray-200/50 pt-16 md:pt-24 pb-8 text-center max-w-4xl mx-auto">
          <h2 className="font-serif italic text-3xl md:text-5xl lg:text-[3.5rem] tracking-tight text-[#EE1C47] mb-6 drop-shadow-sm">
            The Mangalam Florist Promise
          </h2>
          <p className="font-sans text-gray-500 text-sm md:text-base leading-relaxed mb-16 px-4">
            At Mangalam Florist, we believe in crafting more than just arrangements; we create unforgettable memories. For decades, our boutique has sourced the finest, freshest, and most luxurious blooms globally to ensure unparalleled elegance in every handcrafted bouquet.
          </p>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 px-1 lg:px-4">
            {/* USP 1 */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center justify-center mb-3 md:mb-6 overflow-hidden relative group-hover:shadow-[0_10px_25px_rgba(238,28,71,0.1)] transition-all duration-500 group-hover:-translate-y-1">
                 <div className="absolute inset-0 bg-[#EE1C47] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                 <Sparkles className="text-gray-900 relative z-10 group-hover:text-white transition-colors duration-500 scale-[0.8] md:scale-100" size={24} strokeWidth={1.5} />
              </div>
              <h3 className="font-sans font-bold text-[11px] xs:text-xs md:text-base text-gray-900 mb-1 md:mb-2 leading-tight">Artisan Handcrafted</h3>
              <p className="hidden md:block text-gray-500 text-xs md:text-[13px] leading-relaxed max-w-[200px]">Exquisitely styled and tied by our master florists perfectly for you.</p>
            </div>

            {/* USP 2 */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center justify-center mb-3 md:mb-6 overflow-hidden relative group-hover:shadow-[0_10px_25px_rgba(238,28,71,0.1)] transition-all duration-500 group-hover:-translate-y-1">
                 <div className="absolute inset-0 bg-[#EE1C47] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                 <Clock className="text-gray-900 relative z-10 group-hover:text-white transition-colors duration-500 scale-[0.8] md:scale-100" size={24} strokeWidth={1.5} />
              </div>
              <h3 className="font-sans font-bold text-[11px] xs:text-xs md:text-base text-gray-900 mb-1 md:mb-2 leading-tight">Express Delivery</h3>
              <p className="hidden md:block text-gray-500 text-xs md:text-[13px] leading-relaxed max-w-[200px]">Pristine freshness delivered straight to their door with care and speed.</p>
            </div>

            {/* USP 3 */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center justify-center mb-3 md:mb-6 overflow-hidden relative group-hover:shadow-[0_10px_25px_rgba(238,28,71,0.1)] transition-all duration-500 group-hover:-translate-y-1">
                 <div className="absolute inset-0 bg-[#EE1C47] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                 <ShieldCheck className="text-gray-900 relative z-10 group-hover:text-white transition-colors duration-500 scale-[0.8] md:scale-100" size={24} strokeWidth={1.5} />
              </div>
              <h3 className="font-sans font-bold text-[11px] xs:text-xs md:text-base text-gray-900 mb-1 md:mb-2 leading-tight">Guaranteed Premiere</h3>
              <p className="hidden md:block text-gray-500 text-xs md:text-[13px] leading-relaxed max-w-[200px]">Sourced directly from the top farms globally for ultimate luxury.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
