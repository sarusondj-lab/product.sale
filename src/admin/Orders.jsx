import React, { useEffect, useState } from "react";
import { ShoppingBag, Phone, MapPin, Trash2, Truck, User, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner"; // Import Sonner
import { BASE_URL } from "../constent";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders`);
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Could not load orders from database");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Updated Status with Sonner
  const updateStatus = async (id, status) => {
    const promise = fetch(`${BASE_URL}/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    toast.promise(promise, {
      loading: 'Updating status...',
      success: () => {
        fetchOrders();
        return `Order marked as ${status} 📦`;
      },
      error: 'Failed to update status',
    });
  };

  // ✅ Updated Delete with Sonner
  const deleteOrder = async (id) => {
    // Custom Sonner confirmation toast
    toast("Delete this order permanently?", {
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingId(id);
          try {
            const response = await fetch(`${BASE_URL}/api/orders/${id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              }
            });

            if (response.ok) {
              setOrders((prev) => prev.filter((o) => o._id !== id));
              toast.success("Order deleted successfully", {
                icon: <Trash2 size={16} className="text-red-500" />
              });
            } else {
              toast.error("Failed to delete order");
            }
          } catch (err) {
            toast.error("Network error: Server unreachable");
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(),
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-500 bg-gray-50">
        <Loader2 className="animate-spin mb-2 text-green-600" size={32} />
        <p className="font-medium">Syncing with database...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-2">
        <ShoppingBag className="text-green-600" /> Orders ({orders.length})
      </h1>

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl text-center border border-dashed border-gray-300">
            <p className="text-gray-400 italic font-medium">No live orders found.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="flex flex-wrap justify-between items-center mb-4 pb-3 border-b gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full text-gray-500"><User size={16} /></div>
                  <div>
                    <h2 className="font-bold text-gray-900 leading-none">{order.customerName}</h2>
                    <span className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {order._id.slice(-8)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    order.status === "Pending" ? "bg-amber-100 text-amber-700" :
                    order.status === "Payment Received" ? "bg-blue-100 text-blue-700" : 
                    order.status === "Out for Delivery" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                  }`}>
                    {order.status}
                  </span>
                  
                  <button 
                    onClick={() => deleteOrder(order._id)} 
                    disabled={deletingId === order._id}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
                    {deletingId === order._id ? (
                      <Loader2 size={18} className="animate-spin text-red-500" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl text-sm border border-gray-100">
                    <Phone size={14} className="text-green-600" />
                    <span className="font-bold text-gray-700">
                      {order.phone1} {order.phone2 && <span className="text-gray-300 mx-2">|</span>} {order.phone2}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl text-sm border border-gray-100">
                    <MapPin size={14} className="text-red-500 mt-1" />
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Deliver to {order.addressType}</span>
                      <p className="font-medium text-gray-800 leading-relaxed">{order.fullAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {order.items?.map((item, idx) => (
                      <span key={idx} className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-600 font-medium">
                        {item.name} <span className="text-green-600">x{item.quantity || 1}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-gray-900 rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Amount</span>
                    <span className="text-2xl font-black text-green-400">₹{order.totalAmount}</span>
                  </div>

                  <div className="space-y-2">
                    {order.status === "Pending" && (
                      <button 
                        onClick={() => updateStatus(order._id, "Payment Received")} 
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Accept Payment
                      </button>
                    )}
                    {order.status === "Payment Received" && (
                      <button 
                        onClick={() => updateStatus(order._id, "Out for Delivery")} 
                        className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                      >
                        <Truck size={14} /> Dispatch Order
                      </button>
                    )}
                    {order.status === "Out for Delivery" && (
                       <button 
                        onClick={() => updateStatus(order._id, "Delivered")} 
                        className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Product Delivered ?
                      </button>
                    )}
                    {order.status === "Delivered" && (
                      <div className="w-full py-3 bg-green-500/10 rounded-xl text-[10px] font-black text-center text-green-400 border border-green-500/20 uppercase tracking-widest flex items-center justify-center gap-2">
                        <CheckCircle2 size={14} /> Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}