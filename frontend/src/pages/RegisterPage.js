import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, formatApiErrorDetail } from "@/contexts/AuthContext";
import { Briefcase, Mail, Lock, User, ArrowRight, Loader2, X } from "lucide-react";

const ROLES = [
  { value: "seeker", label: "Job Seeker", desc: "Find and apply to jobs" },
  { value: "recruiter", label: "Recruiter", desc: "Post jobs and hire talent" },
];

const SKILL_OPTIONS = ["React", "JavaScript", "TypeScript", "Python", "Node.js", "CSS", "HTML", "SQL", "MongoDB", "Docker", "AWS", "Git", "Java", "C++", "Go", "Figma", "Machine Learning", "Data Analysis"];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seeker");
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleSkill = (skill) => {
    setSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("RegisterPage.handleSubmit", { name, email, role, skills });
    setError("");
    setLoading(true);
    try {
      await register(name, email, password, role, skills);
      console.log("Registration successful, redirecting to /dashboard");
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error", err);
      if (err.response?.status === 401) {
        alert("Invalid email or password");
      } else if (err.response?.status === 400) {
        alert(formatApiErrorDetail(err.response?.data?.detail) || "Bad request");
      } else {
        alert(formatApiErrorDetail(err.response?.data?.detail) || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-cyan-500/20" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-outfit text-2xl font-bold text-white">CareerMatch</span>
          </Link>
          <h1 className="font-outfit text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Join the Community
          </h1>
          <p className="text-base text-slate-300 max-w-md">
            Create your account and start your journey to finding the perfect career match with AI-powered insights.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-outfit text-xl font-bold text-white">CareerMatch</span>
            </Link>
          </div>

          <h2 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">Create Account</h2>
          <p className="text-sm text-slate-400 mb-6">Fill in your details to get started</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-400/10 border border-rose-400/20 text-rose-400 text-sm" data-testid="register-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    data-testid={`role-${r.value}`}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === r.value
                        ? "border-violet-500 bg-violet-500/10 text-white"
                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs mt-0.5 opacity-70">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  data-testid="register-name-input"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  data-testid="register-email-input"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  data-testid="register-password-input"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm"
                />
              </div>
            </div>

            {/* Skills (for seekers) */}
            {role === "seeker" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Skills <span className="text-slate-500">(select relevant ones)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      data-testid={`skill-${skill.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        skills.includes(skill)
                          ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                          : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      {skills.includes(skill) && <span className="mr-1">+</span>}
                      {skill}
                    </button>
                  ))}
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                        {s}
                        <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => toggleSkill(s)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="register-submit-button"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full py-3 font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" data-testid="go-to-login" className="text-violet-400 hover:text-violet-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
