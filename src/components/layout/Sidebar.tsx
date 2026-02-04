"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, History, LogOut, Megaphone, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/current-partners", label: "Current Partners", icon: Users },
  { href: "/dashboard/referral-history", label: "Referral History", icon: History },
  { href: "/dashboard/marketing-materials", label: "Marketing Materials", icon: Megaphone },
  { href: "/dashboard/program-faq", label: "Program FAQ", icon: HelpCircle },
] as const;

const linkBase =
  "flex w-full items-center gap-3 rounded-xl px-5 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-white/[0.04] hover:text-foreground";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-border/70 bg-card/40 backdrop-blur md:flex">
      <div className="px-5 pt-5 pb-4">
        <Link
          href="/dashboard/current-partners"
          className="flex flex-col items-start transition-opacity hover:opacity-90"
        >
          <span className="text-xl font-bold tracking-tight text-white">nok</span>
          <span className="text-[10px] font-bold tracking-wide text-[#E8863A] md:text-xs">
            RECOMMERCE
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-0 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                linkBase,
                isActive && "bg-white/[0.06] text-foreground shadow-sm",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 px-0 pb-4">
        <Link href="/" className={linkBase}>
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>Sign Out</span>
        </Link>
      </div>

      <div className="px-5 py-4 text-xs text-muted-foreground">
        <div className="rounded-xl border border-border/70 bg-white/[0.02] p-3">
          <div className="font-medium text-foreground">Need help?</div>
          <div className="mt-1 leading-5">
            Visit the Program FAQ.
          </div>
        </div>
      </div>
    </aside>
  );
}
