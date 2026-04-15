import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Brain, CheckCircle, XCircle, Loader2, Lightbulb, Target, ArrowRight } from "lucide-react";

export default function SkillGapPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    api.get("/jobs?limit=50").then((res) => {
      setJobs(res.data.jobs);
      setJobsLoading(false);
    }).catch(() => setJobsLoading(false));
  }, []);

  const analyzeGap = async (jobId) => {
    setLoading(true);
    setSelectedJob(jobId);
    setAnalysis(null);
    try {
      const { data } = await api.post("/skills/analyze", { job_id: jobId });
      setAnalysis(data);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="skill-gap-page">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">Skill Gap Analyzer</h1>
          <p className="text-sm text-slate-400 mt-1">Compare your skills against job requirements and get AI-powered suggestions</p>
        </div>

        {/* Your Skills */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Your Current Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user?.skills?.length > 0 ? user.skills.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
                {skill}
              </span>
            )) : (
              <p className="text-sm text-slate-500">No skills added. Update your profile to add skills.</p>
            )}
          </div>
        </div>

        {/* Job Selection */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Select a Job to Analyze</h3>
          {jobsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {jobs.slice(0, 8).map((job) => (
                <button
                  key={job.id}
                  onClick={() => analyzeGap(job.id)}
                  data-testid={`analyze-job-${job.id}`}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedJob === job.id
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <p className="text-sm font-medium text-white">{job.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{job.company} - {job.location}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.skills_required?.slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-400">{s}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {loading && (
          <div className="flex items-center justify-center py-8 gap-3">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            <span className="text-sm text-slate-400">Analyzing your skills with AI...</span>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-4" data-testid="skill-analysis-results">
            {/* Score */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Skills Match Score for "{analysis.job_title}"</h3>
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(148,163,184,0.2)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={analysis.score >= 70 ? "#34d399" : analysis.score >= 40 ? "#fbbf24" : "#f87171"}
                    strokeWidth="3"
                    strokeDasharray={`${analysis.score}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{analysis.score}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">out of 100</p>
            </div>

            {/* Matching & Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-medium text-emerald-400">Matching Skills ({analysis.matching_skills.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.matching_skills.length > 0 ? analysis.matching_skills.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">{s}</span>
                  )) : <p className="text-xs text-slate-500">No matching skills found</p>}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-medium text-rose-400">Missing Skills ({analysis.missing_skills.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_skills.length > 0 ? analysis.missing_skills.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-rose-400/10 text-rose-400 border border-rose-400/20">{s}</span>
                  )) : <p className="text-xs text-emerald-400">You have all required skills!</p>}
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {analysis.suggestions?.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-medium text-white">AI-Powered Learning Suggestions</h3>
                </div>
                <div className="space-y-3">
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50" data-testid={`suggestion-${i}`}>
                      <Target className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{s.skill}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
