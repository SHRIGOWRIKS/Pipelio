"use client";

import { useState } from "react";
import { PREP_ROLES, PREP_CATEGORIES, LEVELS, PrepLevel } from "@/lib/prep-roles";
import PrepDashboard from "./PrepDashboard";
import { Search, BookOpen, ChevronRight } from "lucide-react";

export default function PrepClient() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<PrepLevel | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [step, setStep] = useState<"role" | "level" | "prep">("role");

  const filteredRoles = PREP_ROLES.filter(r => {
    const matchesSearch = !search ||
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === "all" || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedRoleData = PREP_ROLES.find(r => r.id === selectedRole);

  if (step === "prep" && selectedRole && selectedLevel) {
    return (
      <PrepDashboard
        role={selectedRole}
        roleLabel={selectedRoleData?.label || ""}
        roleIcon={selectedRoleData?.icon || ""}
        level={selectedLevel}
        onBack={() => { setStep("role"); setSelectedRole(null); setSelectedLevel(null); }}
      />
    );
  }

  if (step === "level" && selectedRole) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button onClick={() => setStep("role")}
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1C1C1E] mb-6 transition-colors">
          ← Back to roles
        </button>

        {/* Selected role */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border mb-8 ${selectedRoleData?.bg} ${selectedRoleData?.border}`}>
          <span className="text-3xl">{selectedRoleData?.icon}</span>
          <div>
            <p className={`font-bold text-lg ${selectedRoleData?.color}`}>{selectedRoleData?.label}</p>
            <p className="text-sm text-[#6B7280]">{selectedRoleData?.tags.join(" · ")}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#1C1C1E] mb-2">What's your experience level?</h2>
        <p className="text-sm text-[#6B7280] mb-6">We'll tailor the questions and difficulty to match.</p>

        <div className="space-y-3">
          {LEVELS.map(lvl => (
            <button key={lvl.id} onClick={() => { setSelectedLevel(lvl.id); setStep("prep"); }}
              className="w-full flex items-center gap-4 p-5 bg-white border border-[#E8E8E4] rounded-xl hover:border-[#6B9E78] hover:bg-[#F5FAF6] transition-all group text-left">
              <span className="text-3xl">{lvl.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-[#1C1C1E] text-base">{lvl.label}</p>
                <p className="text-sm text-[#6B7280] mt-0.5">{lvl.desc}</p>
              </div>
              <ChevronRight size={18} className="text-[#9CA3AF] group-hover:text-[#6B9E78] transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#EEF4F0] rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-[#6B9E78]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">Interview Prep</h1>
            <p className="text-sm text-[#6B7280]">Role-specific preparation — questions, coding, system design & more</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search role or technology..."
          className="w-full pl-9 pr-4 py-2.5 border border-[#E8E8E4] rounded-xl text-sm bg-white text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6B9E78] transition-colors"
        />
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            activeCategory === "all"
              ? "bg-[#1C1C1E] text-white border-[#1C1C1E]"
              : "bg-white text-[#6B7280] border-[#E8E8E4] hover:border-[#C8C8C4]"
          }`}
        >
          All Roles
        </button>
        {PREP_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeCategory === cat.id
                ? "bg-[#1C1C1E] text-white border-[#1C1C1E]"
                : "bg-white text-[#6B7280] border-[#E8E8E4] hover:border-[#C8C8C4]"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Roles grid */}
      {filteredRoles.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <p className="text-lg font-medium">No roles found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRoles.map(role => (
            <button
              key={role.id}
              onClick={() => { setSelectedRole(role.id); setStep("level"); }}
              className={`flex flex-col items-start p-5 bg-white border rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all text-left group ${role.border}`}
            >
              <span className="text-3xl mb-3">{role.icon}</span>
              <p className={`font-bold text-sm ${role.color} mb-1`}>{role.label}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {role.tags.slice(0, 3).map(tag => (
                  <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${role.bg} ${role.color} opacity-80`}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-[#9CA3AF] group-hover:text-[#6B9E78] transition-colors">
                Start prep <ChevronRight size={12} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
