import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ForgetPassword from "./pages/ForgetPassword"; 
import EmailVerified from "./pages/email-verified";
import VerifyOTP from "./pages/VerifyOTP";
import ProductDetail from "./pages/ProductDetail";

import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import ManageProducts from "./admin/ManageProducts";
import Orders from "./admin/Orders";
import Users from "./admin/Users";
import { Toaster } from "sonner";

// --- BRUTE-FORCE SCROLL TO TOP OVERRIDE ---
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const forceTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    forceTop();

    const timer1 = setTimeout(forceTop, 50);
    const timer2 = setTimeout(forceTop, 100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  return null;
}
// ------------------------------------------

function Layout() {
  const location = useLocation();

  const hideNavbarRoutes = ["/admin"];
  const hideNavbar = hideNavbarRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      <Toaster
        theme="dark"
        position="top-center"
        expand={false}
        richColors={false}
        containerStyle={{
          top: '80px',
        }}
        toastOptions={{
          style: {
            background: 'rgba(23, 23, 23, 0.8)', 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            borderRadius: '1.25rem',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          },
          success: {
            icon: '🌿',
            style: {
              border: '1px solid rgba(34, 197, 94, 0.4)',
            },
          },
          error: {
            style: {
              border: '1px solid rgba(239, 68, 68, 0.4)',
            },
          },
        }}
      />
      
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* --- Store Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* --- Auth Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ForgetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* --- Admin Routes --- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>

      {!hideNavbar && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout />
    </Router>
  );
}