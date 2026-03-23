import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bell, CheckCheck, X, Trash2 } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import {BASE_URL} from "../constent"

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/products/notifications/${user._id || user.id}`);
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async () => {
    if (!user) return;
    try {
      await axios.put(`${BASE_URL}/api/products/notifications/${user._id || user.id}/read`);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    if (!user) return;
    
    setNotifications(notifications.filter(n => n._id !== notificationId));

    try {
      await axios.delete(`${BASE_URL}/api/products/notifications/${user._id || user.id}/${notificationId}`);
    } catch (error) {
      console.error("Failed to delete notification");
      fetchNotifications(); 
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    
    setNotifications([]);

    try {
      await axios.delete(`${BASE_URL}/api/products/notifications/${user._id || user.id}/clear`);
    } catch (error) {
      console.error("Failed to clear all notifications");
      fetchNotifications(); 
    }
  };

  const handleNotificationClick = async (notification) => {
    setIsOpen(false); 

    if (!notification.isRead) {
      setNotifications(notifications.map(n => 
        n._id === notification._id ? { ...n, isRead: true } : n
      ));

      if (user) {
        try {
          await axios.put(`${BASE_URL}/api/products/notifications/${user._id || user.id}/${notification._id}/read`);
        } catch (error) {
          console.error("Failed to mark single notification as read");
        }
      }
    }

    if (notification.productId) {
      navigate(`/product/${notification.productId}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user || user.role === "admin") return null; 

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/10 rounded-full transition-all flex items-center justify-center"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-xl">
          
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
            <h3 className="font-bold text-white">Notifications</h3>
            
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button 
                  onClick={markAsRead} 
                  className="text-[10px] font-bold text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors uppercase tracking-wider"
                >
                  <CheckCheck size={12} /> Read All
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  onClick={handleClearAll} 
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors uppercase tracking-wider"
                >
                  <Trash2 size={12} /> Clear All
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto custom-scrollbar bg-[#1e293b]/90">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-white/50 text-sm italic">No notifications yet!</p>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`group relative p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/10 flex flex-col gap-1 ${
                    n.isRead ? 'opacity-60 bg-transparent' : 'bg-green-500/10'
                  }`}
                >
                  {/* FIX: Made X button always visible on mobile, hover-only on desktop */}
                  <button 
                    onClick={(e) => handleDelete(e, n._id)}
                    className="absolute top-2 right-2 p-1 transition-opacity md:opacity-0 md:group-hover:opacity-100 text-red-400 md:text-white/30 hover:text-red-400"
                    title="Delete Notification"
                  >
                    <X size={14} />
                  </button>

                  <p className="text-sm text-white/90 leading-snug pr-6">{n.message}</p>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}