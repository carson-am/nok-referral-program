"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Clock, Download, MessageSquare, Search, Users, Zap } from "lucide-react";

import { PartnersTable } from "@/components/partners/PartnersTable";
import { PartnerDetailSheet } from "@/components/partners/PartnerDetailSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Partner, PartnerStatus } from "@/lib/mock/partners";
import { MOCK_PARTNERS } from "@/lib/mock/partners";

const REFERRAL_SUCCESS_KEY = "referralSuccess";
const STATUS_CHIP_OPTIONS: { value: "All" | PartnerStatus; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Submitted", label: "Submitted" },
  { value: "Under Review", label: "Under Review" },
  { value: "In Conversation", label: "In Conversation" },
  { value: "Active", label: "Active" },
];
const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];
const RESPONSE_RATE_MOCK = "94%";

function normalizeStatus(status: string): Partner["status"] {
  const normalized = status.trim().toLowerCase();
  if (normalized === "discovery" || normalized === "solicitation") return "Submitted";
  if (normalized === "qualification") return "Under Review";
  if (normalized === "contract negotiation") return "In Conversation";
  return "On Hold";
}

function parseExcelData(data: unknown[]): Partner[] {
  return (data as Record<string, unknown>[])
    .map((row, index: number) => {
      const brand = row["Brand"] ?? "";
      const brandTrimmed = String(brand).trim();
      if (!brandTrimmed) return null;

      const status = normalizeStatus(String(row["Status"] ?? ""));
      const dealType = row["Deal Type"] ?? "";
      const emailRaw = row["Email"] ?? "";
      const emailTrimmed = String(emailRaw).trim();
      const email = emailTrimmed || "Contact info pending";
      const estimatedCloseDate = row["Estimated Close Date"] ?? "";

      const partner: Partner = {
        id: `p_${index + 1}`,
        name: brandTrimmed,
        status,
        industry: String(dealType),
        email,
        referredBy: "—",
        lastUpdated: "—",
      };

      if (estimatedCloseDate) partner.date = String(estimatedCloseDate);

      if (status === "In Conversation") {
        partner.helpDetails = {
          contactName: row["Name"] as string | undefined,
          category: row["Deal Type"] as string | undefined,
          reason: row["Next Steps"] as string | undefined,
        };
      }

      return partner;
    })
    .filter((p): p is Partner => p !== null && !!p.name);
}

function getDuplicateNames(partners: Partner[]): Set<string> {
  const counts = new Map<string, number>();
  for (const p of partners) {
    const key = p.name.toLowerCase().trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const duplicates = new Set<string>();
  counts.forEach((count, name) => {
    if (count > 1) duplicates.add(name);
  });
  return duplicates;
}

function matchesQuarter(partner: Partner, quarter: string): boolean {
  if (quarter === "All" || !partner.date) return true;
  const normalized = partner.date.trim();
  return normalized.toUpperCase().startsWith(quarter.toUpperCase());
}

export default function CurrentPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PartnerStatus>("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [quarterFilter, setQuarterFilter] = useState("All");
  const [pageSize, setPageSize] = useState(20);
  const [detailPartnerId, setDetailPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const duplicateNames = useMemo(() => getDuplicateNames(partners), [partners]);

  const industries = useMemo(() => {
    const set = new Set(partners.map((p) => p.industry).filter(Boolean));
    return Array.from(set).sort();
  }, [partners]);

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      const matchesIndustry = industryFilter === "All" || p.industry === industryFilter;
      const matchesQuarterFilter = matchesQuarter(p, quarterFilter);
      return matchesSearch && matchesStatus && matchesIndustry && matchesQuarterFilter;
    });
  }, [partners, searchQuery, statusFilter, industryFilter, quarterFilter]);

  const stats = useMemo(() => {
    const total = filteredPartners.length;
    const activeConversations = filteredPartners.filter(
      (p) => p.status === "Active" || p.status === "In Conversation",
    ).length;
    const pendingReview = filteredPartners.filter(
      (p) => p.status === "Submitted" || p.status === "Under Review",
    ).length;
    return { total, activeConversations, pendingReview };
  }, [filteredPartners]);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const flag = sessionStorage.getItem(REFERRAL_SUCCESS_KEY);
    if (flag) {
      toast.success("Your response has been recorded.");
      sessionStorage.removeItem(REFERRAL_SUCCESS_KEY);
    }
  }, []);

  useEffect(() => {
    async function loadExcelData() {
      try {
        setLoading(true);
        const response = await fetch("/pipeline.xlsx");
        if (!response.ok) throw new Error("Failed to fetch Excel file");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        if (workbook.SheetNames.length === 0) throw new Error("No sheets found in workbook");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setPartners(parseExcelData(jsonData));
      } catch (err) {
        console.warn("Excel file or sheet not found. Reverting to dummy data.", err);
        setPartners(MOCK_PARTNERS);
      } finally {
        setLoading(false);
      }
    }
    loadExcelData();
  }, []);

  function handleExport() {
    const headers = [
      "Partner Name",
      "Status",
      "Industry",
      "Referred On",
      "Referred By",
      "Last Updated",
      "Contact Email",
    ];
    const rows = filteredPartners.map((p) => [
      p.name,
      p.status,
      p.industry,
      p.date ?? "",
      p.referredBy ?? "",
      p.lastUpdated ?? "",
      p.email === "Contact info pending" ? "" : p.email,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "partners-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const detailPartner = detailPartnerId ? partners.find((p) => p.id === detailPartnerId) ?? null : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Current Partners
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A shared directory of all partners and their current status in the pipeline.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-border/70 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Partners</span>
            <Users className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tracking-tight">{loading ? "—" : stats.total}</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/70 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Active Conversations</span>
            <MessageSquare className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tracking-tight">
              {loading ? "—" : stats.activeConversations}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/70 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Pending Review</span>
            <Clock className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tracking-tight">
              {loading ? "—" : stats.pendingReview}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/70 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Response Rate</span>
            <Zap className="size-4 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tracking-tight">{RESPONSE_RATE_MOCK}</span>
          </CardContent>
        </Card>
      </div>

      {/* Control bar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground" aria-hidden>
              <Search className="size-4" />
            </span>
            <Input
              type="search"
              placeholder="Search by partner name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
              aria-label="Search partners by name"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Check for duplicates before adding.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[140px]" aria-label="Filter by industry">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={quarterFilter} onValueChange={setQuarterFilter}>
              <SelectTrigger className="w-[120px]" aria-label="Filter by quarter">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Q1 - 2025">Q1 2025</SelectItem>
                <SelectItem value="Q2 - 2025">Q2 2025</SelectItem>
                <SelectItem value="Q3 - 2025">Q3 2025</SelectItem>
                <SelectItem value="Q4 - 2025">Q4 2025</SelectItem>
                <SelectItem value="Q1 - 2026">Q1 2026</SelectItem>
                <SelectItem value="Q2 - 2026">Q2 2026</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport} aria-label="Export to CSV">
              <Download className="size-4" />
              <span className="ml-2">Export</span>
            </Button>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="w-[120px]" aria-label="Rows per page">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {STATUS_CHIP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              aria-pressed={statusFilter === opt.value}
              className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring/70 ${
                statusFilter === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/70 bg-card/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Loading partner data...
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-card/30 py-16 text-center">
          <Users className="size-12 text-muted-foreground/50 mb-4" aria-hidden />
          <p className="text-muted-foreground">
            No partners yet — be the first to refer!
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/refer">Refer a Partner</Link>
          </Button>
        </div>
      ) : (
        <PartnersTable
          data={filteredPartners}
          duplicateNames={duplicateNames}
          pageSize={pageSize}
          onOpenDetail={setDetailPartnerId}
        />
      )}

      <PartnerDetailSheet
        partner={detailPartner}
        open={!!detailPartnerId}
        onOpenChange={(open) => !open && setDetailPartnerId(null)}
      />
    </div>
  );
}
