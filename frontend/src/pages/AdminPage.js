import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Users, Trash2, Loader2, Shield, Briefcase, User } from "lucide-react";

const ROLE_ICONS = { admin: Shield, recruiter: Briefcase, seeker: User };
const ROLE_COLORS = {
  admin: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  recruiter: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  seeker: "text-violet-400 bg-violet-400/10 border-violet-400/20",
};

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/users").then((res) => {
      setUsers(res.data);
      setLoading(false);
    }).catch((err) => {
      setError(err.response?.data?.detail || "Failed to load users");
      setLoading(false);
    });
  }, []);

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="admin-page">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">Manage Users</h1>
          <p className="text-sm text-slate-400 mt-1">{users.length} registered users</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>
        ) : error ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">{error}</p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="users-table">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">User</th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Email</th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Role</th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Skills</th>
                    <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const RoleIcon = ROLE_ICONS[u.role] || User;
                    return (
                      <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors" data-testid={`user-row-${u._id}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600/50 to-cyan-500/50 flex items-center justify-center text-white text-sm font-bold">
                              {u.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <span className="text-sm text-white font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-400">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.seeker}`}>
                            <RoleIcon className="w-3 h-3" />
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {u.skills?.slice(0, 3).map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-400">{s}</span>
                            ))}
                            {u.skills?.length > 3 && <span className="text-xs text-slate-500">+{u.skills.length - 3}</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {u.role !== "admin" && (
                            <button
                              onClick={() => deleteUser(u._id)}
                              data-testid={`delete-user-${u._id}`}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
