"use client";

import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, Target, Award, Briefcase, Zap } from "lucide-react";
import { STATUS_CONFIG } from "@/types";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  monthly: { month: string; count: number }[];
}

const PIE_COLORS = {
  APPLIED: "#6B9E78",
  SCREENING: "#92681A",
  INTERVIEWING: "#7C6FA0",
  OFFER: "#2D7A5A",
  REJECTED: "#9B3D38",
  WITHDRAWN: "#6B7280",
};

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      {children}
    </div>
  );
}

export default function StatsClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#C8DDD0] border-t-[#6B9E78] animate-spin" role="status" aria-label="Loading" />
        <p className="text-sm text-[#A8A29E]">Loading your stats...</p>
      </div>
    );
  }

  if (!stats) return null;

  const metricCards = [
    {
      label: "Total Applications",
      value: stats.total,
      suffix: "",
      icon: Briefcase,
      color: "text-[#6B9E78]",
      bg: "bg-[#F0F5F1]",
      border: "border-[#C8DDD0]",
      desc: "All time",
    },
    {
      label: "Response Rate",
      value: stats.responseRate,
      suffix: "%",
      icon: TrendingUp,
      color: "text-[#92681A]",
      bg: "bg-[#FEF9EE]",
      border: "border-[#F0DFA8]",
      desc: "Heard back",
    },
    {
      label: "Interview Rate",
      value: stats.interviewRate,
      suffix: "%",
      icon: Target,
      color: "text-[#7C6FA0]",
      bg: "bg-[#F5F3FA]",
      border: "border-[#D4CEEE]",
      desc: "Got interviews",
    },
    {
      label: "Offer Rate",
      value: stats.offerRate,
      suffix: "%",
      icon: Award,
      color: "text-[#2D7A5A]",
      bg: "bg-[#EDFAF4]",
      border: "border-[#A8DFC4]",
      desc: "Received offers",
    },
  ];

  const pieData = Object.entries(stats.byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
      value: count,
      color: PIE_COLORS[status as keyof typeof PIE_COLORS] || "#A8A29E",
    }));

  // Funnel data
  const funnelData = [
    { stage: "Applied", count: stats.total, color: "#6B9E78" },
    {
      stage: "Responded",
      count:
        (stats.byStatus.SCREENING || 0) +
        (stats.byStatus.INTERVIEWING || 0) +
        (stats.byStatus.OFFER || 0) +
        (stats.byStatus.REJECTED || 0),
      color: "#92681A",
    },
    {
      stage: "Interviewed",
      count: (stats.byStatus.INTERVIEWING || 0) + (stats.byStatus.OFFER || 0),
      color: "#7C6FA0",
    },
    { stage: "Offers", count: stats.byStatus.OFFER || 0, color: "#2D7A5A" },
  ];

  return (
    <>
      <FadeIn className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1C1917] tracking-tight">
          Stats & Insights
        </h1>
        <p className="text-[#78716C] text-sm mt-1">
          Your job search performance at a glance
        </p>
      </FadeIn>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map(
          ({ label, value, suffix, icon: Icon, color, bg, border, desc }, i) => (
            <FadeIn key={label} delay={i * 60}>
              <div
                className={`${bg} border ${border} rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-sm transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#78716C] uppercase tracking-wide">
                    {label}
                  </span>
                  <Icon size={15} className={color} />
                </div>
                <p className={`text-3xl font-semibold ${color} mb-1`}>
                  <AnimatedCounter value={value} suffix={suffix} />
                </p>
                <p className="text-xs text-[#A8A29E]">{desc}</p>
              </div>
            </FadeIn>
          )
        )}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly area chart */}
        <FadeIn delay={200}>
          <div className="bg-white rounded-xl border border-[#E8E4DF] p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-[#EEF4F0] rounded-lg flex items-center justify-center">
                <TrendingUp size={15} className="text-[#6B9E78]" />
              </div>
              <div>
                <h2 className="font-medium text-[#1C1917] text-sm">
                  Monthly Applications
                </h2>
                <p className="text-xs text-[#A8A29E]">Last 6 months</p>
              </div>
            </div>
            {stats.monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats.monthly}>
                  <defs>
                    <linearGradient id="sageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6B9E78" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#6B9E78" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F4F2" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#A8A29E" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#A8A29E" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E8E4DF",
                      fontSize: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6B9E78"
                    strokeWidth={2}
                    fill="url(#sageGrad)"
                    name="Applications"
                    dot={{ fill: "#6B9E78", r: 3 }}
                    activeDot={{ r: 5, fill: "#6B9E78" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </FadeIn>

        {/* Pie chart */}
        <FadeIn delay={280}>
          <div className="bg-white rounded-xl border border-[#E8E4DF] p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-[#EDFAF4] rounded-lg flex items-center justify-center">
                <Zap size={15} className="text-[#2D7A5A]" />
              </div>
              <div>
                <h2 className="font-medium text-[#1C1917] text-sm">
                  Status Breakdown
                </h2>
                <p className="text-xs text-[#A8A29E]">Current pipeline</p>
              </div>
            </div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E8E4DF",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: "12px", color: "#78716C" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </FadeIn>
      </div>

      {/* Funnel */}
      <FadeIn delay={360}>
        <div className="bg-white rounded-xl border border-[#E8E4DF] p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-[#EEF2FB] rounded-lg flex items-center justify-center">
              <Target size={15} className="text-[#3D5FA0]" />
            </div>
            <div>
              <h2 className="font-medium text-[#1C1917] text-sm">
                Application Funnel
              </h2>
              <p className="text-xs text-[#A8A29E]">
                How your applications progress
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {funnelData.map(({ stage, count, color }) => {
              const pct =
                funnelData[0].count > 0
                  ? (count / funnelData[0].count) * 100
                  : 0;
              return (
                <div key={stage} className="flex items-center gap-4">
                  <span className="text-sm text-[#78716C] w-24 shrink-0">
                    {stage}
                  </span>
                  <div className="flex-1 bg-[#F5F4F2] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-medium w-8 text-right"
                    style={{ color }}
                  >
                    {count}
                  </span>
                  <span className="text-xs text-[#A8A29E] w-10 text-right">
                    {Math.round(pct)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Status breakdown bars */}
      <FadeIn delay={440}>
        <div className="bg-white rounded-xl border border-[#E8E4DF] p-6">
          <h2 className="font-medium text-[#1C1917] mb-5 text-sm">
            Applications by Status
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
              const pct =
                stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-sm text-[#78716C] w-28 shrink-0">
                    {config?.label || status}
                  </span>
                  <div className="flex-1 bg-[#F5F4F2] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          PIE_COLORS[status as keyof typeof PIE_COLORS] ||
                          "#A8A29E",
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#1C1917] w-6 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </FadeIn>
    </>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-52 text-[#A8A29E] gap-2">
      <BarChartIcon className="w-10 h-10 opacity-30" />
      <p className="text-sm">No data yet — add some applications!</p>
    </div>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M3 3v18h18M7 16v-4M12 16V8M17 16v-7" />
    </svg>
  );
}
