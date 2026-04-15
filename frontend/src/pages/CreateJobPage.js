import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Briefcase, MapPin, DollarSign, FileText, ArrowLeft, Send, Loader2, X } from "lucide-react";

const SKILL_OPTIONS = ["React", "JavaScript", "TypeScript", "Python", "Node.js", "CSS", "HTML", "SQL", "MongoDB", "Docker", "AWS", "Git", "Java", "C++", "Go", "FastAPI", "Redux", "PostgreSQL", "Kubernetes", "Terraform", "Linux", "TensorFlow", "Figma", "UI Design", "User Research", "Prototyping", "Machine Learning", "Data Analysis", "iOS", "Android", "React Native", "Statistics"];

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState([""]);
  const [skills, setSkills] = useState([]);
  const [jobType, setJobType] = useState("full-time");
  const [expLevel, setExpLevel] = useState("mid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSkill = (skill) => {
    setSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/jobs", {
        title,
        company,
        location,
        salary_min: parseInt(salaryMin) || 0,
        salary_max: parseInt(salaryMax) || 0,
        description,
        requirements: requirements.filter((r) => r.trim()),
        skills_required: skills,
        job_type: jobType,
        experience_level: expLevel,
      });
      navigate("/jobs");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6" data-testid="create-job-page">
        <button onClick={() => navigate(-1)} data-testid="back-btn" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">Post a New Job</h1>
          <p className="text-sm text-slate-400 mt-1">Fill in the details to create a new job listing</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-400/10 border border-rose-400/20 text-rose-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 space-y-5" data-testid="create-job-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Senior React Developer" required data-testid="job-title-input" className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Company</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., TechCorp" required data-testid="job-company-input" className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Remote" required data-testid="job-location-input" className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Min Salary ($)</label>
              <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="60000" data-testid="job-salary-min-input" className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Max Salary ($)</label>
              <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="120000" data-testid="job-salary-max-input" className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Type</label>
              <select value={jobType} onChange={(e) => setJobType(e.target.value)} data-testid="job-type-select" className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-violet-500 text-sm">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Experience Level</label>
              <select value={expLevel} onChange={(e) => setExpLevel(e.target.value)} data-testid="job-exp-select" className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-violet-500 text-sm">
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..." rows={5} required data-testid="job-description-input" className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Requirements</label>
            {requirements.map((req, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={req} onChange={(e) => { const n = [...requirements]; n[i] = e.target.value; setRequirements(n); }} placeholder={`Requirement ${i + 1}`} data-testid={`requirement-${i}`} className="flex-1 bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-violet-500 text-sm placeholder:text-slate-500" />
                {requirements.length > 1 && (
                  <button type="button" onClick={() => setRequirements(requirements.filter((_, j) => j !== i))} className="p-2 text-slate-400 hover:text-rose-400"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setRequirements([...requirements, ""])} className="text-sm text-violet-400 hover:text-violet-300">+ Add Requirement</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)} data-testid={`job-skill-${skill.toLowerCase().replace(/[^a-z0-9]/g, "-")}`} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${skills.includes(skill) ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"}`}>
                  {skills.includes(skill) ? "- " : "+ "}{skill}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} data-testid="submit-job-btn" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-6 py-3 font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Publish Job
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
