import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
const CategoryPage = React.lazy(() => import("./pages/CategoryPage"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));
const MakeYourOwn = React.lazy(() => import("./pages/MakeYourOwn"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const AuthAction = React.lazy(() => import("./pages/AuthAction"));
const ExplorePage = React.lazy(() => import("./pages/ExplorePage"));
const AdminLayout = React.lazy(() => import("./pages/Admin/AdminLayout"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));

import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
const MyOrders = React.lazy(() => import("./pages/MyOrders"));
const SupportTickets = React.lazy(() => import("./pages/SupportTickets"));
const Wishlist = React.lazy(() => import("./pages/Wishlist"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AnimatedRoutes = ({ setIsAdminMode }: { setIsAdminMode: (val: boolean) => void }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/make-your-own" element={<MakeYourOwn />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/action" element={<AuthAction />} />

          {/* USER PROTECTED */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/support" element={<SupportTickets />} />
          </Route>

          {/* ADMIN PROTECTED */}
          <Route element={<AdminRoute />}>
            <Route
              path="/admin/*"
              element={
                <AdminLayout
                  onEnterAdmin={() => setIsAdminMode(true)}
                  onExitAdmin={() => setIsAdminMode(false)}
                />
              }
            />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'bg-white/95 backdrop-blur-md !rounded-[1.25rem] p-4 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.08)] !font-sans md:px-6',
          titleClassName: '!font-bold !text-gray-900 !text-[13px] md:!text-sm tracking-wide',
          descriptionClassName: '!text-gray-500 !text-[11px] md:!text-xs mt-1',
          success: {
            className: '!bg-[#FDFBF9] !border-[#EE1C47]/20 !text-gray-900',
            iconTheme: { primary: '#EE1C47', secondary: 'white' }
          },
          error: {
            className: '!bg-[#FFF5F5] !border-red-100 !text-red-900',
            iconTheme: { primary: '#EF4444', secondary: 'white' }
          }
        }}
      />
      <Router>
        <ScrollToTop />

        {!isAdminMode && <Navbar />}

        <main className={isAdminMode ? "" : "pt-0"}>
          <React.Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center pt-32">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-[#EE1C47] rounded-full animate-spin"></div>
            </div>
          }>
            <AnimatedRoutes setIsAdminMode={setIsAdminMode} />
          </React.Suspense>
        </main>

        {!isAdminMode && <Footer />}
      </Router>
    </>
  );
};

export default App;
