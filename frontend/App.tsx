import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import MakeYourOwn from "./pages/MakeYourOwn";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AuthAction from "./pages/AuthAction";
import ExplorePage from "./pages/ExplorePage";
import AdminLayout from "./pages/Admin/AdminLayout";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ContactPage from "./pages/ContactPage";

import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import MyOrders from "./pages/MyOrders";
import SupportTickets from "./pages/SupportTickets";
import Wishlist from "./pages/Wishlist";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

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
      <Routes location={location} key={location.pathname}>
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
          <AnimatedRoutes setIsAdminMode={setIsAdminMode} />
        </main>

        {!isAdminMode && <Footer />}
      </Router>
    </>
  );
};

export default App;
