import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import bgImage from "../asset/1431622.jpg";
import {BASE_URL} from "../constent"

export default function Login() {
  const [view, setView] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  

  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || "/";

  useEffect(() => {
    setEmail("");
    setPassword("");
    setName("");
  }, [view]);

  const handleAuth = async (e) => {
    e.preventDefault(); // 👈 ADD THIS LINE RIGHT HERE
    
    setLoading(true);
    console.log("Auth process started for:", view); // Helpful for debugging
    
    // ... rest of your code

    if (view === "register") {
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(email)) {
        toast.error("Please enter a valid Gmail address.");
        setLoading(false);
        return;
      }
    }

    const endpoint = view === "register" ? "register" : "login";
    const payload = view === "register" ? { name, email, password } : { email, password };
    const toastId = toast.loading(view === "login" ? "Logging in..." : "Creating account...");

    try {
      
      const res = await axios.post(`${BASE_URL}/api/auth/${endpoint}`, payload);

      if (view === "login") {
        const userData = res.data?.user;

        if (!userData) {
          toast.error("Login failed. No user found.", { id: toastId });
          setLoading(false);
          return;
        }

        // ADMIN bypass verification & redirect
        if (userData.role === "admin") {
          localStorage.setItem("user", JSON.stringify(userData));
          toast.success(`Welcome Admin! 🌿`, { id: toastId });
          navigate("/admin");
          window.location.reload();
          return;
        }

        if (!userData.isActive) {
          // We keep this here just in case the backend sends a 200 OK but isActive is false
          toast.error("Account Deactivated", {
            id: toastId,
            description: "Please contact the owner, or check your Gmail for a deactivation message and click the link to reactivate.",
            duration: 6000
          });
          setLoading(false);
          return;
        }

        if (!userData.isVerified) {
          toast.error("Please verify your email to login.", { id: toastId });
          setLoading(false);
          return;
        }

        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.name}!`, { id: toastId });
        navigate(redirectPath);
        window.location.reload();
      } else {
        toast.success("Registration successful! Check your email for OTP.", { id: toastId });

        navigate("/verify-otp", {
          state: { email }
        });
      }
    } catch (err) {
      // --- THIS IS THE UPDATED CATCH BLOCK ---
      const backendMessage = err.response?.data?.message || "Server Error";

      // Intercept the backend deactivation error and show our detailed message
      if (backendMessage.toLowerCase().includes("deactivated")) {
        toast.error("Account Deactivated", {
          id: toastId,
          description: "Please contact the owner, or check your Gmail for a deactivation message and click the link to reactivate.",
          duration: 6000
        });
      } else {
        // Show normal errors (like wrong password, etc.)
        toast.error(backendMessage, { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full p-3 rounded-lg outline-none bg-white/60 text-gray-900 placeholder-gray-500 border border-white/20 focus:border-green-500 transition-all font-medium";

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/20 backdrop-blur-xl p-8 md:p-10 rounded-3xl w-full max-w-[400px] shadow-2xl border border-white/30"
      >
        <h1 className="text-3xl text-white font-black mb-6 text-center drop-shadow-md">
          {view === "login" ? "Login" : "Register"}
        </h1>

        <form onSubmit={handleAuth} className="space-y-4" autoComplete="off">
          {view === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              className={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Gmail Address"
            className={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* --- FORGOT PASSWORD LINK --- */}
          {view === "login" && (
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm font-bold text-zinc-500 hover:text-zinc-600 hover:underline decoration-2 transition-all drop-shadow-sm"
              >
                Forgot Password ?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 transition-all py-3 rounded-lg font-black text-white shadow-lg active:scale-95 mt-2 flex justify-center"
          >
            {loading
              ? view === "login"
                ? "Logging in..."
                : "Creating..."
              : view === "login"
                ? "Login"
                : "Register"}
          </button>
        </form>

        <p className="text-white text-sm mt-6 text-center font-medium drop-shadow-sm">
          {view === "login" ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            className=" ml-2 font-bold text-white hover:text-green-500 hover:underline"
            onClick={() => setView(view === "login" ? "register" : "login")}
          >
            {view === "login" ? "Register" : "Login"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}