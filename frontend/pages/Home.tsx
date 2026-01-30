import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../components/Button";
import ProductCard from "../components/ProductCard";

import { Heart, Gift, Users, User as UserIcon } from "lucide-react";

import API from "../config";

/* ---------------- TYPES ---------------- */

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
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

  const [hotPicks, setHotPicks] = useState<Product[]>([]);
  const [seasonal, setSeasonal] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH HOME SECTIONS ---------------- */

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoading(true);

        const [hotRes, seasonalRes, catRes] = await Promise.all([
          axios.get(`${API}/home-section/hot-picks`),
          axios.get(`${API}/home-section/seasonal-highlights`),
          axios.get(`${API}/category`),
        ]);

        const hot = hotRes.data?.items?.map((i: any) => i.productId) ?? [];
        const seasonalItems =
          seasonalRes.data?.items?.map((i: any) => i.productId) ?? [];

        const catList: Category[] = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.categories || catRes.data?.items || [];

        setHotPicks(Array.isArray(hot) ? hot : []);
        setSeasonal(Array.isArray(seasonalItems) ? seasonalItems : []);
        setCategories(catList);
      } catch (err) {
        console.error("Homepage fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, []);

  /* ---------------- OCCASIONS ---------------- */

  const occasionCategories = [
    {
      name: "For Her",
      id: "for-her",
      icon: <Heart size={16} />,
      image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9",
    },
    {
      name: "For Him",
      id: "for-him",
      icon: <UserIcon size={16} />,
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03",
    },
    {
      name: "Valentine",
      id: "valentine",
      icon: <Gift size={16} />,
      image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7",
    },
    {
      name: "Friendship",
      id: "friendship",
      icon: <Users size={16} />,
      image: "https://images.unsplash.com/photo-1543332164-6e82f355badc",
    },
  ];

  /* ---------------- UI ---------------- */

  return (
    <div className="overflow-hidden bg-[#FAF9F6]">
      {/* ---------------- HERO ---------------- */}
      <section className="relative h-screen w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Desktop Image */}
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 12, ease: "easeOut" }}
            src="/flowers1.webp"
            alt="Graceful florals"
            className="hidden md:block w-full h-full object-cover"
          />

          {/* Mobile Image */}
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 12, ease: "easeOut" }}
            src="/flowers2.png"
            alt="Graceful florals mobile"
            className="block md:hidden w-full h-full object-cover object-top"
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>

        {/* CONTENT */}
        <div className="container mx-auto px-6 md:px-24 relative z-10 pt-24 md:pt-0">
          <div className="max-w-3xl">
            {/* BRAND */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-4 mb-6"
            >
              <span className="w-8 h-px bg-[#F8BBD0]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#F8BBD0] font-bold">
                Mangalam Florist • Premier Boutique
              </span>
            </motion.div>

            {/* TITLE */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-serif text-5xl md:text-9xl text-white mb-6 leading-[0.95] pt-24 font-bold tracking-tighter"
            >
              <span className="text-white">Pure</span>{" "}
              <span className="italic font-normal text-[#F8BBD0]">Grace.</span>
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-white/80 text-base md:text-xl max-w-lg mb-10 leading-relaxed font-light"
            >
              Discover our signature lily collection and artisanal confections,
              curated to transform moments into memories.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                onClick={() => navigate("/explore")}
                className="bg-[#F8BBD0] text-white hover:bg-[#f797b9] px-10 py-5 text-[10px] font-bold tracking-[0.2em]"
              >
                Explore the Shop
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-[10px] uppercase tracking-widest text-[#F8BBD0] font-bold block mb-2">
            Shop by Style
          </span>
          <h2 className="font-serif text-4xl">Find Your Perfect Arrangement</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[260px] rounded-3xl bg-gray-200 animate-pulse"
                />
              ))
            : categories.map((cat, idx) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: idx * 0.18,
                    duration: 0.9,
                    ease: "easeOut",
                  }}
                  onClick={() => navigate(`/explore?category=${cat.slug}`)}
                  className="relative cursor-pointer overflow-hidden rounded-[2rem] group aspect-[4/5]"
                >
                  <img
                    src={
                      cat.image ||
                      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
                    }
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition" />

                  <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                    <h3 className="font-serif text-xl">{cat.name}</h3>

                    <p className="text-[9px] uppercase tracking-[0.2em] opacity-70 mt-1">
                      Explore Collection
                    </p>
                  </div>
                </motion.div>
              ))}
        </div>
      </section>

      {/* ---------------- SEASONAL ---------------- */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="font-serif text-4xl mb-10">Seasonal Highlights</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[320px] rounded-3xl bg-gray-200 animate-pulse"
                />
              ))
            : seasonal.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* ---------------- HOT PICKS ---------------- */}
      <section className="py-20 bg-white border-y">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-4xl mb-10 text-center">Hot Picks</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[320px] rounded-3xl bg-gray-200 animate-pulse"
                  />
                ))
              : hotPicks.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ---------------- OCCASIONS ---------------- */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[10px] uppercase tracking-widest text-[#F8BBD0] font-bold mb-2 block">
            Personalized Gifting
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#1A1A1A]">
            Curated for Every Connection
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {occasionCategories.map((occ, idx) => (
            <motion.div
              key={occ.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: idx * 0.22,
                duration: 1,
                ease: "easeOut",
              }}
              onClick={() => navigate("/explore")}
              className="group cursor-pointer relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] aspect-[4/5]"
            >
              <img
                src={occ.image}
                alt={occ.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1400ms]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                <h3 className="font-serif text-lg md:text-2xl">{occ.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
