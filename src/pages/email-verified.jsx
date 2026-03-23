import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function EmailVerified() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const email = searchParams.get("email");
    if (!email) return;

    toast.success(`Email ${email} verified successfully! You can now login.`);
    setTimeout(() => navigate("/login"), 2000); // Redirect to login
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">Email verified! Redirecting to login...</h1>
    </div>
  );
}