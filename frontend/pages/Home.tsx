import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Search } from "lucide-react";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";



import API from "../config";
import { Helmet } from "react-helmet-async";

/* ---------------- TYPES ---------------- */

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  section?: string;
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

/* ---------------- FALLBACK DATA ---------------- */

const FALLBACK_SHOP_CATEGORIES = [
  { name: "Birthdays", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=300&q=80", slug: 'birthday' },
  { name: "Anniversary", image: "/categories-new/anniversary.png", slug: 'anniversary' },
  { name: "Chocolates", image: "/categories-new/chocolates.png", slug: 'chocolates' },
  { name: "Cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80", slug: 'cakes' },
  { name: "Bouquets", image: "https://images.unsplash.com/photo-1522673607200-1648832cee98?w=300&q=80", slug: 'bouquets' },
  { name: "Plants", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&q=80", slug: 'plants' },
  { name: "Big Bunches", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=300&q=80", slug: 'big-bunches' },
];

const FALLBACK_CELEBRATE_LOVE = [
  { name: "Wedding", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&q=80", slug: 'wedding' },
  { name: "Anniversary", image: "/categories-new/anniversary.png", slug: 'anniversary' },
  { name: "Romantic Flowers", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=300&q=80", slug: 'flowers' },
  { name: "For Girlfriend", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300&q=80", slug: 'girlfriend' },
  { name: "For Boyfriend", image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=300&q=80", slug: 'boyfriend' },
  { name: "Miss You", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=300&q=80", slug: 'miss-you' },
];

const FALLBACK_CHERISHED = [
  { name: "Teddy Bouquet", image: "/icons-new/teddy_new.png", slug: 'teddy-bouquet' },
  { name: "Chocolate Bouquet", image: "/icons-new/chocolate_new.png", slug: 'chocolate-bouquet' },
  { name: "Death Anniversary", image: "/icons-new/memorial.png", slug: 'memorial' },
  { name: "Fruit Basket", image: "/icons-new/fruit.png", slug: 'fruit-basket' },
  { name: "Plants", image: "/icons-new/plants.png", slug: 'plants' },
  { name: "Exotic Flowers", image: "/icons-new/exotic.png", slug: 'exotic' },
  { name: "Garland", image: "/icons-new/jaimala.png", slug: 'garland' },
];

const FALLBACK_FLOWERS = [
  { name: "Classic Roses", slug: "roses", image: "/bouquets/bouquet_roses_1771938143113.png" },
  { name: "White Lilies", slug: "lilies", image: "/bouquets/bouquet_lilies_1771939456508.png" },
  { name: "Bright Sunflowers", slug: "sunflowers", image: "/bouquets/bouquet_sunflowers_1771938400635.png" },
  { name: "Purple Orchids", slug: "orchids", image: "/bouquets/bouquet_orchids_1771938645237.png" },
  { name: "Soft Carnations", slug: "carnations", image: "/bouquets/bouquet_carnations_1771938818246.png" },
  { name: "Mixed Blooms", slug: "mixed", image: "/bouquets/bouquet_mixed_1771939118931.png" },
];

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

        // Safe check for the products list
        const rawProducts = Array.isArray(productRes.data) 
          ? productRes.data 
          : (productRes.data?.products || productRes.data?.items || []);

        // Randomly pull 8 products but prioritize those with real images over placeholders
        const shuffled = [...rawProducts].sort((a, b) => {
          const aValid = (a.images?.[0] && !a.images[0].includes("placeholder") && !a.images[0].includes("default")) ? 1 : 0;
          const bValid = (b.images?.[0] && !b.images[0].includes("placeholder") && !b.images[0].includes("default")) ? 1 : 0;
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
    { _id: 'b1', title: 'Birthdays', description: 'Curated blooms and luxury gifts for their special day.', category: 'Birthday', link: '/explore', imageUrl: '/banners/birthday.png' },
    { _id: 'b2', title: 'Anniversary', description: 'Timeless arrangements for your beautiful journey.', category: 'Anniversary', link: '/explore', imageUrl: '/banners/anniversary.png' },
    { _id: 'b3', title: 'Wedding', description: 'Elegant designs for their perfect beginning.', category: 'Wedding', link: '/explore', imageUrl: '/banners/wedding.png' },
    { _id: 'b4', title: 'For Her', description: 'Chic, delicate curations designed for her grace.', category: 'For Her', link: '/explore', imageUrl: '/banners/for_her.png' },
    { _id: 'b5', title: 'For Him', description: 'Sophisticated luxury for the modern gentleman.', category: 'For Him', link: '/explore', imageUrl: '/banners/for_him.png' },
  ];

  const displayBanners = defaultBanners;

  // Show EVERYTHING in Shop by Category as requested
  const shopCategories = categories.length > 0 ? categories : FALLBACK_SHOP_CATEGORIES;

  const backendLoveCats = categories.filter(c => c.section === 'celebrate-love' && !['thinking-of-you', 'sorry'].includes(c.slug));
  const celebrateLoveCategories = backendLoveCats.length > 0 ? backendLoveCats : FALLBACK_CELEBRATE_LOVE;

  const backendCherishedCats = categories.filter(c => c.section === 'cherished-celebrations');
  const cherishedCelebrationsCategories = backendCherishedCats.length > 0 ? backendCherishedCats : FALLBACK_CHERISHED;

  const backendFlowerCats = categories.filter(c => c.section === 'favourite-flowers');
  const favouriteFlowers = backendFlowerCats.length > 0 ? backendFlowerCats : FALLBACK_FLOWERS;

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-32 pb-10">
      <Helmet>
        <title>Mangalam Florist | Luxury Flower Delivery</title>
        <meta name="description" content="Send fresh, luxury flowers and premium floral gifts with Mangalam Florist." />
      </Helmet>
      
      <section className="mb-20 max-w-[120rem] mx-auto px-4 md:px-8">
        <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {displayBanners.map((banner, idx) => (
            <motion.div
              key={banner._id}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => navigate(banner.link || '/explore')}
              className="min-w-[88vw] md:min-w-[900px] aspect-[16/9] md:aspect-[21/9] relative rounded-[3rem] overflow-hidden cursor-pointer group snap-center shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 flex-shrink-0"
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-[2500ms] ease-out-quint"
              />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-dark.png')] opacity-[0.03] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
              
              <div className="absolute inset-0 p-10 md:p-16 flex flex-col justify-start">
                <div className="overflow-hidden mb-5">
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.6 }}
                    className="text-pink-300 text-[10px] md:text-xs font-black tracking-[0.5em] uppercase block"
                  >
                    {banner.category}
                  </motion.span>
                </div>
                {banner.description && (
                  <div className="overflow-hidden">
                    <motion.p 
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="text-white font-serif italic text-lg md:text-2xl lg:text-3xl lg:w-2/3 leading-tight tracking-tight drop-shadow-sm transition-all duration-700 group-hover:translate-x-2"
                    >
                      {banner.description}
                    </motion.p>
                  </div>
                )}
                
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "60px" }}
                  transition={{ delay: 0.8 + idx * 0.1, duration: 1 }}
                  className="h-[1px] bg-pink-300/50 mt-8"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- BROWSE BY CATEGORY ---------------- */}
      <section className="mb-20 md:mb-28 max-w-[120rem] mx-auto px-4 md:px-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -right-20 -top-20 text-[20rem] font-sans font-black text-pink-50/40 select-none pointer-events-none -z-10">
          M
        </div>
        
        <div className="flex items-center justify-between mb-12 px-2 border-b border-gray-100 pb-6 relative">
          <h2 className="font-sans font-bold text-3xl md:text-4xl text-gray-900 tracking-tight text-center sm:text-left">Shop by Category</h2>
          <div className="absolute bottom-0 left-0 w-24 h-[1px] bg-pink-300" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-12 justify-items-center">
          {shopCategories.map((cat, idx) => (
              <motion.div
                key={cat._id || cat.slug || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => navigate(`/explore?category=${cat.slug}`)}
                className="flex flex-col items-center cursor-pointer group w-full"
              >
                <div className="w-full aspect-square max-w-[120px] sm:max-w-[170px] rounded-full mb-5 sm:mb-8 transition-all duration-1000 relative">
                  {/* Decorative outer ring */}
                  <div className="absolute inset-[-8px] rounded-full border border-pink-50 opacity-0 group-hover:opacity-100 group-hover:inset-[-12px] transition-all duration-700 pointer-events-none" />
                  
                  <div className="w-full h-full rounded-full overflow-hidden border-[1.5px] border-gray-100 group-hover:border-[#EE1C47]/20 shadow-[0_8px_30px_rgba(0,0,0,0.02)] group-hover:shadow-[0_25px_50px_rgba(238,28,71,0.12)] bg-white p-[5px] sm:p-[7px] transition-all duration-700">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-1000 z-10" />
                      <img
                        src={cat.image}
                        className="w-full h-full rounded-full object-cover group-hover:scale-[1.12] transition-transform duration-[1500ms] cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        alt={cat.name}
                        loading="lazy" // Added loading="lazy"
                      />
                    </div>
                  </div>
                </div>
                <h3 className="font-sans text-[12px] sm:text-[14px] font-bold text-center text-gray-800 leading-tight group-hover:text-[#EE1C47] transition-all duration-300 tracking-wide inline-block relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-[#EE1C47]/40 after:transition-all after:duration-500 group-hover:after:w-full">
                  {cat.name}
                </h3>
              </motion.div>
            ))}
        </div>
      </section>

      {/* ---------------- PICK THEIR FAVOURITE FLOWERS ---------------- */}
      <section className="mb-20 max-w-[120rem] mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-8 px-2 border-b border-gray-100 pb-4">
          <h2 className="font-sans font-bold text-3xl md:text-4xl text-gray-900 tracking-tight">Pick Their Favourite Flowers</h2>
          <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-black transition-colors block pb-1 md:hidden" onClick={() => navigate('/explore')}>Discover More →</span>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
        >
          {favouriteFlowers.map((flower) => (
             <motion.div 
               key={flower.name} 
               variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
               onClick={() => navigate(`/explore?category=${flower.slug}`)}
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
          <h2 className="font-sans font-bold text-3xl md:text-4xl text-gray-900 tracking-tight">Best Seller</h2>
          <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-black transition-colors block pb-1 md:hidden" onClick={() => navigate('/explore')}>Discover More →</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
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
          <div className="flex-1 grid grid-cols-3 gap-x-2 sm:gap-x-10 gap-y-10 lg:gap-y-14 items-center content-center py-6 lg:py-4 w-full">
            {celebrateLoveCategories.map((item, idx) => {
              const heartMask = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E\")";

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  onClick={() => navigate(`/explore?category=${item.slug}`)}
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
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center bg-white rounded-[2.5rem] p-4 lg:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-[#C5A059]/30">
          
          {/* LEFT PROMO BANNER */}
          <div className="w-full lg:w-[42%] flex-shrink-0 rounded-[2rem] overflow-hidden group cursor-pointer" onClick={() => navigate('/explore')}>
            <img 
              src="/banners/cherished_celebrations_banner.png" 
              className="w-full h-auto block transform scale-100 group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
              alt="Gifts for Cheers, Congrats & Cherished Celebrations"
            />
          </div>

          {/* RIGHT GRID MAP */}
          <div className="flex-1 grid grid-cols-4 gap-x-3 sm:gap-x-10 gap-y-12 lg:gap-y-16 items-start content-center py-6 lg:py-4 w-full">
            {cherishedCelebrationsCategories.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                onClick={() => navigate(`/explore?category=${item.slug}`)}
                className="flex flex-col items-center cursor-pointer group"
              >
                  {/* Square soft shape container */}
                <div className="w-full max-w-[80px] xs:max-w-[100px] sm:max-w-[140px] lg:max-w-[160px] aspect-square mb-3 sm:mb-4 relative transition-all duration-500 group-hover:-translate-y-2 group-hover:drop-shadow-[0_15px_15px_rgba(0,0,0,0.05)]">
                  
                  {/* The Background Neutral Rounded Box & Masked Image */}
                  <div 
                    className="absolute inset-0 bg-white rounded-xl border-[1.5px] border-[#C5A059] shadow-sm transform group-hover:bg-[#FAF9F6] group-hover:shadow-[0_10px_20px_rgba(197,160,89,0.15)] transition-all duration-500 overflow-hidden flex justify-center items-center"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="relative z-10 w-[140%] h-[140%] object-contain object-center scale-100 group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                    />
                  </div>
                </div>

                <h3 className="font-sans font-bold text-[10px] sm:text-xs md:text-sm text-gray-800 text-center tracking-wide leading-tight group-hover:text-black transition-colors mt-4 min-h-[2.5em] flex items-start justify-center">
                  {item.name}
                </h3>
              </motion.div>
            ))}
          </div>
          
        </div>
      </section>


    </div>
  );
};

export default Home;
