"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Search } from "lucide-react";

import { PartnersTable } from "@/components/partners/PartnersTable";
import { Input } from "@/components/ui/input";
import type { Partner } from "@/lib/mock/partners";
import { MOCK_PARTNERS } from "@/lib/mock/partners";

const REFERRAL_SUCCESS_KEY = "referralSuccess";

function normalizeStatus(status: string): Partner["status"] {
  const normalized = status.trim().toLowerCase();
  
  if (normalized === "contract negotiation") {
    return "Help Needed";
  }
  
  if (
    normalized === "discovery" ||
    normalized === "solicitation" ||
    normalized === "qualification" ||
    normalized === "n/a" ||
    normalized === ""
  ) {
    return "No Help Needed";
  }
  
  return "No Help Needed";
}

function parseExcelData(data: unknown[]): Partner[] {
  return data
    .map((row: any, index) => {
      const brand = row["Brand"] || "";
      const brandTrimmed = String(brand).trim();
      
      if (!brandTrimmed) {
        return null;
      }

      const status = normalizeStatus(row["Status"] || "");
      const dealType = row["Deal Type"] || "";
      const emailRaw = row["Email"] || "";
      const emailTrimmed = String(emailRaw).trim();
      const email = emailTrimmed || "Contact info pending";
      const estimatedCloseDate = row["Estimated Close Date"] || "";

      const partner: Partner = {
        id: `p_${index + 1}`,
        name: brandTrimmed,
        status,
        industry: String(dealType),
        email,
      };

      if (estimatedCloseDate) {
        partner.date = String(estimatedCloseDate);
      }

      if (status === "Help Needed") {
        partner.helpDetails = {
          contactName: row["Name"] || undefined,
          category: row["Deal Type"] || undefined,
          reason: row["Next Steps"] || undefined,
        };
      }

      return partner;
    })
    .filter((p): p is Partner => p !== null && !!p.name);
}

export default function CurrentPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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
        if (!response.ok) {
          throw new Error("Failed to fetch Excel file");
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        if (workbook.SheetNames.length === 0) {
          throw new Error("No sheets found in workbook");
        }

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        const parsedPartners = parseExcelData(jsonData);
        setPartners(parsedPartners);
      } catch (err) {
        console.warn("Excel file or sheet not found. Reverting to dummy data.", err);
        setPartners(MOCK_PARTNERS);
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
        ) : (
          <PartnersTable data={filteredPartners} />
        )}
      </div>
    </div>
  );
}
