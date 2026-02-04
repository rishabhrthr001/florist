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

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <>
      <Toaster richColors position="top-right" />
      <Router>
        <ScrollToTop />

        {!isAdminMode && <Navbar />}

        <main className={isAdminMode ? "" : "pt-0"}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* PUBLIC */}
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/make-your-own" element={<MakeYourOwn />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/contact" element={<ContactPage />} />

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
        </main>

        {!isAdminMode && <Footer />}
      </Router>
    </>
  );
};

export default App;
