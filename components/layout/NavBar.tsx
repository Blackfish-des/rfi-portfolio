"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  LayoutDashboard,
  Network,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/skills", label: "Skills", icon: Network },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
];

export default function NavBar({ studentName }: { studentName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="h-full flex flex-col bg-white border-r border-gray-200 w-56 shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#E3001B]" />
          <span className="text-sm font-semibold text-[#000054] tracking-tight">
            RFI Portfolio
          </span>
        </div>
      </div>

      {/* Domain colour strip */}
      <div className="flex h-1">
        {["#065F46","#1D4ED8","#7C3AED","#B45309","#000054","#9F1239","#0369A1","#374151"].map((c) => (
          <div key={c} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[#000054] text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-gray-100 pt-3">
        <div className="px-3 py-1.5">
          <p className="text-xs font-medium text-gray-900 truncate">{studentName}</p>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Settings size={15} />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors text-left"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </nav>
  );
}
