"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Mic2, Upload, Settings, LogOut, Users, CreditCard, Shield } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { StaffOrgSwitcher } from "@/components/layout/StaffOrgSwitcher";
import { clsx } from "clsx";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, currentOrg, logout } = useAuthStore();
  const { canEdit, canManage, isStaff } = useRole();

  const handleLogout = () => { logout(); router.push("/auth/login"); };

  const nav = [
    { href: "/dashboard",                  label: "Dashboard", icon: LayoutDashboard, show: true,                             exact: true  },
    { href: "/dashboard/podcasts",         label: "Podcasts",  icon: Mic2,            show: true,                             exact: false },
    { href: "/dashboard/upload",           label: "Upload",    icon: Upload,          show: canEdit,                          exact: false },
    { href: "/dashboard/settings",         label: "Settings",  icon: Settings,        show: true,                             exact: true  },
    { href: "/dashboard/settings/members", label: "Members",   icon: Users,           show: canManage,                        exact: false },
    { href: "/dashboard/settings/billing", label: "Billing",   icon: CreditCard,      show: currentOrg?.role === "owner",     exact: false },
    { href: "/dashboard/admin",            label: "Admin",     icon: Shield,          show: isStaff,                          exact: false },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        "w-56 shrink-0 bg-ink-950 border-r border-ink-800 flex flex-col min-h-screen",
        // Mobile: fixed drawer that slides in/out
        "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out",
        // Desktop: static, always visible
        "md:static md:translate-x-0 md:z-auto md:transition-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-5 py-6 border-b border-ink-800 engraving-bg">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 flex items-center justify-center overflow-hidden">
              <Logo size={28} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent">Freedom</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink-400">Podcasting</p>
            </div>
          </div>
        </div>

        {currentOrg && (
          <div className="px-5 py-3 border-b border-ink-800">
            <p className="text-[9px] uppercase tracking-widest text-ink-600 font-bold">
              {isStaff ? (
                <span className="text-purple-400">Staff — Client Org</span>
              ) : (
                "Organization"
              )}
            </p>
            <p className="text-xs text-ink-300 font-bold truncate">{currentOrg.name}</p>
          </div>
        )}

        {isStaff && <StaffOrgSwitcher />}

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.filter(n => n.show).map(({ href, label, icon: Icon, exact }) => {
            const active = pathname === href || (!exact && pathname.startsWith(href + "/"));
            return (
              <Link key={href} href={href} onClick={onClose} className={clsx(
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
    </>
  );
}
