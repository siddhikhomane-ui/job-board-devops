import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Share2, Send, CheckCircle, Clock, Loader2, Mail, User, MessageSquare } from "lucide-react";

export default function ReferralPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get("/referrals/mine").then((res) => {
      setReferrals(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    try {
      const { data } = await api.post("/referrals", {
        referred_name: name,
        referred_email: email,
        message,
      });
      setReferrals((prev) => [data, ...prev]);
      setName("");
      setEmail("");
      setMessage("");
      setShowForm(false);
      setSuccess("Referral sent successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Referral failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="referral-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">Referrals</h1>
            <p className="text-sm text-slate-400 mt-1">Refer friends and track referral status</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            data-testid="new-referral-btn"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all"
          >
            <Share2 className="w-4 h-4" /> Refer Someone
          </button>
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm flex items-center gap-2" data-testid="referral-success">
            <CheckCircle className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Referral Form */}
        {showForm && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6" data-testid="referral-form">
            <h3 className="text-sm font-medium text-white mb-4">Refer a Friend</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Friend's Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    data-testid="referral-name-input"
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Friend's Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="friend@example.com"
                    required
                    data-testid="referral-email-input"
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Message (optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    rows={3}
                    data-testid="referral-message-input"
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm resize-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                data-testid="submit-referral-btn"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Referral
              </button>
            </form>
          </div>
        )}

        {/* Referral List */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-16">
            <Share2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No referrals yet</p>
            <p className="text-sm text-slate-500 mt-1">Start referring friends to grow your network</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((ref) => (
              <div key={ref.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between" data-testid={`referral-${ref.id}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{ref.referred_name}</p>
                    <p className="text-xs text-slate-400">{ref.referred_email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  ref.status === "accepted" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                  ref.status === "rejected" ? "text-rose-400 bg-rose-400/10 border-rose-400/20" :
                  "text-amber-400 bg-amber-400/10 border-amber-400/20"
                }`}>
                  {ref.status === "pending" ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                  {ref.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
