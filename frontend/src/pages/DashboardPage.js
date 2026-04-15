import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import {
  Briefcase, FileText, Brain, Share2, BarChart3, Users, TrendingUp,
  ArrowRight, Target, CheckCircle, XCircle, Clock, Loader2
} from "lucide-react";

function SeekerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/seeker").catch(() => ({ data: { total_applications: 0, applied: 0, shortlisted: 0, rejected: 0, hired: 0, success_rate: 0 } })),
      api.get("/jobs/recommendations/smart").catch(() => ({ data: [] })),
    ]).then(([analyticsRes, recsRes]) => {
      setAnalytics(analyticsRes.data);
      setRecommendations(recsRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>;

  const stats = [
    { label: "Total Applications", value: analytics?.total_applications || 0, icon: FileText, color: "violet" },
    { label: "Shortlisted", value: analytics?.shortlisted || 0, icon: CheckCircle, color: "emerald" },
    { label: "In Review", value: analytics?.applied || 0, icon: Clock, color: "amber" },
    { label: "Success Rate", value: `${analytics?.success_rate || 0}%`, icon: TrendingUp, color: "cyan" },
  ];

  return (
    <div className="space-y-6" data-testid="seeker-dashboard">
      <div>
        <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">Your Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Track your job search progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const colors = { violet: "text-violet-400 bg-violet-400/10", emerald: "text-emerald-400 bg-emerald-400/10", amber: "text-amber-400 bg-amber-400/10", cyan: "text-cyan-400 bg-cyan-400/10" };
          return (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
              <div className={`w-10 h-10 rounded-lg ${colors[s.color]} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: "/jobs", icon: Briefcase, label: "Browse Jobs", desc: "Find new opportunities" },
          { to: "/skills", icon: Brain, label: "Skill Analyzer", desc: "Check your skill gaps" },
          { to: "/referrals", icon: Share2, label: "Referrals", desc: "Refer or get referred" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              data-testid={`quick-action-${action.label.toLowerCase().replace(/\s/g, "-")}`}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <Icon className="w-5 h-5 text-violet-400 mb-3" />
              <p className="text-sm font-medium text-white">{action.label}</p>
              <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
              <ArrowRight className="w-4 h-4 text-slate-500 mt-3 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-outfit text-lg font-medium text-white">Recommended for You</h2>
            <Link to="/jobs" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-violet-500/30 transition-all"
                data-testid={`rec-job-${job.id}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{job.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{job.company} - {job.location}</p>
                  </div>
                  {job.match_score > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                      {job.match_score}% match
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {job.skills_required?.slice(0, 3).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-300">{s}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecruiterDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/recruiter").then((res) => {
      setAnalytics(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>;

  const stats = [
    { label: "Total Jobs Posted", value: analytics?.total_jobs || 0, icon: Briefcase, color: "violet" },
    { label: "Active Listings", value: analytics?.active_jobs || 0, icon: CheckCircle, color: "emerald" },
    { label: "Total Applicants", value: analytics?.total_applicants || 0, icon: Users, color: "cyan" },
    { label: "Shortlisted", value: analytics?.shortlisted || 0, icon: Target, color: "amber" },
  ];

  return (
    <div className="space-y-6" data-testid="recruiter-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">Recruiter Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your job postings and candidates</p>
        </div>
        <Link
          to="/jobs/create"
          data-testid="post-job-btn"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all"
        >
          Post New Job
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const colors = { violet: "text-violet-400 bg-violet-400/10", emerald: "text-emerald-400 bg-emerald-400/10", cyan: "text-cyan-400 bg-cyan-400/10", amber: "text-amber-400 bg-amber-400/10" };
          return (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5" data-testid={`recruiter-stat-${i}`}>
              <div className={`w-10 h-10 rounded-lg ${colors[s.color]} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/admin").then((res) => {
      setAnalytics(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>;

  const stats = [
    { label: "Total Users", value: analytics?.total_users || 0, icon: Users, color: "violet" },
    { label: "Job Seekers", value: analytics?.total_seekers || 0, icon: Target, color: "cyan" },
    { label: "Recruiters", value: analytics?.total_recruiters || 0, icon: Briefcase, color: "emerald" },
    { label: "Total Jobs", value: analytics?.total_jobs || 0, icon: FileText, color: "amber" },
    { label: "Applications", value: analytics?.total_applications || 0, icon: BarChart3, color: "violet" },
    { label: "Referrals", value: analytics?.total_referrals || 0, icon: Share2, color: "cyan" },
  ];

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div>
        <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const colors = { violet: "text-violet-400 bg-violet-400/10", emerald: "text-emerald-400 bg-emerald-400/10", cyan: "text-cyan-400 bg-cyan-400/10", amber: "text-amber-400 bg-amber-400/10" };
          return (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5" data-testid={`admin-stat-${i}`}>
              <div className={`w-10 h-10 rounded-lg ${colors[s.color]} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin" data-testid="manage-users-link" className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group">
          <Users className="w-5 h-5 text-violet-400 mb-3" />
          <p className="text-sm font-medium text-white">Manage Users</p>
          <p className="text-xs text-slate-400 mt-1">View and manage all platform users</p>
        </Link>
        <Link to="/jobs" data-testid="manage-jobs-link" className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group">
          <Briefcase className="w-5 h-5 text-cyan-400 mb-3" />
          <p className="text-sm font-medium text-white">Manage Jobs</p>
          <p className="text-xs text-slate-400 mt-1">View and manage all job listings</p>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <DashboardLayout>
      {user?.role === "admin" ? <AdminDashboard /> : user?.role === "recruiter" ? <RecruiterDashboard /> : <SeekerDashboard />}
    </DashboardLayout>
  );
}
