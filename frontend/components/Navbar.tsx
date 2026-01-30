import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, ChevronDown, User } from "lucide-react";
import axios from "axios";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isShopOpen, setIsShopOpen] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  /* Scroll effect */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Fetch categories for Shop dropdown */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("http://localhost:3001/category");

        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsShopOpen(false);
  };

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={`glass-nav rounded-full px-8 py-4 flex items-center justify-between transition-all duration-500 ${
            isScrolled
              ? "shadow-2xl py-3 border border-[#F8BBD0]/30 bg-white/80 backdrop-blur-xl"
              : "shadow-sm bg-white/60 backdrop-blur-lg"
          }`}
        >
          {/* LOGO */}
          <div onClick={() => handleNav("/")} className="cursor-pointer">
            <span className="font-serif text-2xl italic font-bold tracking-tight text-[#1A1A1A]">
              Mangalam
            </span>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center space-x-10">
            {[
              { label: "Home", path: "/" },
              {
                label: "Make Your Own",
                path: "/make-your-own",
              },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`text-xs uppercase tracking-widest font-semibold transition-colors hover:text-[#F8BBD0] ${
                  location.pathname === item.path
                    ? "text-[#F8BBD0]"
                    : "text-[#4A4A4A]"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* SHOP */}
            <div
              className="relative"
              onMouseEnter={() => setIsShopOpen(true)}
              onMouseLeave={() => setIsShopOpen(false)}
            >
              <button
                onClick={() => handleNav("/explore")}
                className="text-xs uppercase tracking-widest font-semibold flex items-center gap-1 text-[#4A4A4A] hover:text-[#F8BBD0]"
              >
                Shop
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    isShopOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isShopOpen && categories.length > 0 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                    }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-3"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() =>
                          handleNav(`/explore?category=${cat.slug}`)
                        }
                        className="w-full px-6 py-2.5 text-left text-xs font-medium text-[#4A4A4A] hover:bg-[#FDF2F5] hover:text-[#F8BBD0]"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center space-x-6">
            {/* USER */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-lg hover:bg-white/80 transition">
                  <div className="w-7 h-7 rounded-full bg-[#F8BBD0] text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name?.charAt(0) || "U"}
                  </div>

                  <span className="text-xs font-semibold">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>

                  <ChevronDown size={14} />
                </button>

                {/* DROPDOWN */}
                <div className="absolute right-0 mt-3 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
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
            ) : (
              <button
                onClick={() => handleNav("/login")}
                className="flex items-center gap-2 text-[#4A4A4A] hover:text-[#F8BBD0]"
              >
                <User size={20} />
                <span className="hidden lg:block text-[10px] uppercase font-bold tracking-widest">
                  Sign In
                </span>
              </button>
            )}

            {/* CART */}
            <button
              className="relative text-[#4A4A4A] hover:text-[#F8BBD0]"
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag size={20} />

              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F8BBD0] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* MOBILE */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </motion.div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              className="md:hidden absolute top-24 left-0 w-full rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl p-8 space-y-6"
            >
              <button onClick={() => handleNav("/")}>Home</button>

              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleNav(`/explore?category=${cat.slug}`)}
                >
                  {cat.name}
                </button>
              ))}

              <button onClick={() => handleNav("/make-your-own")}>
                Make Your Own
              </button>

              {!user && (
                <button onClick={() => handleNav("/login")}>Login</button>
              )}

              {user?.role === "admin" && (
                <button
                  onClick={() => handleNav("/admin")}
                  className="text-red-400"
                >
                  Admin
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
