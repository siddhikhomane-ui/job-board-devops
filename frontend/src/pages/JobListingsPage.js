import React, { useState, useEffect, useCallback } from "react";
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

  // ✅ FIX: useCallback added
  const fetchJobs = useCallback(async () => {
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
  }, [search, location, jobType, expLevel, page]); // ✅ dependencies added

  // ✅ FIX: now safe
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    setExpLevel("");
    setPage(1);
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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-5 py-2.5 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Post New Job
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs..."
          className="flex-1 p-3 rounded bg-slate-800 text-white"
        />
        <button type="submit" className="bg-violet-600 px-4 rounded">
          <Search />
        </button>
      </form>

      {/* Jobs */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <p>No jobs found</p>
      ) : (
        jobs.map((job) => (
          <Link key={job.id} to={`/jobs/${job.id}`}>
            {job.title}
          </Link>
        ))
      )}
    </div>
  );

  return user ? <DashboardLayout>{content}</DashboardLayout> : content;
}