import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronLeft, ChevronRight, X, ShoppingCart, Loader2, ArrowRight,
  Globe, Heart, MessageCircle, Send, ShieldCheck, Trash2, AlignLeft, Pin,
  Truck, Package // <-- Added Truck and Package for the animation
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [lang, setLang] = useState("en"); 
  const [cartItems, setCartItems] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Controls the big middle-of-screen animation
  const [animatingProduct, setAnimatingProduct] = useState(null);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const isAdmin = user?.role === "admin";
  const userId = user?._id || user?.id;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [adminReplyText, setAdminReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchProductAndCart();
  }, [id]);

  const fetchProductAndCart = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products/${id}`);
      const data = res.data;
      setProduct(data);
      setIsLiked(data.likes?.includes(userId) || false);
      setLikeCount(data.likes?.length || 0);
      setComments(data.comments || []);

      if (user) {
        const cartRes = await fetch(`${BASE_URL}/api/cart/${userId}`);
        const cartData = await cartRes.json();
        const cartMap = {};
        const items = cartData.items || cartData.products || [];
        items.forEach((item) => {
          cartMap[item.productId] = true;
        });
        setCartItems(cartMap);
      }
    } catch (err) {
      toast.error("Product not found");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => url && !url.startsWith("http") ? `${BASE_URL}${url}` : url;
  const images = product?.images || [];

  const nextImage = (e) => { e?.stopPropagation(); setImgIndex((prev) => (prev + 1) % images.length); };
  const prevImage = (e) => { e?.stopPropagation(); setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); };

  const getDescription = () => {
    if (!product) return "";
    
    if (lang === "hi") {
      if (!product.descriptionHindi || product.descriptionHindi === product.description) {
        return `[Translation Failed] ${product.description}`;
      }
      return product.descriptionHindi;
    }
    
    if (lang === "kn") {
      if (!product.descriptionKannada || product.descriptionKannada === product.description) {
        return `[Translation Failed] ${product.description}`;
      }
      return product.descriptionKannada;
    }

    return product.description; 
  };

  const toggleLike = async (e) => {
    e?.stopPropagation();
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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) return toast.error("Please login to comment.");
    const tempId = Date.now().toString();
    const tempComment = {
      _id: tempId, userId: userId, userName: user.name, text: newComment, isPinned: false, createdAt: new Date().toISOString()
    };
    setComments([...comments, tempComment]);
    setNewComment("");
    try {
      const res = await axios.post(`${BASE_URL}/api/products/${product._id}/comments`, {
        userId, userName: user.name, text: newComment
      });
      setComments((prevComments) => prevComments.map(c => c._id === tempId ? res.data.comment : c));
    } catch (error) {
      toast.error("Failed to post comment");
      setComments((prevComments) => prevComments.filter(c => c._id !== tempId));
    }
  };

  const handleAdminReply = async (commentId) => {
    if (!adminReplyText.trim()) return;
    setComments(comments.map(c => c._id === commentId ? { ...c, adminReply: adminReplyText } : c));
    setAdminReplyText("");
    setReplyingTo(null);
    try {
      await axios.post(`${BASE_URL}/api/products/${product._id}/comments/${commentId}/reply`, { adminReply: adminReplyText });
      toast.success("Reply posted");
    } catch (error) {
      toast.error("Failed to post reply");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const previousComments = [...comments];
    setComments(comments.filter((c) => c._id !== commentId));
    try {
      await axios.delete(`${BASE_URL}/api/products/${product._id}/comments/${commentId}`, { data: { userId, isAdmin } });
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
      setComments(previousComments);
    }
  };

  const handleTogglePin = async (commentId) => {
    try {
      const res = await axios.put(`${BASE_URL}/api/products/${product._id}/comments/${commentId}/pin`, { isAdmin });
      setComments(res.data.comments);
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Failed to pin comment");
    }
  };

  const addToCart = async () => {
    if (animatingProduct) return; // Prevent spam clicking
    if (!user) return toast.error("Please login first");
    if (cartItems[product._id]) return navigate("/cart");
    
    try {
      // 1. Instantly trigger the big truck animation
      setAnimatingProduct(product.name);
      
      // 2. Clear the animation after 2.5s
      setTimeout(() => {
        setAnimatingProduct(null);
      }, 2500);

      // 3. Do the API call in the background
      await axios.post(`${BASE_URL}/api/cart/add`, {
        userId, product: { productId: product._id, name: product.name, price: product.price, image: images[0] || "", quantity: 1 }
      });
      
      // Update UI state silently
      setCartItems(prev => ({ ...prev, [product._id]: true }));
      window.dispatchEvent(new Event("cartUpdated"));

    } catch (error) {
      setAnimatingProduct(null);
      toast.error('Could not add to cart.');
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; 
  });

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <Loader2 className="animate-spin text-green-400" size={48} />
      </div>
    );
  }

  return (
    <>
      {/* Central Big Animation Overlay */}
      <AnimatePresence>
        {animatingProduct && (
          <FullScreenCartAnimation productName={animatingProduct} />
        )}
      </AnimatePresence>

      <section className="min-h-screen pt-28 pb-20 px-4 md:px-10 bg-cover bg-center bg-fixed relative" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <button onClick={() => navigate("/products")} className="mb-6 flex items-center gap-2 text-white/70 hover:text-white font-bold transition-colors">
            <ChevronLeft size={20} /> Back to Products
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-4 shadow-2xl lg:sticky lg:top-24 h-max flex flex-col gap-3 md:gap-4">
              
              <div 
                className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/40 shadow-inner cursor-zoom-in"
                onClick={() => setShowImageModal(true)}
              >
                {images.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={imgIndex} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      src={getImageUrl(images[imgIndex])} 
                      alt={product.name} 
                      className="w-full h-full object-contain absolute inset-0 z-0" 
                    />
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20"><Globe size={60} /></div>
                )}
                
                <button onClick={toggleLike} className="absolute top-3 right-3 z-[60] flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hover:bg-black/80 transition-all shadow-xl">
                  <Heart size={14} className={`transition-colors duration-300 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
                  <span className="text-white font-bold text-xs">{likeCount}</span>
                </button>

                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md border border-white/30 p-1.5 md:p-2 rounded-full text-white hover:bg-green-500 hover:border-green-500 transition-all shadow-2xl z-[50]">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={nextImage} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md border border-white/30 p-1.5 md:p-2 rounded-full text-white hover:bg-green-500 hover:border-green-500 transition-all shadow-2xl z-[50]">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                  {images.map((img, idx) => (
                    <button key={idx} onClick={() => setImgIndex(idx)} className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border-2 transition-all ${imgIndex === idx ? 'border-green-400 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-1 mt-1">
                <h1 className="text-xl md:text-2xl font-black text-white leading-tight">{product.name}</h1>
                <p className="text-green-400 font-bold text-[10px] uppercase tracking-wider mb-1">Botany Grade Product</p>
                <p className="text-2xl md:text-3xl font-black text-white mb-3">₹{product.price}</p>

                <button
                  onClick={addToCart}
                  className="w-full bg-green-500 text-black py-2.5 md:py-3 rounded-xl font-black text-sm md:text-base hover:bg-green-400 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-900/30"
                >
                  {cartItems[product._id] ? (
                    <>Go to Cart <ArrowRight size={16} /></>
                  ) : (
                    <><ShoppingCart size={16} /> Add to Cart</>
                  )}
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 md:p-8 shadow-2xl">
                <h4 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2"><AlignLeft className="text-green-400"/> Description</h4>
                
                <div className="flex flex-wrap gap-2 mb-5">
                  {["en", "hi", "kn"].map((l) => (
                    <button
                      key={l} onClick={() => setLang(l)}
                      className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${lang === l ? "bg-green-500 text-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"}`}
                    >
                      {l === "en" ? "English" : l === "hi" ? "Hindi" : "Kannada"}
                    </button>
                  ))}
                </div>

                <div className="bg-black/30 rounded-2xl p-4 md:p-6 border border-white/5">
                  <p className="text-white/80 leading-relaxed italic text-sm md:text-[15px] whitespace-pre-line">
                    "{getDescription()}"
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 md:p-8 shadow-2xl">
                <h4 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2"><MessageCircle className="text-blue-400"/> Q&A / Reviews</h4>
                
                <div className="space-y-4 mb-6 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {sortedComments.length === 0 ? (
                    <p className="text-white/40 italic text-sm md:text-base">No comments yet. Be the first to ask a question!</p>
                  ) : (
                    sortedComments.map((c) => (
                      <div 
                        key={c._id} 
                        className={`rounded-2xl p-4 md:p-5 relative group transition-all duration-300 ${
                          c.isPinned 
                            ? 'bg-amber-500/10 border-2 border-amber-500/40 mt-4' 
                            : 'bg-white/5 border border-white/5'
                        }`}
                      >
                        
                        {c.isPinned && (
                          <div className="absolute -top-3 left-4 bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-lg">
                            <Pin size={12} className="fill-black" /> Pinned
                          </div>
                        )}

                        {(isAdmin || c.userId === userId) && (
                          <div className="absolute top-3 right-3 md:top-4 md:right-4 flex gap-2 z-10">
                            
                            {isAdmin && (
                              <button 
                                onClick={() => handleTogglePin(c._id)} 
                                className={`p-1.5 md:p-2 rounded-full transition-all shadow-md ${c.isPinned ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-white/10 text-white/60 hover:bg-amber-500/20 hover:text-amber-400'}`}
                                title={c.isPinned ? "Unpin Comment" : "Pin Comment"}
                              >
                                <Pin size={14} className={`md:w-4 md:h-4 ${c.isPinned ? 'fill-black' : ''}`} />
                              </button>
                            )}

                            <button onClick={() => handleDeleteComment(c._id)} className="bg-red-500/20 text-red-400 p-1.5 md:p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-md" title="Delete Comment">
                              <Trash2 size={14} className="md:w-4 md:h-4" />
                            </button>
                          </div>
                        )}
                        
                        <p className={`pr-16 md:pr-20 text-sm md:text-base ${c.isPinned ? 'text-white' : 'text-white/90'}`}>
                          <span className={`font-bold mr-2 ${c.isPinned ? 'text-amber-400' : 'text-green-300'}`}>{c.userName}:</span>
                          {c.text}
                        </p>
                        
                        {c.adminReply && (
                          <div className="mt-3 md:mt-4 ml-2 md:ml-4 bg-green-900/20 border-l-2 border-green-500 p-3 md:p-4 rounded-r-xl">
                            <p className="text-green-100 flex items-start gap-2 text-xs md:text-sm">
                              <ShieldCheck size={16} className="text-green-400 shrink-0 mt-0.5" />
                              <span><strong className="text-green-400">Admin:</strong> {c.adminReply}</span>
                            </p>
                          </div>
                        )}

                        {isAdmin && !c.adminReply && (
                          <div className="mt-3 md:mt-4 ml-2 md:ml-4">
                            {replyingTo === c._id ? (
                              <div className="flex gap-2 flex-wrap">
                                <input type="text" value={adminReplyText} onChange={(e) => setAdminReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdminReply(c._id)} placeholder="Type official reply..." className="flex-1 min-w-[150px] bg-black/50 border border-green-500/30 rounded-xl px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-white outline-none focus:border-green-500" />
                                <button onClick={() => handleAdminReply(c._id)} className="bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold hover:bg-green-500">Send</button>
                                <button onClick={() => setReplyingTo(null)} className="text-white/40 px-2 hover:text-white bg-white/5 rounded-xl"><X size={16}/></button>
                              </div>
                            ) : (
                              <button onClick={() => setReplyingTo(c._id)} className="text-xs md:text-sm font-bold text-green-400 hover:text-green-300 flex items-center gap-1"><ShieldCheck size={12} className="md:w-3.5 md:h-3.5"/> Reply as Admin</button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {!isAdmin && (
                  <div className="flex gap-2 md:gap-3">
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} placeholder="Leave a review..." className="flex-1 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-base text-white outline-none focus:border-green-400 transition-colors shadow-inner" />
                    <button onClick={handleAddComment} className="bg-blue-500 hover:bg-blue-400 text-white px-4 md:px-6 rounded-xl md:rounded-2xl transition-all shadow-xl flex items-center justify-center"><Send size={18} className="md:w-5 md:h-5" /></button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <AnimatePresence>
        {showImageModal && (
          <ImageModal 
            imageUrl={images[imgIndex]} 
            onClose={() => setShowImageModal(false)} 
            getImageUrl={getImageUrl} 
          />
        )}
      </AnimatePresence>
    </>
  );
}

const ImageModal = ({ imageUrl, onClose, getImageUrl }) => {
  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={getImageUrl(imageUrl)}
          alt="Zoomed Product"
          className="rounded-3xl object-contain max-h-[85vh] max-w-full shadow-2xl border border-white/10"
        />
        <button onClick={onClose} className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/20 backdrop-blur-md border border-white/30 text-white p-2 md:p-3 rounded-full shadow-2xl hover:bg-red-500 hover:border-red-500 transition-all z-50">
          <X size={20} className="md:w-6 md:h-6" />
        </button>
      </div>
    </motion.div>,
    document.body
  );
};