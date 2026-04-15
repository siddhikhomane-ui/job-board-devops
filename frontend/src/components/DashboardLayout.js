import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Briefcase, FileText, User, BarChart3, Users, Share2,
  Brain, LogOut, Menu, X, ChevronRight
} from "lucide-react";

const seekerLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/jobs", icon: Briefcase, label: "Browse Jobs" },
  { to: "/applications", icon: FileText, label: "My Applications" },
  { to: "/skills", icon: Brain, label: "Skill Analyzer" },
  { to: "/referrals", icon: Share2, label: "Referrals" },
  { to: "/profile", icon: User, label: "Profile" },
];

const recruiterLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/jobs", icon: Briefcase, label: "Job Listings" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/referrals", icon: Share2, label: "Referrals" },
  { to: "/profile", icon: User, label: "Profile" },
];

const adminLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin", icon: Users, label: "Manage Users" },
  { to: "/jobs", icon: Briefcase, label: "All Jobs" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = user?.role === "admin" ? adminLinks : user?.role === "recruiter" ? recruiterLinks : seekerLinks;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        data-testid="sidebar"
      >
        <div className="p-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-outfit text-lg font-bold text-white">CareerMatch</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-violet-600/20 to-cyan-500/10 text-white border border-violet-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                {link.label}
                {active && <ChevronRight className="w-4 h-4 ml-auto text-violet-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/60 border-b border-white/10 px-4 md:px-6 h-16 flex items-center justify-between" data-testid="top-navbar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            data-testid="mobile-menu-toggle"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Welcome back,</span>
            <span className="text-sm font-medium text-white">{user?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">
              {user?.role}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
