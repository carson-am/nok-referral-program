"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Search } from "lucide-react";

import { PartnersTable } from "@/components/partners/PartnersTable";
import { Input } from "@/components/ui/input";
import type { Partner } from "@/lib/mock/partners";

const REFERRAL_SUCCESS_KEY = "referralSuccess";

function normalizeStatus(status: string): Partner["status"] {
  const normalized = status.trim();
  if (normalized === "Help Needed" || normalized === "Completed" || normalized === "No Help Needed") {
    return normalized;
  }
  return "No Help Needed";
}

function parseExcelData(data: unknown[]): Partner[] {
  return data.map((row: any, index) => {
    const partnerName = row["Partner Name"] || row["partner name"] || row["PartnerName"] || "";
    const status = normalizeStatus(row["Status"] || row["status"] || "");
    const industry = row["Industry"] || row["industry"] || "";
    const email = row["Contact Email"] || row["contact email"] || row["ContactEmail"] || row["Email"] || row["email"] || "";

    const partner: Partner = {
      id: `p_${index + 1}`,
      name: String(partnerName),
      status,
      industry: String(industry),
      email: String(email),
    };

    if (status === "Help Needed") {
      partner.helpDetails = {
        contactName: row["Contact Name"] || row["contact name"] || row["ContactName"] || undefined,
        category: row["Category"] || row["category"] || undefined,
        reason: row["Reason for Help"] || row["reason for help"] || row["ReasonForHelp"] || undefined,
      };
    }

    return partner;
  }).filter((p) => p.name);
}

export default function CurrentPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const response = await fetch("/sales-pipeline.xlsx");
        if (!response.ok) {
          throw new Error("Failed to fetch Excel file");
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const pipelineSheetName = workbook.SheetNames.find((name) => name === "Pipeline");
        if (!pipelineSheetName) {
          throw new Error('Sheet "Pipeline" not found');
        }

        const sheet = workbook.Sheets[pipelineSheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        const parsedPartners = parseExcelData(jsonData);
        setPartners(parsedPartners);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load partner data");
        toast.error("Failed to load partner data from Excel file");
      } finally {
        setLoading(false);
      }
    }

    loadExcelData();
  }, []);

  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by partner name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Search to check for existing entries and prevent duplicates.
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading partner data...</div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-destructive">{error}</div>
        ) : (
          <PartnersTable data={filteredPartners} />
        )}
      </div>
    </div>
  );
}
