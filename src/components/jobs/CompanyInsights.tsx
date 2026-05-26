"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Clock, Award } from "lucide-react";

interface InsightData {
  company: string;
  count: number;
  avgResponseDays: number | null;
  responseRate: number;
  offerRate: number;
  outcomes: {
    responded: number;
    offer: number;
    rejected: number;
    ghosted: number;
  };
}

interface CompanyInsightsProps {
  company: string;
}

export default function CompanyInsights({ company }: CompanyInsightsProps) {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    fetch(`/api/insights?company=${encodeURIComponent(company)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [company]);

  if (loading) return null;
  if (!data || data.count < 2) {
    // Need at least 2 data points to show meaningful insights
    return (
      <div className="bg-white rounded-xl border border-[#E8E8E4] p-5">
        <h2 className="font-semibold text-[#1C1C1E] mb-3 flex items-center gap-2 text-sm">
          <Users size={15} className="text-[#6B9E78]" />
          Community Insights
        </h2>
        <p className="text-xs text-[#9CA3AF] leading-relaxed">
          No community data yet for {company}. As more Pipelio users apply here, anonymized response time data will appear.
        </p>
      </div>
    );
  }

  const ghostRate = data.count > 0
    ? Math.round((data.outcomes.ghosted / data.count) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-[#E8E8E4] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#1C1C1E] flex items-center gap-2 text-sm">
          <Users size={15} className="text-[#6B9E78]" />
          Community Insights
        </h2>
        <span className="text-xs text-[#9CA3AF] bg-[#F5F5F1] px-2 py-0.5 rounded-full">
          {data.count} applicant{data.count !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {data.avgResponseDays !== null && (
          <div className="bg-[#F5F5F1] rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={12} className="text-[#6B7280]" />
              <span className="text-xs text-[#6B7280] font-medium">Avg Response</span>
            </div>
            <p className="text-lg font-bold text-[#1C1C1E]">{data.avgResponseDays}d</p>
            <p className="text-xs text-[#9CA3AF]">days to hear back</p>
          </div>
        )}

        <div className="bg-[#EEF4F0] rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} className="text-[#6B9E78]" />
            <span className="text-xs text-[#4A7C59] font-medium">Response Rate</span>
          </div>
          <p className="text-lg font-bold text-[#4A7C59]">{data.responseRate}%</p>
          <p className="text-xs text-[#6B9E78]">heard back</p>
        </div>

        {data.offerRate > 0 && (
          <div className="bg-[#EDFAF4] rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Award size={12} className="text-[#2D7A5A]" />
              <span className="text-xs text-[#2D7A5A] font-medium">Offer Rate</span>
            </div>
            <p className="text-lg font-bold text-[#2D7A5A]">{data.offerRate}%</p>
            <p className="text-xs text-[#2D7A5A]">got offers</p>
          </div>
        )}

        {ghostRate > 0 && (
          <div className="bg-[#FEF9EE] rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs">👻</span>
              <span className="text-xs text-[#92681A] font-medium">Ghost Rate</span>
            </div>
            <p className="text-lg font-bold text-[#92681A]">{ghostRate}%</p>
            <p className="text-xs text-[#92681A]">no response</p>
          </div>
        )}
      </div>

      {/* Outcome bar */}
      <div>
        <p className="text-xs text-[#9CA3AF] mb-2">Outcome breakdown</p>
        <div className="flex rounded-full overflow-hidden h-2 gap-px">
          {data.outcomes.offer > 0 && (
            <div className="bg-[#2D7A5A]" style={{ width: `${(data.outcomes.offer / data.count) * 100}%` }} title={`${data.outcomes.offer} offers`} />
          )}
          {data.outcomes.responded > 0 && (
            <div className="bg-[#6B9E78]" style={{ width: `${(data.outcomes.responded / data.count) * 100}%` }} title={`${data.outcomes.responded} responses`} />
          )}
          {data.outcomes.rejected > 0 && (
            <div className="bg-[#E8A598]" style={{ width: `${(data.outcomes.rejected / data.count) * 100}%` }} title={`${data.outcomes.rejected} rejections`} />
          )}
          {data.outcomes.ghosted > 0 && (
            <div className="bg-[#E8E8E4]" style={{ width: `${(data.outcomes.ghosted / data.count) * 100}%` }} title={`${data.outcomes.ghosted} ghosted`} />
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {[
            { label: "Offer", count: data.outcomes.offer, color: "bg-[#2D7A5A]" },
            { label: "Response", count: data.outcomes.responded, color: "bg-[#6B9E78]" },
            { label: "Rejected", count: data.outcomes.rejected, color: "bg-[#E8A598]" },
            { label: "Ghosted", count: data.outcomes.ghosted, color: "bg-[#E8E8E4]" },
          ].filter(i => i.count > 0).map(item => (
            <div key={item.label} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-xs text-[#9CA3AF]">{item.count} {item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#9CA3AF] mt-3 pt-3 border-t border-[#F0F0EC]">
        Anonymized data from Pipelio users · helps you set realistic expectations
      </p>
    </div>
  );
}
