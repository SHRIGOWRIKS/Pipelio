"use client";

import { signIn } from "next-auth/react";
import { Briefcase, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function LoginClient() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const perks = [
    "Free kanban board",
    "Stats & analytics",
    "AI resume tools",
    "CSV export",
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div
        className="bg-white rounded-2xl border border-[#E8E8E4] shadow-sm p-8 w-full max-w-md"
        style={{ animation: "fadeIn 0.35s ease both" }}
      >
        {/* Logo — floats gently */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 bg-[#6B9E78] rounded-xl flex items-center justify-center mb-4"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            <Briefcase size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1C1C1E] tracking-tight">
            Welcome to Pipelio
          </h1>
          <p className="text-[#6B7280] text-sm mt-2 text-center">
            Your job pipeline, organized.
          </p>
        </div>

        {/* Perks with sage green checkmarks */}
        <div className="grid grid-cols-2 gap-2.5 mb-7">
          {perks.map((perk) => (
            <div
              key={perk}
              className="flex items-center gap-2 text-xs text-[#6B7280]"
            >
              <CheckCircle size={13} className="text-[#6B9E78] shrink-0" />
              {perk}
            </div>
          ))}
        </div>

        {/* Google sign in — white bg, border, hover shadow */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-[#E8E8E4] text-[#1C1C1E] hover:bg-[#FAFAF8] hover:shadow-sm py-3 px-4 rounded-xl font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#E8E8E4] border-t-[#6B9E78] animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <p className="text-xs text-[#6B7280] text-center mt-5">
          By signing in, you agree to our{" "}
          <a href="/terms" className="text-[#6B9E78] hover:underline">
            Terms
          </a>{" "}
          &{" "}
          <a href="/privacy" className="text-[#6B9E78] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
