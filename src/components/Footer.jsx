import { Youtube, Instagram, MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  // ✅ Hide footer if the user is on any admin route
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="relative  backdrop-blur-md border-t  text-white py-12 bg-gray-900 overflow-hidden">
      {/* Background Glow Decor */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Section 1: Brand Info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight">
            Tulasi <span className="text-green-500">🌿</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Bringing nature's best straight to your doorstep. Quality products for a sustainable lifestyle.
          </p>
        </div>

        {/* Section 2: Store Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-green-400">Store Details</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-gray-400 group">
              <MapPin size={18} className="text-green-500 mt-1 shrink-0" />
              <span className="text-sm">123 Herbal Street, Green Valley,<br />Bengaluru, Karnataka 560001</span>
            </li>
            <li className="flex items-center gap-3 text-gray-400">
              <Phone size={18} className="text-green-500 shrink-0" />
              <span className="text-sm">+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-3 text-gray-400">
              <Mail size={18} className="text-green-500 shrink-0" />
              <span className="text-sm">support@tulasi.com</span>
            </li>
          </ul>
        </div>

        {/* Section 3: Socials */}
        <div className="space-y-4 md:text-right">
          <h3 className="text-lg font-bold text-green-400">Follow Us</h3>
          <div className="flex md:justify-end space-x-4">
            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-red-600/20 hover:text-red-500 transition-all border border-white/5">
              <Youtube size={20} />
            </a>
            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-pink-600/20 hover:text-pink-500 transition-all border border-white/5">
              <Instagram size={20} />
            </a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-green-600/20 hover:text-green-500 transition-all border border-white/5">
              <MessageCircle size={20} />
            </a>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] pt-4">
            © 2026 Tulasi. Purely Organic.
          </p>
        </div>
      </div>
    </footer>
  );
}