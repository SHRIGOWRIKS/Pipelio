"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  BarChart2,
  Download,
  ArrowRight,
  CheckCircle,
  Zap,
  Target,
  Users,
  Clock,
  TrendingUp,
  Star,
  Sparkles,
  ChevronDown,
} from "lucide-react";

// Intersection observer hook for scroll animations
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(18px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Kanban preview mockup
function KanbanPreview() {
  const columns = [
    {
      label: "Applied",
      bg: "bg-[#EEF4F0]",
      text: "text-[#4A7C59]",
      dot: "#4A7C59",
      cards: ["Frontend Engineer · Google", "Product Designer · Figma"],
    },
    {
      label: "Interviewing",
      bg: "bg-[#FEF9EE]",
      text: "text-[#92681A]",
      dot: "#92681A",
      cards: ["Full Stack Dev · Stripe"],
    },
    {
      label: "Offer",
      bg: "bg-[#EDFAF4]",
      text: "text-[#2D7A5A]",
      dot: "#2D7A5A",
      cards: ["SWE · Vercel"],
    },
  ];

  return (
    <div className="flex gap-3 overflow-hidden">
      {columns.map((col, ci) => (
        <div
          key={col.label}
          className="flex-1 min-w-0"
          style={{ animation: `fadeUp 0.5s ease ${ci * 100}ms both` }}
        >
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2 ${col.bg} ${col.text}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: col.dot }}
            />
            {col.label}
          </div>
          <div className="space-y-2">
            {col.cards.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-2.5 border border-[#E8E8E4] text-xs text-[#1C1C1E]"
                style={{
                  animation: `fadeUp 0.4s ease ${ci * 100 + i * 70 + 150}ms both`,
                }}
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const features = [
  {
    icon: Briefcase,
    title: "Kanban Board",
    desc: "Drag & drop jobs across stages. Visual pipeline so you always know where every application stands.",
    bg: "bg-[#EEF4F0]",
    iconColor: "text-[#4A7C59]",
  },
  {
    icon: BarChart2,
    title: "Analytics",
    desc: "Response rate, interview rate, offer rate. Monthly trends. Know exactly what's working.",
    bg: "bg-[#FEF9EE]",
    iconColor: "text-[#92681A]",
  },
  {
    icon: Sparkles,
    title: "AI Resume Tools",
    desc: "Analyze your resume with Gemini AI. Get skill gaps, match scores, and improvement tips.",
    bg: "bg-[#FDF0EF]",
    iconColor: "text-[#9B3D38]",
  },
  {
    icon: Users,
    title: "Contact Tracking",
    desc: "Track recruiters, hiring managers, and referrals for every application in one place.",
    bg: "bg-[#F5F5F1]",
    iconColor: "text-[#6B7280]",
  },
  {
    icon: Clock,
    title: "Timeline",
    desc: "See all events across all jobs in one chronological view. Never lose track of what happened.",
    bg: "bg-[#EEF4F0]",
    iconColor: "text-[#4A7C59]",
  },
  {
    icon: Download,
    title: "CSV Export",
    desc: "Download all your applications as CSV. Your data, always yours.",
    bg: "bg-[#FEF9EE]",
    iconColor: "text-[#92681A]",
  },
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "Software Engineer",
    text: "Landed my dream job at a FAANG company. Pipelio kept me sane during 3 months of applications.",
    stars: 5,
  },
  {
    name: "Marcus T.",
    role: "Product Designer",
    text: "Way better than a spreadsheet. The kanban view is exactly what I needed to stay organized.",
    stars: 5,
  },
  {
    name: "Priya M.",
    role: "Data Scientist",
    text: "The stats page showed me my response rate was low — I changed my resume and it jumped to 40%.",
    stars: 5,
  },
];

const steps = [
  {
    icon: Zap,
    title: "Sign in instantly",
    desc: "One click with Google. No forms, no credit card.",
  },
  {
    icon: Briefcase,
    title: "Add your applications",
    desc: "Paste the job URL or fill in details manually.",
  },
  {
    icon: TrendingUp,
    title: "Track your progress",
    desc: "Drag cards as you advance. Watch your pipeline grow.",
  },
  {
    icon: Target,
    title: "Land the offer",
    desc: "Use insights to optimize and get hired faster.",
  },
];

const faqs = [
  {
    q: "What exactly is Pipelio?",
    a: "Pipelio is a free, all-in-one job search platform. It gives you a visual kanban board to track every application, AI tools to optimize your resume and generate cover letters, Gmail integration to auto-detect interview invites and rejections, a Chrome extension to save jobs in one click, and an interview prep academy with role-specific questions and coding challenges.",
    tag: "General",
  },
  {
    q: "Is Pipelio really free? What's the catch?",
    a: "Completely free — no credit card, no hidden fees, no premium tier. We use Google's free Gemini AI tier for all AI features, which gives you generous daily limits. The only optional cost is a custom domain if you want one after deploying.",
    tag: "Pricing",
  },
  {
    q: "How does the Gmail integration work?",
    a: "Connect your Gmail with one click during sign-in. Pipelio scans your inbox for job-related emails — interview invites, rejections, offers, application confirmations — and surfaces them as suggestions on your dashboard. You decide whether to accept (auto-update the job status) or dismiss each suggestion. We only read emails, never send them.",
    tag: "Gmail",
  },
  {
    q: "How does the Chrome extension work?",
    a: "Install the Pipelio Chrome extension, connect it with your API token from Settings, and then visit any job listing on LinkedIn, Indeed, Glassdoor, Greenhouse, Lever, or Workday. Click the extension icon and the job is instantly saved to your pipeline — no copy-pasting. It also detects application forms and autofills them with your profile data.",
    tag: "Extension",
  },
  {
    q: "What AI features does Pipelio include?",
    a: "Five AI tools powered by Google Gemini: Resume Analyzer (upload PDF/DOCX to get a summary, skills, and improvement tips), Job Match (compare your resume to a job description for a match score), Cover Letter Generator (tailored letters in your tone), Interview Prep (predicted questions with answers), and JD Decoder (decode any job description to find hidden requirements, red flags, and keywords to use).",
    tag: "AI Tools",
  },
  {
    q: "What is the Interview Prep feature?",
    a: "A role-specific prep academy covering 26 roles from React Developer to LLM Engineer to Product Manager. Pick your role and experience level (Fresher/Mid/Senior) and get a personalized study roadmap, 10 interview questions with answers, 6 coding problems with a live code editor, system design questions, and behavioral questions with STAR framework templates.",
    tag: "Prep",
  },
  {
    q: "Can I export my data?",
    a: "Yes. Click 'Export CSV' on your dashboard to download all your job applications as a spreadsheet at any time. Your data is always yours.",
    tag: "Data",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes, Pipelio is fully responsive. The list view and stats pages work great on mobile. The kanban board is best on desktop for drag-and-drop, but you can still add and manage jobs on any screen size.",
    tag: "Mobile",
  },
];

const TAG_COLORS: Record<string, string> = {
  General:   "bg-[#EEF4F0] text-[#4A7C59]",
  Pricing:   "bg-[#EEF4F0] text-[#4A7C59]",
  Gmail:     "bg-[#FEF9EE] text-[#92681A]",
  Extension: "bg-[#FEF9EE] text-[#92681A]",
  "AI Tools":"bg-[#FDF0EF] text-[#9B3D38]",
  Prep:      "bg-[#F3F0FA] text-[#5B4B8A]",
  Data:      "bg-[#F5F5F1] text-[#6B7280]",
  Mobile:    "bg-[#F5F5F1] text-[#6B7280]",
};

function FAQItem({ q, a, tag, index }: { q: string; a: string; tag: string; index: number }) {
  const [open, setOpen] = useState(false);
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      className="border-b border-[#E8E8E4] last:border-0"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(12px)",
        transition: `opacity 0.45s ease ${index * 60}ms, transform 0.45s ease ${index * 60}ms`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${TAG_COLORS[tag] || TAG_COLORS.General}`}>
            {tag}
          </span>
          <span className={`font-medium text-sm leading-relaxed transition-colors ${open ? "text-[#6B9E78]" : "text-[#1C1C1E] group-hover:text-[#6B9E78]"}`}>
            {q}
          </span>
        </div>
        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 mt-0.5 ${open ? "bg-[#6B9E78] text-white rotate-180" : "bg-[#F5F5F1] text-[#6B7280]"}`}>
          <ChevronDown size={13} />
        </div>
      </button>
      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className="overflow-hidden transition-all duration-400 ease-in-out"
        style={{ maxHeight: open ? "300px" : "0px", opacity: open ? 1 : 0, transition: "max-height 0.4s ease, opacity 0.3s ease" }}
      >
        <p className="text-sm text-[#6B7280] pb-5 leading-relaxed pl-0 sm:pl-16">{a}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] overflow-x-hidden">
      {/* Sticky Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white border-b border-[#E8E8E4] shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6B9E78] rounded-lg flex items-center justify-center">
              <Briefcase size={15} className="text-white" />
            </div>
            <span className="font-bold text-[#1C1C1E] text-lg tracking-tight">
              Pipelio
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#6B7280] hover:text-[#1C1C1E] font-medium transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="bg-[#6B9E78] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5A8A67] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div
              className="inline-flex items-center gap-2 bg-[#EEF4F0] text-[#4A7C59] px-3 py-1.5 rounded-full text-sm font-medium mb-8"
              style={{ animation: "fadeUp 0.5s ease 0ms both" }}
            >
              Free forever · No credit card needed
            </div>

            <h1
              className="text-5xl sm:text-6xl font-semibold text-[#1C1C1E] leading-[1.1] mb-6 tracking-tight"
              style={{ animation: "fadeUp 0.5s ease 80ms both" }}
            >
              Your job search,{" "}
              <span className="text-[#6B9E78]">organized.</span>
            </h1>

            <p
              className="text-lg text-[#6B7280] max-w-xl mx-auto mb-10 leading-relaxed"
              style={{ animation: "fadeUp 0.5s ease 160ms both" }}
            >
              Add applications, track progress, land the job. Simple as that.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 justify-center mb-14"
              style={{ animation: "fadeUp 0.5s ease 240ms both" }}
            >
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 bg-[#6B9E78] text-white px-7 py-3.5 rounded-lg text-base font-medium hover:bg-[#5A8A67] transition-colors"
              >
                Start tracking free
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white border border-[#E8E8E4] text-[#6B7280] px-7 py-3.5 rounded-lg text-base font-medium hover:bg-[#FAFAF8] transition-colors"
              >
                See features
              </a>
            </div>

            <div
              className="flex items-center justify-center gap-6 text-sm text-[#6B7280]"
              style={{ animation: "fadeUp 0.5s ease 320ms both" }}
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#6B9E78]" />
                No spreadsheets
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#6B9E78]" />
                100% free
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#6B9E78]" />
                Sign in with Google
              </span>
            </div>
          </div>

          {/* Kanban preview mockup */}
          <div
            className="mt-16 max-w-2xl mx-auto"
            style={{ animation: "fadeUp 0.6s ease 400ms both" }}
          >
            <div className="bg-white rounded-xl border border-[#E8E8E4] shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EEC4C0]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F0DFA8]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#C8DDD0]" />
                <div className="flex-1 bg-[#F5F5F1] rounded h-4 ml-2" />
              </div>
              <KanbanPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <FadeIn>
        <section className="bg-[#6B9E78] py-10">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: "10k+", label: "Job seekers" },
              { value: "250k+", label: "Applications tracked" },
              { value: "4.9★", label: "User rating" },
              { value: "100%", label: "Free forever" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-semibold">{value}</p>
                <p className="text-white/70 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Features — 2x3 grid */}
      <section id="features" className="py-24 px-6 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block bg-[#EEF4F0] text-[#4A7C59] text-sm font-medium px-3 py-1 rounded-full mb-4">
              Features
            </span>
            <h2 className="text-3xl font-semibold text-[#1C1C1E] mb-3">
              Everything you need to stay organized
            </h2>
            <p className="text-[#6B7280] text-base max-w-xl mx-auto">
              Built by job seekers, for job seekers. Every feature you actually need.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, bg, iconColor }, i) => (
              <FadeIn key={title} delay={i * 60}>
                <div className="bg-white rounded-xl p-6 border border-[#E8E8E4] hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 h-full">
                  <div
                    className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <Icon size={20} className={iconColor} />
                  </div>
                  <h3 className="font-medium text-[#1C1C1E] mb-2">{title}</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block bg-[#EEF4F0] text-[#4A7C59] text-sm font-medium px-3 py-1 rounded-full mb-4">
              How it works
            </span>
            <h2 className="text-3xl font-semibold text-[#1C1C1E]">
              Up and running in 30 seconds
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 80}>
                <div className="text-center">
                  <div className="w-14 h-14 bg-[#EEF4F0] rounded-xl flex items-center justify-center mx-auto mb-4 relative">
                    <Icon size={22} className="text-[#6B9E78]" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#6B9E78] text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-medium text-[#1C1C1E] mb-1.5">{title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-[#F5F5F1]">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block bg-[#FEF9EE] text-[#92681A] text-sm font-medium px-3 py-1 rounded-full mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl font-semibold text-[#1C1C1E]">
              Loved by job seekers
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, text, stars }, i) => (
              <FadeIn key={name} delay={i * 80}>
                <div className="bg-white rounded-xl p-6 border border-[#E8E8E4] hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: stars }).map((_, j) => (
                      <Star
                        key={j}
                        size={13}
                        className="text-[#92681A] fill-[#92681A]"
                      />
                    ))}
                  </div>
                  <p className="text-[#6B7280] text-sm leading-relaxed mb-4">
                    &ldquo;{text}&rdquo;
                  </p>
                  <div>
                    <p className="font-medium text-[#1C1C1E] text-sm">{name}</p>
                    <p className="text-[#6B7280] text-xs">{role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-[#FAFAF8]">
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block bg-[#EEF4F0] text-[#4A7C59] text-sm font-medium px-3 py-1 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-3xl font-semibold text-[#1C1C1E] mb-3">
              Everything you need to know
            </h2>
            <p className="text-[#6B7280] text-base max-w-xl mx-auto">
              Got more questions? <Link href="/contact" className="text-[#6B9E78] hover:underline font-medium">Reach out to us →</Link>
            </p>
          </FadeIn>

          <div className="bg-white rounded-2xl border border-[#E8E8E4] shadow-sm px-6 divide-y-0">
            {faqs.map((faq, i) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} tag={faq.tag} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#1C1C1E]">
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4 leading-tight">
              Ready to organize your job search?
            </h2>
            <p className="text-[#6B7280] mb-8 text-base">
              Join thousands of job seekers who use Pipelio to stay on top of
              their applications and land offers faster.
            </p>
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 bg-[#6B9E78] text-white px-8 py-3.5 rounded-lg text-base font-medium hover:bg-[#5A8A67] transition-colors"
            >
              Get started — it&apos;s free
              <ArrowRight
                size={18}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </FadeIn>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
