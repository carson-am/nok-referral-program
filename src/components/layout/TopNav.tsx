"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

const TITLES: Record<string, string> = {
  "/dashboard/current-partners": "Current Partners",
  "/dashboard/referral-history": "Referral History",
  "/dashboard/marketing-materials": "Marketing Materials",
  "/dashboard/program-faq": "Program FAQ",
  "/dashboard/refer": "Refer a Partner",
};

export function TopNav() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Dashboard";

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border/70 bg-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/30 md:pl-[260px]">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-muted-foreground md:hidden">
            nok Referral Partners
          </div>
          <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="shadow-sm">
            <Link href="/dashboard/refer">
              <Plus />
              Refer a Partner
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

