import React, { useState, useEffect } from "react";
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus, Loader2, XCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import bgImage from "../asset/1431622.jpg";
import { toast } from "sonner";
import { BASE_URL } from "../constent"

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Helper to ensure backend image path works
    const getImageUrl = (url) => {
        if (!url) return "https://via.placeholder.com/150";
        return url.startsWith("http") ? url : `${BASE_URL}${url}`;
    };

    // FETCH CART
    const fetchCart = async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/api/cart/${id}`);
            if (!res.ok) throw new Error("Failed to fetch cart");

            const data = await res.json();
            // Standardize items array from backend response
            const items = (data.items || data.products || []).map((item) => ({
                ...item,
                quantity: item.quantity || 1
            }));

            setCart(items);
        } catch (error) {
            console.error("Cart fetch error:", error);
            toast.error("Failed to load cart data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;

        if (!user) {
            navigate("/login");
            return;
        }

        const id = user._id || user.id;
        setUserId(id);
        fetchCart(id);

        const handleCartUpdate = () => fetchCart(id);
        window.addEventListener("cartUpdated", handleCartUpdate);
        return () => window.removeEventListener("cartUpdated", handleCartUpdate);
    }, [navigate]);

    // UPDATE QUANTITY (Optimistic UI + Sync)
    const syncQuantity = async (productId, newQty) => {
        if (newQty < 1) return;

        const previousCart = [...cart];
        setCart(prev => 
            prev.map(item => 
                item.productId === productId ? { ...item, quantity: newQty } : item
            )
        );

        try {
            const res = await fetch(
                `${BASE_URL}/api/cart/${userId}/${productId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity: newQty })
                }
            );

            if (!res.ok) throw new Error("Server update failed");
            
            const data = await res.json();
            const updatedItems = data.items || data.products || [];
            setCart(updatedItems);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.error("Quantity update error:", error);
            toast.error("Failed to update quantity. Restoring previous state.");
            setCart(previousCart);
        }
    };

    // REMOVE SINGLE ITEM
    const removeFromCart = async (productId) => {
        const toastId = toast.loading("Removing item...");
        try {
            const res = await fetch(
                `${BASE_URL}/api/cart/${userId}/${productId}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error("Delete failed");
            
            const data = await res.json();
            setCart(data.items || data.products || []);
            
            toast.success("Item removed", { id: toastId });
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.error("Remove error:", error);
            toast.error("Could not remove item", { id: toastId });
        }
    };

    // CLEAR FULL CART (API Logic)
    const processClearCart = async () => {
        const toastId = toast.loading("Emptying cart...");
        try {
            const res = await fetch(`${BASE_URL}/api/cart/${userId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                setCart([]);
                toast.success("Cart cleared", { id: toastId });
                window.dispatchEvent(new Event("cartUpdated"));
            } else {
                throw new Error("Clear failed");
            }
        } catch (error) {
            console.error("Clear cart error:", error);
            toast.error("Failed to clear cart", { id: toastId });
        }
    };

    // CONFIRM CLEAR CART (Sonner UI)
    const confirmClearCart = () => {
        toast("Are you sure you want to empty your cart?", {
            icon: <AlertCircle className="text-red-500" />,
            action: {
                label: "Empty Cart",
                onClick: () => processClearCart()
            },
            cancel: {
                label: "Cancel"
            }
        });
    };

    const totalAmount = cart.reduce(
        (sum, item) => sum + Number(item.price || 0) * (item.quantity || 0),
        0
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="animate-spin text-green-500" size={48} />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative pt-28 pb-12 px-4"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* FIX: Header spacing and wrapping for mobile */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8 md:mb-10">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 leading-tight"
                    >
                        <ShoppingBag className="text-green-500 shrink-0" size={32} />
                        <div>
                            Your Shopping <br className="md:hidden" />
                            <span className="text-green-500">Cart</span>
                        </div>
                    </motion.h1>

                    {cart.length > 0 && (
                        <button 
                            onClick={confirmClearCart}
                            className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-bold transition-colors bg-red-500/10 px-4 py-2 rounded-xl self-start md:self-auto"
                        >
                            <XCircle size={18} /> Clear Cart
                        </button>
                    )}
                </div>

                {cart.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-20 text-center border border-white/20"
                    >
                        <p className="text-gray-300 text-lg md:text-xl mb-6">Your cart is empty.</p>
                        <button
                            onClick={() => navigate("/products")}
                            className="bg-green-500 text-black px-8 py-3 md:px-10 md:py-4 rounded-2xl font-black hover:scale-105 transition active:scale-95 text-sm md:text-base"
                        >
                            Start Shopping 🌿
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {cart.map((item) => (
                                <motion.div
                                    key={item.productId}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    /* FIX: Stack items vertically on small screens, horizontally on medium+ */
                                    className="bg-white/10 backdrop-blur-md p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-lg hover:bg-white/15 transition-colors"
                                >
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-white/10 shrink-0"
                                        />

                                        <div className="flex-1">
                                            <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2">{item.name}</h3>
                                            <p className="text-green-400 font-black text-base md:text-lg">₹{item.price}</p>

                                            <div className="flex items-center gap-3 mt-2 md:mt-3">
                                                <button
                                                    onClick={() => syncQuantity(item.productId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="p-1.5 md:p-2 bg-white/10 rounded-lg hover:bg-red-500 disabled:opacity-30 disabled:hover:bg-white/10 transition text-white active:scale-90"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="text-white font-bold text-base md:text-lg w-6 md:w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => syncQuantity(item.productId, item.quantity + 1)}
                                                    className="p-1.5 md:p-2 bg-white/10 rounded-lg hover:bg-green-500 transition text-white active:scale-90"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FIX: Price and trash can alignment for mobile */}
                                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-white/10 md:border-none">
                                        <div className="md:hidden text-white/60 text-sm font-bold">Subtotal:</div>
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <p className="text-white font-black text-xl md:text-2xl text-right">
                                                ₹{item.price * item.quantity}
                                            </p>
                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="p-2 md:p-3 text-red-400 bg-red-500/10 md:bg-transparent hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                title="Remove item"
                                            >
                                                <Trash2 size={20} className="md:w-6 md:h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <motion.div
                            layout
                            className="mt-8 md:mt-10 bg-white/10 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/20"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6 md:mb-8 text-white">
                                <span className="text-lg md:text-xl font-bold text-white/80">Total Amount:</span>
                                <span className="text-3xl md:text-4xl font-black text-green-500 tracking-tight">
                                    ₹{totalAmount}
                                </span>
                            </div>

                            <button
                                onClick={() => navigate("/checkout")}
                                className="w-full bg-green-500 text-black py-4 rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-3 hover:bg-green-400 hover:scale-[1.01] transition active:scale-95 shadow-xl shadow-green-500/20"
                            >
                                Proceed to Checkout <ArrowRight />
                            </button>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}