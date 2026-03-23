import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  CreditCard,
  Loader2,
  ChevronLeft,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner"; 
import {BASE_URL} from "../constent"

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    primaryPhone: "",
    secondaryPhone: "",
    fullAddress: "",
    addressType: "Home"
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user) {
      navigate("/login");
      return;
    }

    const id = user._id || user.id;
    setUserId(id);

    const fetchCart = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/cart/${id}`);
        const items = res.data.items || res.data.products || [];

        if (items.length === 0) {
          navigate("/products");
        } else {
          setCart(items);
        }
      } catch (error) {
        console.error("Cart Fetch Error:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + (Number(item.price) * (item.quantity || 1)),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // --- NEW PHONE VALIDATION LOGIC ---
    // 1. Starts with 6, 7, 8, or 9 and is exactly 10 digits
    const validStartRegex = /^[6-9]\d{9}$/;
    // 2. Checks if the number is just the same digit repeated 10 times (e.g. 9999999999)
    const allSameRegex = /^([0-9])\1{9}$/;

    // Primary Phone Check
    if (!validStartRegex.test(formData.primaryPhone) || allSameRegex.test(formData.primaryPhone)) {
      toast.error("Please enter a valid 10-digit mobile number starting with 6-9.");
      return;
    }

    // Secondary Phone Check (Only validate if they actually typed something)
    if (formData.secondaryPhone && (!validStartRegex.test(formData.secondaryPhone) || allSameRegex.test(formData.secondaryPhone))) {
      toast.error("Secondary phone number is invalid. Leave blank or enter a valid number.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Processing your order...");

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const orderData = {
        customerName: formData.fullName,
        email: user?.email || "Guest",
        phone1: formData.primaryPhone,
        phone2: formData.secondaryPhone,
        fullAddress: formData.fullAddress,
        addressType: formData.addressType,
        items: cart,
        totalAmount: totalAmount,
        userId: userId,
        status: "Pending"
      };

      // 1. Create the Order
      const res = await axios.post(`${BASE_URL}/api/orders`, orderData);

      if (res.status === 201) {
        // 2. Clear the cart on the backend
        await axios.delete(`${BASE_URL}/api/cart/${userId}`);
        
        // 3. Sync UI (Navbar count)
        window.dispatchEvent(new Event("cartUpdated"));

        // 4. Success Message and Redirect
        toast.success("Order placed successfully! 🌿", {
          id: toastId,
          description: "Our team will call you soon for confirmation.",
          icon: <CheckCircle2 className="text-green-500" />,
        });

        // Delay redirection so they see the success toast
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Failed to place order. Please try again.", { id: toastId });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="animate-spin text-green-500" size={48} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-950 pt-28 pb-12 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          Back to Cart
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* DELIVERY FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-5"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <MapPin className="text-green-500" />
                Delivery Details
              </h2>
              
              <div className="flex gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <AlertCircle className="text-orange-500 shrink-0" size={18} />
                <p className="text-xs text-orange-200/80 leading-relaxed">
                  Please provide correct contact numbers. Our team will call you to confirm the delivery once the order is placed.
                </p>
              </div>
            </div>

            <input
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />

            <input
              required
              maxLength="10"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
              placeholder="Primary Phone Number"
              value={formData.primaryPhone}
              onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value.replace(/\D/g, "") })}
            />

            <input
              maxLength="10"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
              placeholder="Secondary Phone (Optional)"
              value={formData.secondaryPhone}
              onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value.replace(/\D/g, "") })}
            />

            <textarea
              required
              rows="3"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all resize-none"
              placeholder="Full Address"
              value={formData.fullAddress}
              onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-green-500 hover:bg-green-400 text-black rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> Processing...
                </>
              ) : (
                `Confirm Order (₹${totalAmount})`
              )}
            </button>
          </form>

          {/* ORDER SUMMARY */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <CreditCard className="text-green-500" />
              Order Summary
            </h2>

            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl">
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-white/10 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-gray-200 font-medium">{item.name}</span>
                      <span className="text-xs text-gray-500">Qty: {item.quantity || 1}</span>
                    </div>
                    <span className="text-white font-bold">
                      ₹{item.price * (item.quantity || 1)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-2xl font-black text-green-500 mt-6 pt-6 border-t border-white/20">
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}