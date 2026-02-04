"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border/70 bg-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/30 md:pl-[260px]">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-end px-6">
        <Button asChild className="shadow-sm">
          <Link href="/dashboard/refer">
            <Plus />
            Refer a Partner
          </Link>
        </Button>
      </div>
    </header>
  );
}
