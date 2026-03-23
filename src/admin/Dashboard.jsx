import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users, ShoppingBag, ClipboardList, TrendingUp,
  Loader2, IndianRupee, Clock, ArrowRight, PlusCircle, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { BASE_URL } from "../constent";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, prodRes, orderRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/users`),
          axios.get(`${BASE_URL}/api/products`),
          axios.get(`${BASE_URL}/api/orders`)
        ]);

        const orders = orderRes.data || [];
        const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || order.amount || 0), 0);
        const recent = [...orders].reverse().slice(0, 5);

        const revenueByDate = {};
        orders.forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          revenueByDate[date] = (revenueByDate[date] || 0) + (order.totalAmount || order.totalPrice || order.amount || 0);
        });

        const formattedChartData = Object.keys(revenueByDate).map(date => ({
          name: date,
          Revenue: revenueByDate[date]
        })).slice(-7);

        setStats({
          totalUsers: userRes.data?.length || 0,
          totalProducts: prodRes.data?.length || 0,
          totalOrders: orders.length,
          totalRevenue: revenue,
          recentOrders: recent,
          chartData: formattedChartData
        });
      } catch (err) {
        console.error("❌ Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  const cards = [
    { name: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: <IndianRupee size={24} />, color: "bg-emerald-600" },
    { name: "Total Orders", value: stats.totalOrders, icon: <ClipboardList size={24} />, color: "bg-amber-600" },
    { name: "Total Products", value: stats.totalProducts, icon: <ShoppingBag size={24} />, color: "bg-green-600" },
    { name: "Total Users", value: stats.totalUsers, icon: <Users size={24} />, color: "bg-blue-600" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">

        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
          <h1 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-green-600" /> Admin Overview
          </h1>
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-white text-gray-700 border px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto justify-center"
          >
            <PlusCircle size={16} className="text-green-600" /> Add Product
          </button>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {cards.map((card) => (
            <div key={card.name} className="bg-white p-4 lg:p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all overflow-hidden min-w-0">
              <div className={`${card.color} p-3 lg:p-4 rounded-2xl text-white shadow-lg shrink-0`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{card.name}</p>
                <p className="text-lg md:text-xl lg:text-2xl font-black text-gray-900 truncate">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- CHART & ACTIONS GRID --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
          
          {/* REVENUE TREND CHART */}
          <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm xl:col-span-2 overflow-hidden min-w-0">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
              <BarChart3 size={20} className="text-blue-500" /> Sales Momentum
            </h2>

            <div style={{ width: '100%', height: '300px', position: 'relative' }}>
              {!loading && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.chartData}
                    // Adjusted margin so the Y-axis text isn't cut off
                    margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      dy={10}
                    />
                    <YAxis
                      width={80} // Added width to make room for large numbers (like 1,00,000)
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} // Proper Indian formatting
                      dx={0}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Line
                      type="monotone"
                      dataKey="Revenue"
                      stroke="#10b981"
                      strokeWidth={4}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                  <BarChart3 size={40} className="opacity-20" />
                  <p className="text-sm font-medium text-center px-4">Waiting for data to stabilize...</p>
                </div>
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
            <button onClick={() => navigate('/admin/orders')} className="p-4 border rounded-2xl hover:bg-gray-50 flex items-center justify-between transition-colors text-left group">
              <div className="min-w-0 flex-1 pr-2">
                <p className="font-bold text-gray-800 group-hover:text-green-600 transition-colors truncate">Fulfill Orders</p>
                <p className="text-xs text-gray-500 truncate">Update pending shipments</p>
              </div>
              <ArrowRight size={18} className="text-gray-400 group-hover:text-green-600 shrink-0" />
            </button>
            <button onClick={() => navigate('/admin/users')} className="p-4 border rounded-2xl hover:bg-gray-50 flex items-center justify-between transition-colors text-left group">
              <div className="min-w-0 flex-1 pr-2">
                <p className="font-bold text-gray-800 group-hover:text-green-600 transition-colors truncate">Manage Customers</p>
                <p className="text-xs text-gray-500 truncate">View user accounts</p>
              </div>
              <ArrowRight size={18} className="text-gray-400 group-hover:text-green-600 shrink-0" />
            </button>
          </div>
        </div>

        {/* --- RECENT ORDERS TABLE --- */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-50 flex justify-between items-center bg-white">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock size={20} className="text-amber-500" /> Recent Orders
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400">
                  <th className="p-4 font-bold">Order ID</th>
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400 font-medium italic">No recent orders found.</td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono text-xs text-gray-500">#{order._id.slice(-6)}</td>
                      <td className="p-4 font-bold text-gray-800 truncate max-w-[150px]">{order.customerName || order.userId?.name || 'Guest User'}</td>
                      <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 font-black text-gray-900 whitespace-nowrap">₹{(order.totalAmount || order.totalPrice || order.amount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}