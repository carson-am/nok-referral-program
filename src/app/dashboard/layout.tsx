import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_0%,rgba(45,107,255,0.35),rgba(10,22,51,0)_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_35%)]" />

      <Sidebar />
      <TopNav />

      <main className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-24 md:pl-[260px]">
        {children}
      </main>
    </div>
  );
}

