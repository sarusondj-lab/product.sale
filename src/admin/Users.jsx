import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users as UsersIcon,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { BASE_URL } from "../constent";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Fetch Users on Load
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users`);
      setUsers(res.data);
    } catch (err) {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2️⃣ Toggle User Status (Activate/Deactivate)
  const toggleUserStatus = async (id, currentIsActive) => {
    const actionLabel = currentIsActive ? "deactivating" : "activating";

    toast.promise(axios.put(`${BASE_URL}/api/users/toggle/${id}`), {
      loading: `System is ${actionLabel} account...`,
      success: (res) => {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id ? { ...u, isActive: res.data.isActive } : u
          )
        );
        return res.data.message;
      },
      error: (err) => err.response?.data?.message || "Failed to update status",
    });
  };

  // 3️⃣ Delete User
  const deleteUser = async (id) => {
    toast("Permanently delete this user?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await axios.delete(`${BASE_URL}/api/users/${id}`);
            setUsers(users.filter((u) => u._id !== id));
            toast.success("User removed successfully");
          } catch (err) {
            toast.error("Delete failed");
          }
        },
      },
    });
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black mb-8 flex items-center gap-2 text-gray-800">
          <UsersIcon className="text-green-600" /> User Directory ({users.length})
        </h1>

        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-green-600" />
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((u) => {
              const isInactiveLongTime =
                u.inactiveDays !== null && u.inactiveDays > 30;

              return (
                <div
                  key={u._id}
                  className={`bg-white p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-center shadow-sm transition-all ${
                    !u.isActive
                      ? "border-red-100 bg-red-50/30"
                      : isInactiveLongTime
                      ? "border-yellow-300 bg-yellow-50/40"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div
                      className={`p-3 rounded-full ${
                        u.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {u.isActive ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                        {u.name}
                        {!u.isActive && (
                          <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-md uppercase font-black tracking-tighter">
                            Disabled
                          </span>
                        )}
                        {isInactiveLongTime && (
                          <Clock size={14} className="text-amber-500" title="Inactive > 30 days" />
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                      <p className="text-xs text-slate-500">
                        Inactive:{" "}
                        {u.inactiveDays !== null
                          ? `${u.inactiveDays} day${u.inactiveDays > 1 ? "s" : ""}`
                          : "Never logged in"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button
                      onClick={() => toggleUserStatus(u._id, u.isActive)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                        u.isActive
                          ? "bg-white text-amber-600 border border-amber-200 hover:bg-amber-50"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}