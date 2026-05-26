"use client";

import { useEffect, useState } from "react";
import {
  Settings, Key, Copy, RefreshCw, CheckCircle,
  Globe, ExternalLink, User, Pencil, Save, X,
} from "lucide-react";
import Image from "next/image";

interface SettingsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface Profile {
  currentRole?: string | null;
  yearsExp?: string | null;
  targetRoles?: string | null;
  targetCompanies?: string | null;
  skills?: string | null;
  jobSearchStatus?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  // Autofill fields
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  pronouns?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  actively: "🔥 Actively looking",
  open: "👀 Open to opportunities",
  exploring: "🌱 Just exploring",
  employed: "✅ Employed, not looking",
};

export default function SettingsClient({ user }: SettingsClientProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Profile>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    fetch("/api/token")
      .then((r) => r.json())
      .then((d) => setToken(d.token))
      .finally(() => setLoading(false));

    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d); setProfileForm(d); });
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      setProfile(data);
      setEditingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  };

  const field = (label: string, key: keyof Profile, placeholder: string) => (
    <div>
      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <input
        value={profileForm[key] || ""}
        onChange={e => setProfileForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-[#E8E8E4] rounded-lg px-3 py-2 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] outline-none focus:border-[#6B9E78] transition-colors"
      />
    </div>
  );

  const generateToken = async () => {
    if (!confirm("Generate a new token? Your existing token will stop working.")) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/token", { method: "POST" });
      const data = await res.json();
      setToken(data.token);
      setShowToken(true);
    } finally {
      setGenerating(false);
    }
  };

  const copyToken = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedToken = token
    ? token.slice(0, 8) + "••••••••••••••••••••••••" + token.slice(-4)
    : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-[#F5F5F1] rounded-lg flex items-center justify-center">
            <Settings size={18} className="text-[#6B7280]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1C1C1E] tracking-tight">
            Settings
          </h1>
        </div>
        <p className="text-[#6B7280] text-sm ml-12">
          Manage your account and Chrome extension
        </p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-[#E8E8E4] p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#1C1C1E] flex items-center gap-2">
            <User size={15} className="text-[#6B7280]" />
            Profile
          </h2>
          {!editingProfile ? (
            <button onClick={() => setEditingProfile(true)}
              className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1C1C1E] border border-[#E8E8E4] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F1] transition-colors">
              <Pencil size={12} />Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setEditingProfile(false); setProfileForm(profile || {}); }}
                className="flex items-center gap-1.5 text-xs text-[#6B7280] border border-[#E8E8E4] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F1] transition-colors">
                <X size={12} />Cancel
              </button>
              <button onClick={saveProfile} disabled={savingProfile}
                className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                style={{ background: "#6B9E78" }}>
                {savingProfile ? "Saving..." : profileSaved ? <><CheckCircle size={12} />Saved!</> : <><Save size={12} />Save</>}
              </button>
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#F0F0EC]">
          {user.image ? (
            <Image src={user.image} alt={user.name || "User"} width={48} height={48} className="rounded-full" />
          ) : (
            <div className="w-12 h-12 bg-[#EEF4F0] rounded-full flex items-center justify-center text-lg font-bold text-[#4A7C59]">
              {user.name?.[0] || "U"}
            </div>
          )}
          <div>
            <p className="font-semibold text-[#1C1C1E]">{user.name}</p>
            <p className="text-sm text-[#6B7280]">{user.email}</p>
          </div>
        </div>

        {!editingProfile ? (
          /* View mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Status",           value: profile?.jobSearchStatus ? STATUS_LABELS[profile.jobSearchStatus] : null },
              { label: "Current Role",     value: profile?.currentRole },
              { label: "Experience",       value: profile?.yearsExp },
              { label: "Location",         value: profile?.location },
              { label: "Target Roles",     value: profile?.targetRoles },
              { label: "Target Companies", value: profile?.targetCompanies },
              { label: "Skills",           value: profile?.skills },
              { label: "LinkedIn",         value: profile?.linkedinUrl },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">{label}</p>
                {value ? (
                  label === "LinkedIn" ? (
                    <a href={value} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-[#6B9E78] hover:underline flex items-center gap-1">
                      {value} <ExternalLink size={11} />
                    </a>
                  ) : (
                    <p className="text-sm text-[#1C1C1E]">{value}</p>
                  )
                ) : (
                  <p className="text-sm text-[#9CA3AF] italic">Not set</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Edit mode */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                Job Search Status
              </label>
              <select value={profileForm.jobSearchStatus || ""}
                onChange={e => setProfileForm(p => ({ ...p, jobSearchStatus: e.target.value }))}
                className="w-full border border-[#E8E8E4] rounded-lg px-3 py-2 text-sm text-[#1C1C1E] outline-none focus:border-[#6B9E78] transition-colors bg-white">
                <option value="">Select status...</option>
                <option value="actively">🔥 Actively looking</option>
                <option value="open">👀 Open to opportunities</option>
                <option value="exploring">🌱 Just exploring</option>
                <option value="employed">✅ Employed, not looking</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("Current Role", "currentRole", "e.g. Frontend Developer")}
              {field("Years of Experience", "yearsExp", "e.g. 3–5 years")}
              {field("Location", "location", "e.g. New York · Remote")}
              {field("LinkedIn URL", "linkedinUrl", "https://linkedin.com/in/...")}
            </div>
            {field("Target Roles", "targetRoles", "e.g. Frontend Engineer, React Developer")}
            {field("Target Companies", "targetCompanies", "e.g. Stripe, Vercel, Notion")}
            {field("Skills", "skills", "e.g. React, TypeScript, Node.js, GraphQL")}

            {/* Autofill section */}
            <div className="pt-4 border-t border-[#E8E8E4]">
              <p className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="text-base">⚡</span> Autofill Fields
                <span className="text-[#6B7280] font-normal normal-case">Used by Chrome extension to fill application forms</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field("Phone", "phone", "+1 (555) 000-0000")}
                {field("Pronouns", "pronouns", "e.g. he/him, she/her, they/them")}
                {field("Address Line 1", "addressLine1", "123 Main St")}
                {field("Address Line 2", "addressLine2", "Apt 4B")}
                {field("City", "city", "New York")}
                {field("State / Province", "state", "NY")}
                {field("Zip / Postal Code", "zipCode", "10001")}
                {field("Country", "country", "United States")}
                {field("Portfolio URL", "portfolioUrl", "https://yoursite.com")}
                {field("GitHub URL", "githubUrl", "https://github.com/username")}
              </div>
            </div>

            <p className="text-xs text-[#6B7280]">
              💡 Your profile is used to personalize AI tools and autofill job applications via the Chrome extension.
            </p>
          </div>
        )}

        {!editingProfile && !profile?.currentRole && (
          <div className="mt-4 flex items-center gap-2 bg-[#FEF9EE] border border-[#F5DFA0] rounded-lg px-4 py-3">
            <span className="text-sm text-[#92681A]">
              Complete your profile to get better AI results.
            </span>
            <button onClick={() => setEditingProfile(true)}
              className="text-xs font-semibold text-[#92681A] underline ml-auto">
              Complete now
            </button>
          </div>
        )}
      </div>

      {/* Chrome Extension Token */}
      <div className="bg-white rounded-xl border border-[#E8E8E4] p-6 mb-5">
        <h2 className="text-sm font-semibold text-[#1C1C1E] mb-1 flex items-center gap-2">
          <Key size={15} className="text-[#6B7280]" />
          Chrome Extension API Token
        </h2>
        <p className="text-xs text-[#6B7280] mb-5 leading-relaxed">
          Use this token to connect the Pipelio Chrome extension to your account.
          Keep it secret — anyone with this token can add jobs to your pipeline.
        </p>

        {loading ? (
          <div className="h-10 bg-[#F5F5F1] rounded-lg animate-pulse" />
        ) : token ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#F5F5F1] border border-[#E8E8E4] rounded-lg px-3 py-2.5 font-mono text-sm text-[#1C1C1E] overflow-hidden">
                {showToken ? token : maskedToken}
              </div>
              <button
                onClick={() => setShowToken(!showToken)}
                className="px-3 py-2.5 text-xs text-[#6B7280] border border-[#E8E8E4] rounded-lg hover:bg-[#F5F5F1] transition-colors whitespace-nowrap"
              >
                {showToken ? "Hide" : "Show"}
              </button>
              <button
                onClick={copyToken}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium bg-[#6B9E78] text-white rounded-lg hover:bg-[#5A8A67] transition-colors whitespace-nowrap"
              >
                {copied ? (
                  <><CheckCircle size={12} /> Copied!</>
                ) : (
                  <><Copy size={12} /> Copy</>
                )}
              </button>
            </div>
            <button
              onClick={generateToken}
              disabled={generating}
              className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1C1C1E] transition-colors"
            >
              <RefreshCw size={12} className={generating ? "animate-spin" : ""} />
              {generating ? "Generating..." : "Generate new token"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#6B7280]">No token generated yet.</p>
            <button
              onClick={generateToken}
              disabled={generating}
              className="flex items-center gap-2 bg-[#6B9E78] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#5A8A67] transition-colors disabled:opacity-50"
            >
              <Key size={14} />
              {generating ? "Generating..." : "Generate Token"}
            </button>
          </div>
        )}
      </div>

      {/* Extension setup guide */}
      <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
        <h2 className="text-sm font-semibold text-[#1C1C1E] mb-1 flex items-center gap-2">
          <Globe size={15} className="text-[#6B7280]" />
          How to install the Chrome Extension
        </h2>
        <p className="text-xs text-[#6B7280] mb-5">
          Save jobs from LinkedIn, Indeed, Glassdoor and more with one click.
        </p>

        <ol className="space-y-4">
          {[
            {
              step: "1",
              title: "Download the extension",
              desc: "Get the Pipelio extension from the Chrome Web Store.",
              action: (
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#6B9E78] hover:underline font-medium"
                >
                  Chrome Web Store <ExternalLink size={11} />
                </a>
              ),
            },
            {
              step: "2",
              title: "Open the extension",
              desc: "Click the Pipelio icon in your Chrome toolbar.",
            },
            {
              step: "3",
              title: "Enter your URL",
              desc: `Your Pipelio URL: ${process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.vercel.app"}`,
            },
            {
              step: "4",
              title: "Paste your token",
              desc: "Copy the token above and paste it into the extension.",
            },
            {
              step: "5",
              title: "Start saving jobs",
              desc: "Visit any job listing and click the extension to save it instantly.",
            },
          ].map(({ step, title, desc, action }) => (
            <li key={step} className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#EEF4F0] text-[#4A7C59] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {step}
              </span>
              <div>
                <p className="text-sm font-medium text-[#1C1C1E]">{title}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{desc}</p>
                {action && <div className="mt-1">{action}</div>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Danger Zone — Account Deletion */}
      <DangerZone />
    </div>
  );
}

function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "delete my account") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (res.ok) {
        // Sign out and redirect to home
        window.location.href = "/api/auth/signout?callbackUrl=/";
      }
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#F5C6C3] p-6 mt-5">
      <h2 className="text-sm font-semibold text-[#9B3D38] mb-1">
        Delete Account
      </h2>
      <p className="text-xs text-[#6B7280] mb-4 leading-relaxed">
        Permanently deletes your account and all data. This cannot be undone.
      </p>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="flex items-center gap-2 border border-[#F5C6C3] text-[#9B3D38] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#FDF0EF] transition-colors"
        >
          Delete my account
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#9B3D38] font-medium">
            Type <strong>delete my account</strong> to confirm:
          </p>
          <input
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="delete my account"
            className="w-full border border-[#F5C6C3] rounded-lg px-3 py-2 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9B3D38] transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={confirmText !== "delete my account" || deleting}
              className="flex items-center gap-2 bg-[#9B3D38] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#7A2E2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Permanently delete"}
            </button>
            <button
              onClick={() => { setConfirming(false); setConfirmText(""); }}
              className="px-4 py-2 text-sm text-[#6B7280] border border-[#E8E8E4] rounded-lg hover:bg-[#F5F5F1] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
