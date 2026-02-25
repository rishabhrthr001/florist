import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronDown, User, Heart } from "lucide-react";
import axios from "axios";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import API from "@/config";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  const { user, logout, loading } = useAuth();
  const { totalItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();

  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- SCROLL EFFECT ---------------- */

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------- FETCH CATEGORIES ---------------- */

  useEffect(() => {
    axios.get(`${API}/category`).then((res) => {
      setCategories(res.data);
    });
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
    setIsShopOpen(false);
    setIsUserOpen(false);
  };
  const scrollToTop = () => {
    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 120);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`glass-nav rounded-full px-6 py-4 md:px-8 flex items-center justify-between transition-all duration-500 border border-white/40 ${
          isScrolled
            ? "shadow-[0_4px_30px_rgba(0,0,0,0.06)] py-3 md:py-3.5 bg-white/85 backdrop-blur-2xl"
            : "shadow-[0_2px_20px_rgba(0,0,0,0.02)] bg-white/40 backdrop-blur-lg"
        }`}
      >
        {/* ================= MOBILE LEFT ================= */}

        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={() => {
              setIsShopOpen(false);
              setIsUserOpen(false);
              scrollToTop();
            }}
            className="text-[10px] uppercase font-bold tracking-widest"
          >
            Home
          </button>

          {/* SHOP MOBILE */}
          <div className="relative">
            <button
              onClick={() => setIsShopOpen((p) => !p)}
              className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1"
            >
              Shop
              <ChevronDown size={12} />
            </button>

            <AnimatePresence>
              {isShopOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-44 bg-white rounded-2xl shadow-xl border py-3 z-50"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleNav(`/explore?category=${cat.slug}`)}
                      className="w-full px-5 py-2 text-left text-xs hover:bg-[#FDF2F5]"
                    >
                      {cat.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => handleNav("/make-your-own")}
            className="text-[10px] uppercase font-bold tracking-widest"
          >
            Custom
          </button>
        </div>

        {/* ================= DESKTOP LOGO ================= */}

        <div
          onClick={scrollToTop}
          // onClick={() => handleNav("/")}
          className="cursor-pointer hidden md:block"
        >
          <img
            src="/newLogo.png"
            alt="Mangalam Florist"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* ================= DESKTOP NAV ================= */}

        <div className="hidden md:flex items-center space-x-10">
          {/* HOME */}
          <button
            onClick={() => handleNav("/")}
            className={`text-[11px] uppercase tracking-widest font-bold transition-colors ${
              location.pathname === "/" ? "text-[#EE1C47]" : "text-gray-600 hover:text-black"
            }`}
          >
            Home
          </button>

          {/* SHOP */}
          <div
            className="relative"
            onMouseEnter={() => setIsShopOpen(true)}
            onMouseLeave={() => setIsShopOpen(false)}
          >
            <button
              onClick={() => handleNav("/explore")}
              className={`text-[11px] uppercase tracking-widest font-bold flex items-center gap-1 transition-colors ${
                location.pathname.includes("/explore") ? "text-[#EE1C47]" : "text-gray-600 hover:text-black"
              }`}
            >
              Shop
              <ChevronDown size={14} className={`transition-transform duration-300 ${isShopOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isShopOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-white rounded-2xl shadow-xl border py-3 z-50"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleNav(`/explore?category=${cat.slug}`)}
                      className="w-full px-6 py-2 text-left text-xs hover:bg-[#FDF2F5]"
                    >
                      {cat.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MAKE YOUR OWN — FIXED HOVER */}
          <button
            onClick={() => handleNav("/make-your-own")}
            className={`text-[11px] uppercase tracking-widest font-bold transition-colors ${
              location.pathname.includes("/make-your-own") ? "text-[#EE1C47]" : "text-gray-600 hover:text-black"
            }`}
          >
            Make Your Own
          </button>
        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="flex items-center gap-5">
          {/* LOGIN WHEN NOT AUTH */}
          {!loading && !user && (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-gray-800 hover:text-[#EE1C47] transition-colors"
            >
              <User size={20} strokeWidth={1.5} />
            </button>
          )}

          {/* MOBILE USER */}
          {!loading && user && (
            <div className="md:hidden relative">
              <button
                onClick={() => setIsUserOpen((p) => !p)}
                className="w-8 h-8 rounded-full bg-[#F8BBD0] text-white flex items-center justify-center text-xs font-bold uppercase"
              >
                {user.name.charAt(0)}
              </button>

              <AnimatePresence>
                {isUserOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-3 w-44 bg-white rounded-2xl shadow-xl border z-50"
                  >
                    <button
                      onClick={() => handleNav("/profile")}
                      className="w-full px-5 py-3 text-left text-xs hover:bg-[#FDF2F5]"
                    >
                      My Profile
                    </button>

                    <button
                      onClick={() => handleNav("/orders")}
                      className="w-full px-5 py-3 text-left text-xs hover:bg-[#FDF2F5]"
                    >
                      Orders
                    </button>

                    {user.role === "admin" && (
                      <button
                        onClick={() => handleNav("/admin")}
                        className="w-full px-5 py-3 text-left text-xs text-red-500 hover:bg-red-50"
                      >
                        Admin
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        handleNav("/");
                      }}
                      className="w-full px-5 py-3 text-left text-xs text-gray-500 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* DESKTOP USER */}
          {!loading && user && (
            <div className="hidden md:block relative group">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 hover:bg-white/80">
                <div className="w-7 h-7 rounded-full bg-[#F8BBD0] text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name.charAt(0)}
                </div>

                <span className="text-xs font-semibold">
                  {user.name.split(" ")[0]}
                </span>

                <ChevronDown size={14} />
              </button>

              <div className="absolute right-0 mt-3 w-44 bg-white rounded-2xl shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => handleNav("/profile")}
                  className="w-full px-5 py-3 text-left text-xs hover:bg-[#FDF2F5]"
                >
                  My Profile
                </button>

                <button
                  onClick={() => handleNav("/orders")}
                  className="w-full px-5 py-3 text-left text-xs hover:bg-[#FDF2F5]"
                >
                  Orders
                </button>

                {user.role === "admin" && (
                  <button
                    onClick={() => handleNav("/admin")}
                    className="w-full px-5 py-3 text-left text-xs text-red-500 hover:bg-red-50"
                  >
                    Admin
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    handleNav("/");
                  }}
                  className="w-full px-5 py-3 text-left text-xs text-gray-500 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          <button onClick={() => navigate("/wishlist")} className="relative text-gray-800 hover:text-[#EE1C47] transition-colors">
            <Heart size={20} strokeWidth={1.5} />

            {wishlistItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-md border border-white">
                {wishlistItems}
              </span>
            )}
          </button>

          <button onClick={() => navigate("/cart")} className="relative text-gray-800 hover:text-[#EE1C47] transition-colors">
            <ShoppingBag size={20} strokeWidth={1.5} />

            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-black rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-md border border-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
