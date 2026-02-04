import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import API_BASE_URL from "../config.js";
import { useAuth } from "@/context/AuthContext.js";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { syncWishlist } = useWishlist();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Missing fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      login(res.data.token, res.data.user);

      // Sync wishlist after login
      await syncWishlist(res.data.token);

      toast.success("Welcome back 🌸");

      navigate("/explore");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("1. handleGoogleLogin started");
    console.log("API_BASE_URL:", API_BASE_URL);
    try {
      console.log("2. Calling signInWithPopup...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("3. Popup success, user:", result.user.email);

      // Get the Google OAuth credential from the result
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleIdToken = credential?.idToken;

      console.log("4. Got Google credential, calling backend...");

      const res = await axios.post(`${API_BASE_URL}/auth/google`, {
        token: googleIdToken, // Send Google OAuth ID token (not Firebase ID token)
      });
      console.log("5. Backend response:", res.data);

      login(res.data.token, res.data.user);

      // Sync wishlist after Google login
      await syncWishlist(res.data.token);

      toast.success("Welcome back 🌸");
      navigate("/explore");
    } catch (err: any) {
      console.error("Google Login Error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      if (err.response) {
        console.error("Backend response:", err.response.data);
      }
      toast.error(err.response?.data?.msg || err.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAF9F6] font-sans">
      {/* ... (Keep branding section) ... */}
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
            A Circle of <br /> Elegance.
          </h2>
          <p className="text-white/60 max-w-sm font-light">
            Join our inner circle for exclusive access to seasonal rarities and
            personalized botanical curation.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
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
              Welcome Back
            </h1>
            <p className="text-gray-500 font-light text-sm">
              Enter your credentials to access your account.
            </p>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
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

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-[10px] uppercase tracking-widest font-bold text-[#F8BBD0] hover:underline"
                >
                  Forgot?
                </button>
              </div>
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
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="my-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold whitespace-nowrap">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google Sign-In Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGoogleLogin}
              className="w-full h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.9 0 3.51.64 4.85 1.91l3.6-3.6C18.23 1.33 15.34 0 12 0 7.31 0 3.25 2.68 1.21 6.61l4.22 3.27C6.46 7.17 9.01 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.86-.08-1.7-.22-2.52H12v4.77h6.44c-.28 1.48-1.11 2.74-2.37 3.58l4.22 3.27c2.47-2.28 3.2-5.74 3.2-9.1z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.43 14.12c-.25-.74-.4-1.53-.4-2.35s.15-1.61.4-2.35L1.21 6.61C.44 8.23 0 10.06 0 12s.44 3.77 1.21 5.39l4.22-3.27z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-4.22-3.27c-1.1.74-2.51 1.18-3.74 1.18-3.03 0-5.6-2.13-6.52-4.99L1.21 17.28C3.25 21.32 7.31 24 12 24z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-700">
                Sign in with Google
              </span>
            </button>
          </div>

          <p className="mt-12 text-center text-xs text-gray-500">
            Don't have an account?
            <button
              onClick={() => navigate("/signup")}
              className="ml-1 font-bold text-[#F8BBD0] hover:underline uppercase tracking-tighter"
            >
              Register Now
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

