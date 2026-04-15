import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, formatApiErrorDetail } from "@/contexts/AuthContext";
import { Briefcase, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login handleSubmit called");
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error", err);
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
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-cyan-500/20" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-outfit text-2xl font-bold text-white">CareerMatch</span>
          </Link>
          <h1 className="font-outfit text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Welcome Back
          </h1>
          <p className="text-base text-slate-300 max-w-md">
            Sign in to access your personalized dashboard, track applications, and discover AI-matched job opportunities.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-outfit text-xl font-bold text-white">CareerMatch</span>
            </Link>
          </div>

          <h2 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">Sign In</h2>
          <p className="text-sm text-slate-400 mb-8">Enter your credentials to access your account</p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-400/10 border border-rose-400/20 text-rose-400 text-sm" data-testid="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
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
                  data-testid="login-email-input"
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
                  placeholder="Enter your password"
                  required
                  data-testid="login-password-input"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full py-3 font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" data-testid="go-to-register" className="text-violet-400 hover:text-violet-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
