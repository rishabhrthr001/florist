import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import { Mail, Lock, ArrowLeft, User } from "lucide-react";
import API_BASE_URL from "../config.js";
import { useAuth } from "@/context/AuthContext.js";
import { toast } from "sonner";

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      toast.error("Missing fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/auth/signup`, {
        name,
        email,
        password,
      });

      login(res.data.token, res.data.user);

      toast.success("Account created 🌸");

      navigate("/explore");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Signup failed");
      console.log(err.response?.data?.msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAF9F6] font-sans">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden h-screen sticky top-0">
        <img
          src="/loginbg.png"
          alt="Signature Floral Backdrop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        <div className="absolute inset-0 flex flex-col justify-end p-20 text-white">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4 opacity-70">
            The Mangalam Experience
          </span>
          <h2 className="font-serif text-6xl italic font-bold mb-6">
            Join the <br /> Circle.
          </h2>
          <p className="text-white/60 max-w-sm font-light">
            Create your account to unlock curated florals and bespoke gifting.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors mb-12"
          >
            <ArrowLeft size={14} /> Back to Atelier
          </button>

          <div className="mb-12">
            <h1 className="font-serif text-4xl text-[#1A1A1A] mb-2 font-bold">
              Create Account
            </h1>
            <p className="text-gray-500 font-light text-sm">
              Sign up to access your personal atelier.
            </p>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
          >
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Full Name
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F8BBD0] transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-[#F8BBD0] focus:ring-1 focus:ring-[#F8BBD0] transition-all shadow-sm"
                />
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              className="w-full h-14 shadow-lg"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-12 text-center text-xs text-gray-500">
            Already have an account?
            <button
              onClick={() => navigate("/login")}
              className="ml-1 font-bold text-[#F8BBD0] hover:underline uppercase tracking-tighter"
            >
              Login
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
