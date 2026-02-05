"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Partner } from "@/lib/mock/partners";

export function PartnerDetailSheet({
  partner,
  open,
  onOpenChange,
}: {
  partner: Partner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!partner) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{partner.name}</SheetTitle>
          <SheetDescription>Partner details</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-auto pt-4">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <p className="text-sm text-foreground">{partner.status}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Industry</span>
            <p className="text-sm text-foreground">{partner.industry || "—"}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Referred On</span>
            <p className="text-sm text-foreground">{partner.date || "—"}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Referred By</span>
            <p className="text-sm text-foreground">{partner.referredBy || "—"}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Last Updated</span>
            <p className="text-sm text-foreground">{partner.lastUpdated || "—"}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Contact Email</span>
            <p className="text-sm text-foreground">
              {partner.email === "Contact info pending" ? "—" : partner.email}
            </p>
            {partner.email !== "Contact info pending" && (
              <a
                href={`mailto:${partner.email}`}
                className="text-sm text-primary hover:underline"
              >
                Send email
              </a>
            )}
          </div>
          {partner.helpDetails && (
            <div className="rounded-xl border border-border/70 bg-card/30 p-4">
              <h4 className="mb-2 text-sm font-semibold text-foreground">Action Required</h4>
              <div className="space-y-2 text-sm">
                {partner.helpDetails.contactName && (
                  <div>
                    <span className="font-medium text-muted-foreground">Contact Name: </span>
                    <span className="text-foreground">{partner.helpDetails.contactName}</span>
                  </div>
                )}
                {partner.helpDetails.category && (
                  <div>
                    <span className="font-medium text-muted-foreground">Category: </span>
                    <span className="text-foreground">{partner.helpDetails.category}</span>
                  </div>
                )}
                {partner.helpDetails.reason && (
                  <div>
                    <span className="font-medium text-muted-foreground">Reason for Help: </span>
                    <span className="text-foreground">{partner.helpDetails.reason}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
