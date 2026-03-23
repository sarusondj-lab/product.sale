import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import bgImage from "../asset/1431622.jpg";
import {BASE_URL} from "../constent"

export default function VerifyOTP() {
const [otp, setOTP] = useState("");
const [loading, setLoading] = useState(false);

const navigate = useNavigate();
const location = useLocation();
const email = location.state?.email;

const handleVerify = async (e) => {
e.preventDefault();


if (!otp) {
  toast.error("Enter OTP first");
  return;
}

setLoading(true);

try {
  const res = await axios.post(
    `${BASE_URL}/api/auth/verify-otp`,
    { email, otp }
  );

  toast.success(res.data.message || "OTP Verified!");

  navigate("/login");
} catch (err) {
  toast.error(err.response?.data?.message || "OTP verification failed");
}

setLoading(false);


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
> <h1 className="text-3xl text-white font-black mb-6 text-center drop-shadow-md">
Verify OTP </h1>


    <p className="text-white text-sm text-center mb-4">
      Enter the OTP sent to your email
    </p>

    <form onSubmit={handleVerify} className="space-y-4">
      <input
        type="text"
        placeholder="Enter OTP"
        className={inputStyle}
        value={otp}
        onChange={(e) => setOTP(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 transition-all py-3 rounded-lg font-black text-white shadow-lg active:scale-95 flex justify-center"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </form>

    <p className="text-white text-sm mt-6 text-center font-medium">
      Wrong email?
      <button
        onClick={() => navigate("/login")}
        className="text-green-300 ml-2 font-bold hover:text-green-100"
      >
        Go Back
      </button>
    </p>
  </motion.div>
</div>


);
}
