"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import {
  LayoutDashboard,
  BarChart2,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Clock,
  Sparkles,
  Settings,
  GraduationCap,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
  session: Session;
}

const navLinks = [
  { href: "/dashboard", label: "Board",    icon: LayoutDashboard },
  { href: "/stats",     label: "Stats",    icon: BarChart2       },
  { href: "/timeline",  label: "Timeline", icon: Clock           },
  { href: "/ai",        label: "AI Tools", icon: Sparkles        },
  { href: "/prep",      label: "Prep",     icon: GraduationCap   },
  { href: "/vault",     label: "Vault",    icon: FileText        },
];

import LogoLink from "@/components/layout/LogoLink";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const userName = session.user?.name || "User";
  const userEmail = session.user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className="bg-white border-b border-[#E8E8E4] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — smart navigation */}
          <LogoLink isLoggedIn={!!session} />

          {/* Desktop nav — pill toggle style */}
          <div className="hidden md:flex items-center gap-1 bg-[#F5F5F1] rounded-xl p-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-[#F0F5F1] text-[#6B9E78] shadow-sm"
                      : "text-[#6B7280] hover:text-[#1C1C1E] hover:bg-white/60"
                  )}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User dropdown */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#F5F5F1] transition-colors"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label={`User menu for ${userName}`}
              >
                <div className="w-7 h-7 bg-[#EEF4F0] rounded-full flex items-center justify-center text-xs font-semibold text-[#4A7C59]">
                  {userInitial}
                </div>
                <span className="text-sm text-[#1C1C1E] font-medium">
                  {userName.split(" ")[0]}
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-[#6B7280] transition-transform duration-200",
                    dropdownOpen ? "rotate-180" : ""
                  )}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-10 bg-white border border-[#E8E8E4] rounded-xl shadow-sm z-50 min-w-[200px] py-1 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-[#E8E8E4]">
                    <p className="text-sm font-medium text-[#1C1C1E]">{userName}</p>
                    <p className="text-xs text-[#6B7280] truncate">{userEmail}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[#1C1C1E] hover:bg-[#F5F5F1] transition-colors"
                  >
                    <Settings size={14} className="text-[#6B7280]" />
                    Settings & Extension
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[#9B3D38] hover:bg-[#FDF0EF] transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-[#6B7280] hover:bg-[#F5F5F1] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={cn(
          "md:hidden border-t border-[#E8E8E4] bg-white overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-[#F0F5F1] text-[#6B9E78]"
                    : "text-[#6B7280] hover:bg-[#F5F5F1]"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
          <div className="border-t border-[#E8E8E4] pt-2 mt-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-7 h-7 bg-[#EEF4F0] rounded-full flex items-center justify-center text-xs font-semibold text-[#4A7C59]">
                {userInitial}
              </div>
              <div>
                <p className="text-sm font-medium text-[#1C1C1E]">{userName}</p>
                <p className="text-xs text-[#6B7280] truncate">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#9B3D38] hover:bg-[#FDF0EF] rounded-lg w-full transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
