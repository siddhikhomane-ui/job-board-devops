import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { FileText, CheckCircle, XCircle, Clock, Star, Loader2, ArrowRight } from "lucide-react";

const STATUS_CONFIG = {
  applied: { label: "Applied", icon: Clock, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  shortlisted: { label: "Shortlisted", icon: CheckCircle, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
  hired: { label: "Hired", icon: Star, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
};

export default function ApplicationTrackerPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/applications/mine").then((res) => {
      setApplications(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const counts = {
    all: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    hired: applications.filter((a) => a.status === "hired").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="application-tracker-page">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">Application Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">Track the status of your job applications</p>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {Object.entries({ all: "All", applied: "Applied", shortlisted: "Shortlisted", rejected: "Rejected", hired: "Hired" }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              data-testid={`filter-${key}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === key
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>

        {/* Applications */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No applications found</p>
            <Link to="/jobs" className="text-sm text-violet-400 hover:text-violet-300 mt-2 inline-block">
              Browse jobs to apply
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => {
              const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
              const StatusIcon = status.icon;
              return (
                <div
                  key={app.id}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all"
                  data-testid={`application-${app.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <Link to={`/jobs/${app.job_id}`} className="text-sm font-medium text-white hover:text-violet-300 transition-colors">
                            {app.job_title}
                          </Link>
                          <p className="text-xs text-slate-400 mt-0.5">{app.company}</p>
                          <p className="text-xs text-slate-500 mt-1">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {app.resume_score !== undefined && (
                        <div className="text-center" data-testid={`resume-score-${app.id}`}>
                          <p className="text-lg font-bold text-white">{app.resume_score}</p>
                          <p className="text-xs text-slate-500">Score</p>
                        </div>
                      )}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
