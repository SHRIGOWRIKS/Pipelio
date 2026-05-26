"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Send, CheckCircle, Mail, MessageSquare, ArrowLeft } from "lucide-react";

const SUBJECTS = [
  "General question",
  "Bug report",
  "Feature request",
  "AI tools feedback",
  "Chrome extension issue",
  "Account / data issue",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1C1C1E] transition-colors mb-10">
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left — info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-[#6B9E78] rounded-xl flex items-center justify-center">
                <Briefcase size={17} className="text-white" />
              </div>
              <span className="font-bold text-[#1C1C1E] text-lg">Pipelio</span>
            </div>

            <h1 className="text-3xl font-semibold text-[#1C1C1E] mb-3 leading-tight">
              We'd love to hear from you
            </h1>
            <p className="text-[#6B7280] text-base leading-relaxed mb-8">
              Have a question, found a bug, or want to suggest a feature? Send us a message and we'll get back to you.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#EEF4F0] rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-[#6B9E78]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1C1C1E]">Email us directly</p>
                  <a href="mailto:hello@pipelio.app" className="text-sm text-[#6B9E78] hover:underline">
                    hello@pipelio.app
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#EEF4F0] rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare size={16} className="text-[#6B9E78]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1C1C1E]">Response time</p>
                  <p className="text-sm text-[#6B7280]">Usually within 24 hours</p>
                </div>
              </div>
            </div>

            {/* FAQ link */}
            <div className="mt-8 p-4 bg-white border border-[#E8E8E4] rounded-xl">
              <p className="text-sm font-medium text-[#1C1C1E] mb-1">Looking for quick answers?</p>
              <p className="text-xs text-[#6B7280] mb-3">Check our FAQ — most common questions are answered there.</p>
              <Link href="/#faq"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B9E78] hover:underline">
                View FAQ →
              </Link>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="bg-white rounded-2xl border border-[#E8E8E4] p-10 text-center shadow-sm"
                style={{ animation: "fadeUp 0.4s ease both" }}>
                <div className="w-16 h-16 bg-[#EEF4F0] rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={28} className="text-[#6B9E78]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1C1C1E] mb-2">Message sent!</h2>
                <p className="text-[#6B7280] text-sm mb-6 leading-relaxed">
                  Thanks for reaching out. We'll get back to you at <strong>{form.email}</strong> within 24 hours.
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="px-4 py-2 text-sm border border-[#E8E8E4] rounded-lg text-[#6B7280] hover:bg-[#F5F5F1] transition-colors">
                    Send another
                  </button>
                  <Link href="/"
                    className="px-4 py-2 text-sm bg-[#6B9E78] text-white rounded-lg hover:bg-[#5A8A67] transition-colors">
                    Back to home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-[#E8E8E4] p-8 shadow-sm space-y-5"
                style={{ animation: "fadeUp 0.4s ease both" }}>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                      Your name <span className="text-[#9B3D38]">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={e => set("name", e.target.value)}
                      placeholder="Shri Gowri"
                      required
                      className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6B9E78] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                      Email address <span className="text-[#9B3D38]">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => set("email", e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6B9E78] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={e => set("subject", e.target.value)}
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#6B9E78] transition-colors bg-white"
                  >
                    <option value="">Select a topic...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                    Message <span className="text-[#9B3D38]">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => set("message", e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    required
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] resize-none focus:outline-none focus:border-[#6B9E78] transition-colors"
                  />
                  <p className="text-xs text-[#9CA3AF] mt-1 text-right">{form.message.length} chars</p>
                </div>

                {error && (
                  <div className="bg-[#FDF0EF] border border-[#F5C6C3] rounded-xl px-4 py-3 text-sm text-[#9B3D38]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !form.name || !form.email || !form.message}
                  className="w-full flex items-center justify-center gap-2 bg-[#6B9E78] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#5A8A67] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {loading ? "Sending..." : "Send Message"}
                </button>

                <p className="text-xs text-[#9CA3AF] text-center">
                  We'll reply to your email within 24 hours.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
