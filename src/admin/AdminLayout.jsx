import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Store,
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Logout (works for both admin and user system)
  const handleLogout = () => {
    localStorage.removeItem("user");

    // update navbar state
    window.dispatchEvent(new Event("storage"));

    navigate("/");
  };

  // ✅ Added "Products Page" directly into the menu list!
  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Products", path: "/admin/products", icon: <Package size={20} /> },
    { name: "Orders List", path: "/admin/orders", icon: <ClipboardList size={20} /> },
    { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
    { name: "Products Page", path: "/products", icon: <Store size={20} /> },
  ];

  const sidebarLinkStyle = (path) => `
    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
    ${
      location.pathname === path
        ? "bg-green-600 text-white shadow-lg shadow-green-900/20"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    }
  `;

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-[#0f172a] p-6 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-white font-black text-xl flex items-center gap-2">
            Tulasi Admin <span className="text-green-500">🌿</span>
          </h1>

          <button
            className="md:hidden text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* --- MAIN MENU NAVIGATION --- */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={sidebarLinkStyle(item.path)}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}

          {/* Divider Line */}
          <div className="h-px bg-white/10 my-2"></div>

          {/* Logout Button moved up directly underneath the menu */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-300 w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <header className="h-16 bg-white border-b flex items-center justify-between px-6 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-600"
          >
            <Menu size={24} />
          </button>

          <span className="font-bold text-slate-800 text-sm italic">
            Tulasi Admin
          </span>

          <div className="w-6" />
        </header>

        <div className="p-4 md:p-8 overflow-auto h-full">
          <Outlet />
        </div>

      </main>
    </div>
  );
}