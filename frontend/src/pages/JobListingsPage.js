import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import {
  Search, MapPin, Briefcase, DollarSign, Filter, ArrowRight, Loader2, X, Plus
} from "lucide-react";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship"];
const EXP_LEVELS = ["entry", "mid", "senior"];

export default function JobListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [expLevel, setExpLevel] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (location) params.append("location", location);
      if (jobType) params.append("job_type", jobType);
      if (expLevel) params.append("experience_level", expLevel);
      params.append("page", page);
      const { data } = await api.get(`/jobs?${params.toString()}`);
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [page, jobType, expLevel]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    setExpLevel("");
    setPage(1);
    setTimeout(fetchJobs, 0);
  };

  const content = (
    <div className="space-y-6" data-testid="job-listings-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {user?.role === "recruiter" ? "Your Job Listings" : "Browse Jobs"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{total} jobs available</p>
        </div>
        {user?.role === "recruiter" && (
          <button
            onClick={() => navigate("/jobs/create")}
            data-testid="create-job-btn"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all"
          >
            <Plus className="w-4 h-4" /> Post New Job
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3" data-testid="job-search-form">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, companies..."
            data-testid="job-search-input"
            className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm"
          />
        </div>
        <div className="relative hidden md:block w-48">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            data-testid="job-location-input"
            className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm"
          />
        </div>
        <button
          type="submit"
          data-testid="job-search-submit"
          className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl px-5 py-3 font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          data-testid="toggle-filters-btn"
          className="bg-white/10 text-white border border-white/20 rounded-xl px-4 py-3 hover:bg-white/20 transition-all md:hidden"
        >
          <Filter className="w-4 h-4" />
        </button>
      </form>

      {/* Filters */}
      <div className={`flex flex-wrap gap-3 ${showFilters ? "" : "hidden md:flex"}`}>
        <select
          value={jobType}
          onChange={(e) => { setJobType(e.target.value); setPage(1); }}
          data-testid="filter-job-type"
          className="bg-slate-800/50 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-violet-500"
        >
          <option value="">All Types</option>
          {JOB_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
        <select
          value={expLevel}
          onChange={(e) => { setExpLevel(e.target.value); setPage(1); }}
          data-testid="filter-exp-level"
          className="bg-slate-800/50 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-violet-500"
        >
          <option value="">All Levels</option>
          {EXP_LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l}</option>)}
        </select>
        {(search || location || jobType || expLevel) && (
          <button onClick={clearFilters} data-testid="clear-filters-btn" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No jobs found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              data-testid={`job-card-${job.id}`}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-medium text-white group-hover:text-violet-300 transition-colors">{job.title}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{job.company}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">
                  {job.job_type}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                <span className="flex items-center gap-1 capitalize"><Briefcase className="w-3 h-3" />{job.experience_level}</span>
                {job.salary_max > 0 && (
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${(job.salary_min/1000).toFixed(0)}k - ${(job.salary_max/1000).toFixed(0)}k</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.skills_required?.slice(0, 4).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-300">{s}</span>
                ))}
                {job.skills_required?.length > 4 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-400">+{job.skills_required.length - 4}</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-xs text-slate-500">{job.applicant_count || 0} applicants</span>
                <span className="text-xs text-violet-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              data-testid={`page-${p}`}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                p === page ? "bg-violet-600 text-white" : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return user ? <DashboardLayout>{content}</DashboardLayout> : (
    <div className="min-h-screen bg-slate-900 p-6 md:p-12">{content}</div>
  );
}
