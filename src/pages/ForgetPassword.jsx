import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Lock, Loader2, ChevronLeft } from "lucide-react";
import bgImage from "../asset/1431622.jpg";
import {BASE_URL} from "../constent"

export default function ForgetPassword() {
  const { token } = useParams(); // This catches the token from the URL
  const navigate = useNavigate();
  
  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Determine if we are RESETTING or REQUESTING
  const isResetMode = !!token; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(isResetMode ? "Updating password..." : "Sending link...");

    try {
      if (isResetMode) {
        // --- MODE: RESET PASSWORD ---
        await axios.post(`${BASE_URL}/api/auth/reset-password/${token}`, { password });
        toast.success("Password updated!", { id: toastId });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // --- MODE: REQUEST LINK ---
        await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
        toast.success("Check your Gmail!", { id: toastId, description: "Reset link sent successfully." });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full p-4 rounded-2xl outline-none bg-white/60 text-gray-900 placeholder-gray-500 border border-white/20 focus:border-green-500 transition-all font-medium shadow-inner";

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center px-4" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 bg-white/20 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] w-full max-w-[420px] shadow-2xl border border-white/30 text-center">
        
        <button onClick={() => navigate("/login")} className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>

        <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
          {isResetMode ? <Lock size={32} className="text-white" /> : <Mail size={32} className="text-white" />}
        </div>

        <h1 className="text-3xl text-white font-black mb-2 drop-shadow-md">
          {isResetMode ? "New Password" : "Forgot Password"}
        </h1>
        
        <p className="text-white/80 text-sm mb-8 leading-relaxed">
          {isResetMode 
            ? "Enter a strong new password to secure your account." 
            : "Enter your registered Gmail address to receive a reset link."}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {isResetMode ? (
            <input
              type="password"
              placeholder="Enter new password"
              required
              className={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          ) : (
            <input
              type="email"
              placeholder="Enter your Gmail"
              required
              className={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-400 py-4 rounded-2xl font-black text-white shadow-xl shadow-green-500/20 active:scale-95 transition-all flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : (isResetMode ? "Update Password" : "Send Reset Link")}
          </button>
        </form>
      </motion.div>
    </div>
  );
}