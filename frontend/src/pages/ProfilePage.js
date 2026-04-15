import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { User, Mail, Briefcase, GraduationCap, FileText, Save, Loader2, X, CheckCircle } from "lucide-react";

const SKILL_OPTIONS = ["React", "JavaScript", "TypeScript", "Python", "Node.js", "CSS", "HTML", "SQL", "MongoDB", "Docker", "AWS", "Git", "Java", "C++", "Go", "Figma", "Machine Learning", "Data Analysis", "FastAPI", "Redux", "PostgreSQL", "Kubernetes", "Terraform", "Linux", "TensorFlow"];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [experience, setExperience] = useState(user?.experience || "");
  const [education, setEducation] = useState(user?.education || "");
  const [skills, setSkills] = useState(user?.skills || []);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleSkill = (skill) => {
    setSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/profile", { name, bio, experience, education, skills });
      updateUser({ ...user, ...data });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6" data-testid="profile-page">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-white">Profile</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your personal information and skills</p>
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm flex items-center gap-2" data-testid="profile-success">
            <CheckCircle className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
          {/* Avatar & Role */}
          <div className="flex items-center gap-4 pb-5 border-b border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
              {name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-lg font-medium text-white">{name || "Your Name"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">
                  {user?.role}
                </span>
                <span className="text-xs text-slate-500">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="profile-name-input"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                data-testid="profile-bio-input"
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Experience</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g., 3 years"
                    data-testid="profile-experience-input"
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Education</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g., BS Computer Science"
                    data-testid="profile-education-input"
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    {s}
                    <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => toggleSkill(s)} />
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_OPTIONS.filter((s) => !skills.includes(s)).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    data-testid={`profile-skill-${skill.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-violet-500/30 hover:text-violet-300 transition-colors"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            data-testid="save-profile-btn"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full px-6 py-3 font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
