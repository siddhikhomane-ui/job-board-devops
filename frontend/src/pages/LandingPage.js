import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Brain, Share2, BarChart3, ArrowRight, Sparkles, Target, Zap } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-900/60 border-b border-white/10" data-testid="landing-navbar">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-outfit text-xl font-bold text-white">CareerMatch</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && user !== false ? (
              <Link
                to="/dashboard"
                data-testid="go-to-dashboard"
                className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-5 py-2 text-sm font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="landing-login-btn"
                  className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  data-testid="landing-register-btn"
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-5 py-2 text-sm font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-6 md:px-12 lg:px-24 overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-medium text-violet-300 uppercase tracking-wider">AI-Powered Job Matching</span>
              </div>
              <h1 className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Find Jobs{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">
                  Smartly
                </span>
                , Not Blindly
              </h1>
              <p className="text-base leading-relaxed text-slate-300 max-w-lg">
                The intelligent job platform that matches your skills, analyzes gaps, and recommends the perfect career path. Built for the next generation of professionals.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  data-testid="hero-get-started-btn"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-6 py-3 font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/jobs"
                  data-testid="hero-browse-jobs-btn"
                  className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 rounded-full px-6 py-3 font-medium hover:bg-white/20 transition-all duration-300"
                >
                  Browse Jobs
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div><span className="text-2xl font-bold text-white">500+</span><p className="text-xs text-slate-400">Active Jobs</p></div>
                <div className="w-px h-10 bg-white/10" />
                <div><span className="text-2xl font-bold text-white">10k+</span><p className="text-xs text-slate-400">Job Seekers</p></div>
                <div className="w-px h-10 bg-white/10" />
                <div><span className="text-2xl font-bold text-white">95%</span><p className="text-xs text-slate-400">Match Rate</p></div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1762279388979-6a430989284c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG5lb24lMjBkaWdpdGFsJTIwbmV0d29yayUyMGxpbmVzfGVufDB8fHx8MTc3NjE1NjIwOHww&ixlib=rb-4.1.0&q=85"
                  alt="Career Growth"
                  className="w-full h-80 object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Skills Match Found</p>
                        <p className="text-xs text-slate-400">87% match with Senior React Developer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 md:px-12 lg:px-24" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="uppercase text-xs tracking-[0.2em] font-medium text-cyan-400">Features</span>
            <h2 className="font-outfit text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white mt-3">
              Everything You Need to Land Your Dream Job
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: "Skill Gap Analyzer", desc: "AI identifies missing skills and suggests learning paths tailored to your target role.", color: "violet" },
              { icon: Target, title: "Smart Matching", desc: "Get job recommendations based on your unique profile, skills, and career goals.", color: "cyan" },
              { icon: Share2, title: "Referral Network", desc: "Leverage your professional network with built-in referral tracking and management.", color: "emerald" },
              { icon: BarChart3, title: "Analytics Dashboard", desc: "Track applications, success rates, and career progress with visual insights.", color: "amber" },
            ].map((f, i) => {
              const Icon = f.icon;
              const colors = { violet: "text-violet-400 bg-violet-400/10", cyan: "text-cyan-400 bg-cyan-400/10", emerald: "text-emerald-400 bg-emerald-400/10", amber: "text-amber-400 bg-amber-400/10" };
              return (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-[0_8px_32px_rgba(124,58,237,0.15)]"
                  data-testid={`feature-card-${i}`}
                >
                  <div className={`w-12 h-12 rounded-xl ${colors[f.color]} flex items-center justify-center mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-outfit text-lg font-medium text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-12 lg:px-24" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
            <div className="relative">
              <h2 className="font-outfit text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-4">
                Ready to Find Your Perfect Match?
              </h2>
              <p className="text-base text-slate-300 mb-8 max-w-lg mx-auto">
                Join thousands of professionals who've found their dream jobs through our AI-powered platform.
              </p>
              <Link
                to="/register"
                data-testid="cta-get-started-btn"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-8 py-3.5 font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300"
              >
                <Zap className="w-4 h-4" />
                Start Your Journey
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center">
              <Briefcase className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-400">CareerMatch Hub</span>
          </div>
          <p className="text-xs text-slate-500">Built with AI-powered matching technology</p>
        </div>
      </footer>
    </div>
  );
}
