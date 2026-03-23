import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, LayoutDashboard, Menu, X, Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import NotificationBell from "./NotificationBell";
import {BASE_URL} from "../constent"

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // FETCH CART COUNT
  const fetchCartCount = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    setIsLoggedIn(!!user);
    setIsAdmin(user?.role === "admin");

    if (user && user.role !== "admin") {
      try {
        const res = await fetch(
          `${BASE_URL}/api/cart/${user._id || user.id}`
        );
        const data = await res.json();
        setCartCount(data?.items?.length || 0);
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  // LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCartCount(0);
    setIsMenuOpen(false); 
    navigate("/");
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const navBtnStyle =
    "px-6 py-2 bg-white/20 border border-white/30 text-white rounded-full hover:bg-green-500 hover:text-black hover:border-green-500 transition-all duration-300 font-bold shadow-md backdrop-blur-md text-sm text-center";

  return (
    <motion.nav
      className="fixed w-full top-0 left-0 bg-black/30 backdrop-blur-lg border-b border-white/10 shadow-2xl z-[999]"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center h-20">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-xl">
            <Leaf size={24} className="text-black" />
          </div>
          <span className="text-1xl font-black text-white">
            TULASI <span className="text-green-400">🌿</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-8 text-white font-bold">
            {!isAuthPage && (
              <>
                <Link className="hover:text-green-500 transition-colors" to="/">
                  Home
                </Link>
                <Link className="hover:text-green-500 transition-colors" to="/products">
                  Products
                </Link>
              </>
            )}
            <Link className="hover:text-green-500 transition-colors" to="/about">
              About Us
            </Link>

            {/* ADMIN DASHBOARD */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-bold transition-colors"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            )}
          </div>

          {/* RIGHT SIDE */}
          {!isAuthPage && (
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  {/* --- NOTIFICATION BELL (DESKTOP) --- */}
                  <NotificationBell />

                  {!isAdmin && (
                    <Link
                      to="/cart"
                      className="relative text-white hover:text-green-500 transition-colors"
                    >
                      <ShoppingCart size={22} />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <button onClick={handleLogout} className={navBtnStyle}>
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className={navBtnStyle}>
                  Login
                </Link>
              )}
            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON & BELL */}
        <div className="md:hidden flex items-center gap-4">
          
          {/* --- NOTIFICATION BELL (MOBILE) --- */}
          {isLoggedIn && !isAuthPage && (
             <NotificationBell />
          )}

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-green-400 transition-colors"
          >
            {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 w-full bg-black/95 backdrop-blur-xl p-6 flex flex-col gap-6 border-b border-white/10 shadow-2xl"
          >
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-white text-xl font-bold hover:text-green-400 transition-colors">
              Home
            </Link>
            
            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="text-white text-xl font-bold hover:text-green-400 transition-colors">
              Products
            </Link>
            
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-white text-xl font-bold hover:text-green-400 transition-colors">
              About
            </Link>

            {isAdmin && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-yellow-400 text-xl font-bold hover:text-yellow-300 transition-colors">
                Dashboard
              </Link>
            )}

            {isLoggedIn ? (
              <button onClick={handleLogout} className="text-red-400 text-xl font-bold text-left hover:text-red-300 transition-colors">
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-green-400 text-xl font-bold hover:text-green-300 transition-colors">
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}