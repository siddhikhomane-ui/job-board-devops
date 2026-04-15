import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import {
  MapPin, Briefcase, DollarSign, Clock, ArrowLeft, Send, CheckCircle,
  Loader2, Users
} from "lucide-react";

function JobDetailsContent() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);
        // Check if already applied
        if (user?.role === "seeker") {
          try {
            const { data: apps } = await api.get("/applications/mine");
            if (apps.some((a) => a.job_id === id)) setApplied(true);
          } catch {}
        }
      } catch {
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user, navigate]);

  const handleApply = async () => {
    setApplying(true);
    setError("");
    try {
      await api.post("/applications", { job_id: id, cover_letter: coverLetter });
      setApplied(true);
      setShowApplyForm(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>;
  if (!job) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="job-details-page">
      <button
        onClick={() => navigate(-1)}
        data-testid="back-btn"
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">{job.title}</h1>
            <p className="text-base text-slate-300 mt-1">{job.company}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 capitalize" />{job.job_type}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 capitalize" />{job.experience_level} level</span>
              {job.salary_max > 0 && (
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" />${(job.salary_min/1000).toFixed(0)}k - ${(job.salary_max/1000).toFixed(0)}k/yr</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20 flex items-center gap-1">
              <Users className="w-3 h-3" /> {job.applicant_count || 0} applicants
            </span>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills_required?.map((skill) => {
              const userHas = user?.skills?.some((s) => s.toLowerCase() === skill.toLowerCase());
              return (
                <span
                  key={skill}
                  data-testid={`skill-tag-${skill.toLowerCase()}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    userHas
                      ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                      : "bg-slate-700/50 text-slate-300 border-slate-600"
                  }`}
                >
                  {userHas && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {skill}
                </span>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Description</h3>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Requirements</h3>
            <ul className="space-y-1.5">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Apply Section */}
        {user?.role === "seeker" && (
          <div className="border-t border-white/10 pt-6">
            {applied ? (
              <div className="flex items-center gap-2 text-emerald-400" data-testid="already-applied-msg">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">You've already applied to this job</span>
              </div>
            ) : showApplyForm ? (
              <div className="space-y-4" data-testid="apply-form">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Cover Letter (optional)</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write a brief cover letter..."
                    rows={4}
                    data-testid="cover-letter-input"
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm resize-none"
                  />
                </div>
                {error && <p className="text-sm text-rose-400">{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    data-testid="submit-application-btn"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50"
                  >
                    {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Application
                  </button>
                  <button
                    onClick={() => setShowApplyForm(false)}
                    className="text-sm text-slate-400 hover:text-white px-4 py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowApplyForm(true)}
                data-testid="apply-btn"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-6 py-3 font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300"
              >
                <Send className="w-4 h-4" /> Apply Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobDetailsPage() {
  const { user } = useAuth();
  return user ? (
    <DashboardLayout><JobDetailsContent /></DashboardLayout>
  ) : (
    <div className="min-h-screen bg-slate-900 p-6 md:p-12"><JobDetailsContent /></div>
  );
}
