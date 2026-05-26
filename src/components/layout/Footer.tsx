import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1C1C1E] text-[#6B7280] py-10 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-7 h-7 bg-[#6B9E78] rounded-lg flex items-center justify-center group-hover:opacity-90 transition-opacity">
                <Briefcase size={13} className="text-white" />
              </div>
              <span className="font-bold text-white">Pipelio</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your job search, organized.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-white text-sm font-medium mb-3">Product</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/stats"     className="hover:text-white transition-colors">Stats</Link></li>
              <li><Link href="/timeline"  className="hover:text-white transition-colors">Timeline</Link></li>
              <li><Link href="/ai"        className="hover:text-white transition-colors">AI Tools</Link></li>
              <li><Link href="/prep"      className="hover:text-white transition-colors">Interview Prep</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-white text-sm font-medium mb-3">Company</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/"        className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms"   className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-white text-sm font-medium mb-3">Support</p>
            <ul className="space-y-2 text-sm">
              <li><a href="/#faq"                    className="hover:text-white transition-colors">FAQ</a></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/settings"             className="hover:text-white transition-colors">Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-sm text-center">
          © {new Date().getFullYear()} Pipelio. Free forever. Built with ❤️
        </div>
      </div>
    </footer>
  );
}
