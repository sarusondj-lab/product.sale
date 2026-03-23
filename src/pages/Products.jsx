import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  ShoppingCart, Leaf, Loader2, Search, ArrowRight, Heart, AlignLeft, 
  ChevronLeft, ChevronRight, Truck, Package 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import bgImage from "../asset/1431622.jpg";
import { toast } from "sonner";
import { BASE_URL } from "../constent";

// -----------------------------------------------------
// --- BIG FULL-SCREEN TRUCK ANIMATION ---
// -----------------------------------------------------
const FullScreenCartAnimation = ({ productName }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // bg-black/10 creates that 10% darkness + backdrop-blur-md creates the glass effect
      className="fixed inset-0 z-[9999] bg-black/10 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden w-full max-w-sm h-64">
        
        <h2 className="text-white font-black text-2xl mb-8 text-center z-30 drop-shadow-lg">
          {productName} Added!
        </h2>
        
        <div className="relative w-full flex justify-center items-end h-32">
          {/* Subtle glowing road line */}
          <div className="absolute bottom-0 w-full h-[3px] bg-white/30 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>

          {/* Huge Truck Animation */}
          <motion.div
            initial={{ x: -250 }}
            animate={{ x: [-250, 0, 0, 250] }}
            transition={{ duration: 2.5, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
            className="absolute bottom-1 z-10"
          >
            <Truck size={80} strokeWidth={1.5} className="text-white drop-shadow-xl" />
          </motion.div>
          
          {/* Dropping Package Animation */}
          <motion.div
            initial={{ y: -150, x: -15, opacity: 0 }}
            // y: -25 perfectly lands the package in the bed of the size={80} truck
            // x: 235 moves it perfectly alongside the truck when driving away (-15 + 250)
            animate={{ y: [-150, -25, -25, -25], x: [-15, -15, -15, 235], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.5, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
            className="absolute bottom-1 z-20"
          >
            <Package size={32} className="text-green-500 fill-green-100 drop-shadow-xl" />
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});
  
  // Controls the big middle-of-screen animation
  const [animatingProduct, setAnimatingProduct] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products`);
      const data = Array.isArray(res.data) ? res.data : (res.data.products || []);
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) return;
    const user = JSON.parse(userData);

    try {
      const res = await fetch(`${BASE_URL}/api/cart/${user._id || user.id}`);
      const data = await res.json();
      const cartMap = {};
      const items = data.items || data.products || [];
      items.forEach((item) => {
        cartMap[item.productId] = true;
      });
      setCartItems(cartMap);
    } catch (error) {
      console.error("Cart fetch error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
    window.addEventListener("cartUpdated", fetchCart);
    return () => window.removeEventListener("cartUpdated", fetchCart);
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredProducts(products);
      setCurrentPage(1); 
      return;
    }
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); 
  }, [search, products]);

  const addToCart = async (product) => {
    if (animatingProduct) return; // Prevent spam clicking while animating

    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }
      const user = JSON.parse(userData);

      if (cartItems[product._id]) {
        navigate("/cart");
        return;
      }

      // 1. Instantly show the cinematic big animation
      setAnimatingProduct(product.name);
      
      // 2. Hide animation after 2.5 seconds (duration of the truck driving)
      setTimeout(() => {
        setAnimatingProduct(null);
      }, 2500);

      // 3. Make the API call in the background
      await axios.post(`${BASE_URL}/api/cart/add`, {
        userId: user._id || user.id,
        product: {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          quantity: 1
        }
      });

      // Update UI state silently without the standard annoying toast
      setCartItems(prev => ({ ...prev, [product._id]: true }));
      window.dispatchEvent(new Event("cartUpdated"));

    } catch (error) {
      // If it fails, cancel the animation and show an error
      setAnimatingProduct(null);
      toast.error("Could not add to cart. Try again.");
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  return (
    <>
      {/* Central Big Animation Overlay */}
      <AnimatePresence>
        {animatingProduct && (
          <FullScreenCartAnimation productName={animatingProduct} />
        )}
      </AnimatePresence>

      <section
        className="min-h-screen pt-28 pb-12 flex flex-col items-center px-4 md:px-6 bg-cover bg-center bg-fixed relative"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        <div className="relative z-10 w-full max-w-7xl h-full flex flex-col justify-start md:justify-between">
          
          <div className="mb-6 md:mb-0">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-black text-white mb-4 text-center drop-shadow-lg"
            >
              Our <span className="text-green-400">Tulasi</span> Collection 🌿
            </motion.h1>

            <div className="flex justify-center mb-4">
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-4 top-2.5 text-white/70" size={18} />
                <input
                  type="text"
                  placeholder="Search botanical products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all shadow-xl text-sm"
                />
              </div>
            </div>
          </div>

          <div className="w-full flex-1 flex flex-col justify-center py-4">
            {loading ? (
              <div className="flex justify-center items-center h-full py-20">
                <Loader2 className="animate-spin text-green-400" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-items-center w-full max-w-5xl mx-auto">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isInCart={!!cartItems[product._id]}
                    addToCart={addToCart}
                    onGoToCart={() => navigate("/cart")}
                    onNavigate={() => navigate(`/product/${product._id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 md:mt-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/10 border border-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-all shadow-md"
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`w-8 h-8 rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center ${
                    currentPage === i + 1 
                      ? 'bg-green-500 text-black scale-110' 
                      : 'bg-white/10 border border-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/10 border border-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-all shadow-md"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>
      </section>
    </>
  );
}

// -----------------------------------------------------
// --- PRODUCT CARD COMPONENT ---
// -----------------------------------------------------
function ProductCard({ product, isInCart, addToCart, onGoToCart, onNavigate }) {
  const images = product.images || [];

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const userId = user?._id || user?.id;

  const [isLiked, setIsLiked] = useState(product.likes?.includes(userId) || false);
  const [likeCount, setLikeCount] = useState(product.likes?.length || 0);

  const toggleLike = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error("Please login to like products.");

    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await axios.post(`${BASE_URL}/api/products/${product._id}/like`, { userId });
    } catch (error) {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      toast.error("Failed to update like status");
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  };

  return (
    <motion.div 
      layout
      className="group bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg flex flex-col overflow-hidden w-full max-w-[220px] hover:bg-white/15 transition-all duration-300 relative cursor-pointer"
      onClick={onNavigate} 
    >
      <button 
        onClick={toggleLike}
        className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 hover:bg-black/60 transition-all"
      >
        <Heart size={12} className={`transition-colors duration-300 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
        <span className="text-white text-[10px] font-bold">{likeCount}</span>
      </button>

      <div className="relative h-28 md:h-32 w-full overflow-hidden bg-black/20">
        {images.length > 0 ? (
          <img
            src={getImageUrl(images[0])}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 "
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <Leaf size={30} />
          </div>
        )}
      </div>

      <div className="p-3 flex flex-row justify-between items-end w-full gap-2">
        
        <div className="flex flex-col min-w-0 flex-1">
          <h2 className="text-sm md:text-base font-black text-white truncate w-full leading-tight">{product.name}</h2>
          <p className="text-green-400 font-black text-base md:text-lg truncate w-full mb-1">₹{product.price}</p>
          
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(); }}
            className="text-[9px] md:text-[10px] font-bold flex items-center gap-1 bg-white/10 text-white px-2 py-1 rounded-md border border-white/10 hover:bg-white/20 transition-all uppercase tracking-wide w-max"
          >
            <AlignLeft size={10} className="text-green-400" /> Details
          </button>
        </div>

        <div className="shrink-0 mb-0.5">
          {isInCart ? (
            <button
              onClick={(e) => { e.stopPropagation(); onGoToCart(); }}
              title="Go to Cart"
              className="bg-white/10 text-green-400 border border-green-400/50 p-2 md:p-2.5 rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-black transition-all shadow-md"
            >
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              title="Add to Cart"
              className="bg-green-500 text-black p-2 md:p-2.5 rounded-xl flex items-center justify-center hover:bg-green-400 active:scale-95 transition-all shadow-md shadow-green-900/20"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
        
      </div>
    </motion.div>
  );
}