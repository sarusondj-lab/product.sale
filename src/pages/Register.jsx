import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {BASE_URL} from "../constent"

export default function Register({ toggle }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false); // Show OTP form
  const [otp, setOTP] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  // ---------------- Register User ----------------
  const handleRegister = async (e) => {
    e.preventDefault();

    // Gmail validation
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      toast.error("Please enter a valid Gmail address.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating account...");

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      toast.success(res.data.message || "Registration successful!", { id: toastId });

      // Show OTP input form
      setRegisteredEmail(res.data.email);
      navigate("/verify-otp", { state: { email } });

      // Clear password field (name/email we keep for OTP)
      setPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Verify OTP ----------------
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Enter OTP first.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Verifying OTP...");

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        email: registeredEmail,
        otp,
      });

      toast.success(res.data.message || "OTP verified successfully!", { id: toastId });

      // OTP verified → redirect to login
      if (toggle) toggle();
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {!showOTP ? (
        <>
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Join <span className="text-green-500">Tulasi</span>
          </h1>

          <form onSubmit={handleRegister} className="w-full flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-green-400 transition-all"
            />

            <input
              type="email"
              placeholder="Gmail Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-green-400 transition-all"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-green-400 transition-all"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-400 py-4 rounded-xl text-black font-bold shadow-lg transition-all active:scale-95 mt-2 flex justify-center"
            >
              {loading ? "Creating..." : "Register Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-white/80 text-sm">
            Already have an account?{" "}
            <button
              onClick={toggle}
              className="hover:text-green-500 text-white font-bold hover:underline"
            >
              Login
            </button>
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Enter OTP sent to <span className="text-green-500">{registeredEmail}</span>
          </h1>

          <form onSubmit={handleVerifyOTP} className="w-full flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              required
              className="w-full p-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-green-400 transition-all"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-400 py-4 rounded-xl text-black font-bold shadow-lg transition-all active:scale-95 mt-2 flex justify-center"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}