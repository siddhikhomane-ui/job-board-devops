import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { BarChart3, Loader2, TrendingUp, FileText, CheckCircle, XCircle, Users, Briefcase } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = user?.role === "admin" ? "/analytics/admin" :
                     user?.role === "recruiter" ? "/analytics/recruiter" : "/analytics/seeker";
    api.get(endpoint).then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>
    </DashboardLayout>
  );

  const COLORS = ["#7c3aed", "#06b6d4", "#34d399", "#f87171", "#fbbf24"];

  // Seeker chart data
  const seekerPieData = user?.role === "seeker" ? [
    { name: "Applied", value: data?.applied || 0 },
    { name: "Shortlisted", value: data?.shortlisted || 0 },
    { name: "Rejected", value: data?.rejected || 0 },
    { name: "Hired", value: data?.hired || 0 },
  ].filter((d) => d.value > 0) : [];

  const seekerBarData = user?.role === "seeker" ? [
    { name: "Applied", count: data?.applied || 0 },
    { name: "Shortlisted", count: data?.shortlisted || 0 },
    { name: "Rejected", count: data?.rejected || 0 },
    { name: "Hired", count: data?.hired || 0 },
  ] : [];

  // Admin chart data
  const adminBarData = user?.role === "admin" ? [
    { name: "Seekers", count: data?.total_seekers || 0 },
    { name: "Recruiters", count: data?.total_recruiters || 0 },
    { name: "Jobs", count: data?.total_jobs || 0 },
    { name: "Applications", count: data?.total_applications || 0 },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="analytics-page">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            {user?.role === "seeker" ? "Your application analytics" : user?.role === "recruiter" ? "Recruitment analytics" : "Platform analytics"}
          </p>
        </div>

        {/* Seeker Analytics */}
        {user?.role === "seeker" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Apps", value: data?.total_applications, icon: FileText, color: "violet" },
                { label: "Shortlisted", value: data?.shortlisted, icon: CheckCircle, color: "emerald" },
                { label: "Rejected", value: data?.rejected, icon: XCircle, color: "rose" },
                { label: "Success Rate", value: `${data?.success_rate || 0}%`, icon: TrendingUp, color: "cyan" },
              ].map((s, i) => {
                const Icon = s.icon;
                const c = { violet: "text-violet-400 bg-violet-400/10", emerald: "text-emerald-400 bg-emerald-400/10", rose: "text-rose-400 bg-rose-400/10", cyan: "text-cyan-400 bg-cyan-400/10" };
                return (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className={`w-10 h-10 rounded-lg ${c[s.color]} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {seekerPieData.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-white mb-4">Application Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={seekerPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                        {seekerPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {seekerPieData.map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-slate-400">{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-white mb-4">Application Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={seekerBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Recruiter Analytics */}
        {user?.role === "recruiter" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Jobs Posted", value: data?.total_jobs, icon: Briefcase, color: "violet" },
              { label: "Active Jobs", value: data?.active_jobs, icon: CheckCircle, color: "emerald" },
              { label: "Total Applicants", value: data?.total_applicants, icon: Users, color: "cyan" },
              { label: "Shortlisted", value: data?.shortlisted, icon: TrendingUp, color: "amber" },
            ].map((s, i) => {
              const Icon = s.icon;
              const c = { violet: "text-violet-400 bg-violet-400/10", emerald: "text-emerald-400 bg-emerald-400/10", cyan: "text-cyan-400 bg-cyan-400/10", amber: "text-amber-400 bg-amber-400/10" };
              return (
                <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className={`w-10 h-10 rounded-lg ${c[s.color]} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Admin Analytics */}
        {user?.role === "admin" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Total Users", value: data?.total_users, icon: Users, color: "violet" },
                { label: "Total Jobs", value: data?.total_jobs, icon: Briefcase, color: "cyan" },
                { label: "Applications", value: data?.total_applications, icon: FileText, color: "emerald" },
              ].map((s, i) => {
                const Icon = s.icon;
                const c = { violet: "text-violet-400 bg-violet-400/10", cyan: "text-cyan-400 bg-cyan-400/10", emerald: "text-emerald-400 bg-emerald-400/10" };
                return (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className={`w-10 h-10 rounded-lg ${c[s.color]} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Platform Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={adminBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
