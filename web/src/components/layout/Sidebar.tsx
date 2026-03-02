"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Mic2, Upload, Settings, LogOut, Radio, Users } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { clsx } from "clsx";

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, currentOrg, logout } = useAuthStore();
  const { canEdit, canManage } = useRole();

  const handleLogout = () => { logout(); router.push("/auth/login"); };

  const nav = [
    { href: "/dashboard",                  label: "Dashboard", icon: LayoutDashboard, show: true,      exact: true  },
    { href: "/dashboard/podcasts",         label: "Podcasts",  icon: Mic2,            show: true,      exact: false },
    { href: "/dashboard/upload",           label: "Upload",    icon: Upload,          show: canEdit,   exact: false },
    { href: "/dashboard/settings",         label: "Settings",  icon: Settings,        show: true,      exact: true  },
    { href: "/dashboard/settings/members", label: "Members",   icon: Users,           show: canManage, exact: false },
  ];

  return (
    <aside className="w-56 shrink-0 bg-ink-950 border-r border-ink-800 flex flex-col min-h-screen">
      <div className="px-5 py-6 border-b border-ink-800 engraving-bg">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 border border-accent flex items-center justify-center">
            <Radio className="h-3.5 w-3.5 text-accent" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent">Freedom</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink-400">Podcasting</p>
          </div>
        </div>
      </div>

      {currentOrg && (
        <div className="px-5 py-3 border-b border-ink-800">
          <p className="text-[9px] uppercase tracking-widest text-ink-600 font-bold">Organization</p>
          <p className="text-xs text-ink-300 font-bold truncate">{currentOrg.name}</p>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.filter(n => n.show).map(({ href, label, icon: Icon, exact }) => {
          const active = pathname === href || (!exact && pathname.startsWith(href + "/"));
          return (
            <Link key={href} href={href} className={clsx(
              "flex items-center gap-2.5 px-2 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors border-l-2 pl-[6px]",
              active
                ? "text-accent bg-ink-800 border-accent"
                : "text-ink-500 hover:text-ink-200 hover:bg-ink-800 border-transparent"
            )}>
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-ink-800 space-y-1">
        <div className="px-2 py-1.5">
          <p className="text-[9px] uppercase tracking-widest text-ink-600 font-bold">Signed in as</p>
          <p className="text-xs text-ink-400 truncate">{user?.email}</p>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold uppercase tracking-widest text-ink-600 hover:text-accent hover:bg-ink-800 transition-colors border-l-2 border-transparent pl-[6px]">
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
