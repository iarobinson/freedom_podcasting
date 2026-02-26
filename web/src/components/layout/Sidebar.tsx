"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mic2, LayoutDashboard, Radio, Upload, Sparkles, BarChart3, Users, Settings, LogOut, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/lib/store";

const nav = [
  { label: "Dashboard",  href: "/dashboard",           icon: LayoutDashboard, exact: true },
  { label: "Podcasts",   href: "/dashboard/podcasts",  icon: Radio },
  { label: "Upload",     href: "/dashboard/upload",    icon: Upload },
  { label: "AI Tools",   href: "/dashboard/ai",        icon: Sparkles, soon: true },
  { label: "Analytics",  href: "/dashboard/analytics", icon: BarChart3, soon: true },
  { label: "Team",       href: "/dashboard/team",      icon: Users, soon: true },
  { label: "Settings",   href: "/dashboard/settings",  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { currentOrg, user, logout } = useAuthStore();

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <aside className="flex h-full w-60 flex-col border-r border-white/6 bg-ink-950/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/6 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 shadow-lg shadow-brand-500/30">
          <Mic2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-[13px] font-semibold tracking-tight text-ink-100 leading-none">FreedomPodcasting</p>
          <p className="text-[10px] text-ink-600 mt-0.5">Studio</p>
        </div>
      </div>

      {/* Org */}
      {currentOrg && (
        <div className="border-b border-white/6 p-2.5">
          <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-white/5 transition-colors">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/20 text-brand-400 text-[11px] font-bold shrink-0">
              {currentOrg.name[0].toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[12px] font-medium text-ink-200 truncate">{currentOrg.name}</p>
              <p className="text-[10px] text-ink-600 capitalize">{currentOrg.plan}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-ink-600 shrink-0" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2.5 scrollbar-thin">
        <ul className="space-y-0.5">
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.soon ? "#" : item.href}
                className={clsx(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  isActive(item.href, item.exact)
                    ? "bg-brand-500/15 text-brand-300"
                    : item.soon
                    ? "text-ink-700 cursor-default"
                    : "text-ink-500 hover:bg-white/5 hover:text-ink-200"
                )}>
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.soon && <span className="text-[10px] text-ink-700 bg-white/5 px-1.5 py-0.5 rounded-full">Soon</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-white/6 p-2.5">
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 text-[11px] font-bold shrink-0">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-ink-200 truncate">{user.full_name}</p>
              <p className="text-[10px] text-ink-600 truncate">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="text-ink-600 hover:text-ink-300 transition-colors p-1 rounded">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
