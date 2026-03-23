import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Leaf, Heart, Star, Quote, ShoppingBag, ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { BASE_URL } from "../constent"; // 👈 Verified correct for your folder structure
import bgImage from "../asset/1431622.jpg";

export default function ProductSection() {
  const navigate = useNavigate();
  const [topProducts, setTopProducts] = useState([]);
  const [pinnedComments, setPinnedComments] = useState([]);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        // --- FIX 1: Added '/' before api ---
        const res = await axios.get(`${BASE_URL}/api/products`);
        const allProducts = Array.isArray(res.data) ? res.data : (res.data.products || []);

        // 1. Get Top Products (Sorting by most likes)
        const sortedProducts = [...allProducts]
          .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
          .slice(0, 3); 
        setTopProducts(sortedProducts);

        // 2. Extract strictly PINNED comments from ALL products
        let extractedComments = [];
        allProducts.forEach(product => {
          if (Array.isArray(product.comments)) {
            product.comments.forEach(comment => {
              if (comment.isPinned === true || comment.isPinned === "true") {
                extractedComments.push({ ...comment, productName: product.name });
              }
            });
          }
        });
        
        const finalComments = extractedComments
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        
        setPinnedComments(finalComments);

      } catch (err) {
        console.error("Failed to load homepage data", err);
      }
    };

    fetchHomepageData();
  }, []);

  // --- FIX 2: Cleaned up the double BASE_URL and added '/' ---
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${BASE_URL}/${url.replace(/^\/+/, '')}`; // Removes extra slashes from start of url
  };

  return (
    <section 
      className="relative overflow-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        
        {/* --- 1. MOST LOVED PRODUCTS SECTION --- */}
        {topProducts.length > 0 && (
          <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 md:py-16">
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3 flex items-center justify-center gap-3 tracking-tight drop-shadow-lg">
                  <ShoppingBag className="text-green-500" size={32} /> Most <span className="text-green-500">Loved</span>
                </h2>
                <div className="w-16 h-1.5 bg-green-500 mx-auto rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)] mb-4"></div>
                <p className="text-white/80 italic text-base drop-shadow-md">Our community's absolute favorites right now.</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
              {topProducts.map((product, idx) => (
                <motion.div 
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl cursor-pointer group hover:bg-white/20 hover:border-green-500/50 transition-all w-full max-w-[280px]"
                >
                  <div className="h-40 overflow-hidden bg-black/40 relative">
                    {product.images && product.images.length > 0 ? (
                      <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20"><Leaf size={40} /></div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                      <Heart size={14} className="fill-green-500 text-green-500" />
                      <span className="text-white text-xs font-bold">{product.likes?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-black text-white truncate mb-1 drop-shadow-md">{product.name}</h3>
                    <p className="text-green-400 font-black text-xl mb-3 drop-shadow-md">₹{product.price}</p>
                    <button className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-sm group-hover:bg-green-500 group-hover:text-black transition-all shadow-lg">
                      View Details <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <button onClick={() => navigate('/products')} className="text-green-400 hover:text-green-300 font-bold text-base md:text-lg flex items-center justify-center gap-2 mx-auto transition-colors border-b border-transparent hover:border-green-400 pb-1 drop-shadow-md">
                Explore Full Collection <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* --- 2. WALL OF LOVE --- */}
        {pinnedComments.length > 0 && (
          <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 md:py-16">
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3 flex items-center justify-center gap-3 tracking-tight drop-shadow-lg">
                  <Star className="text-amber-400 fill-amber-400" size={32} /> Customer <span className="text-amber-400">Wall of Love</span>
                </h2>
                <div className="w-16 h-1.5 bg-amber-400 mx-auto rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)] mb-4"></div>
                <p className="text-white/80 italic text-base drop-shadow-md">Don't just take our word for it. Hear from our satisfied users.</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pinnedComments.map((comment, idx) => (
                <motion.div 
                  key={comment._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl relative hover:bg-white/20 transition-colors"
                >
                  <Quote size={32} className="text-white/20 absolute top-5 right-5" />
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-amber-400 fill-amber-400 drop-shadow-md" />
                    ))}
                  </div>

                  <p className="text-white text-base leading-relaxed mb-4 italic relative z-10 drop-shadow-sm">
                    "{comment.text}"
                  </p>
                  
                  <div className="flex flex-col border-t border-white/20 pt-3 mt-auto">
                    <span className="font-bold text-white text-sm tracking-wide">{comment.userName}</span>
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider mt-1">Verified Buyer of {comment.productName}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}