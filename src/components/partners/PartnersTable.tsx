"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import type { Partner, PartnerStatus } from "@/lib/mock/partners";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function statusVariant(status: PartnerStatus) {
  switch (status) {
    case "Help Needed":
      return "warning";
    case "Completed":
      return "success";
    case "No Help Needed":
      return "muted";
    default:
      return "default";
  }
}

export function PartnersTable({ data }: { data: Partner[] }) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const columns = useMemo<ColumnDef<Partner>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Partner Name",
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const partner = row.original;
          const isHelpNeeded = partner.status === "Help Needed" && partner.helpDetails;
          const isExpanded = expandedRows[row.id] || false;
          return (
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(partner.status)}>{partner.status}</Badge>
              {isHelpNeeded && (
                <ChevronDown
                  className={`size-4 cursor-pointer text-muted-foreground transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedRows((prev) => ({
                      ...prev,
                      [row.id]: !prev[row.id],
                    }));
                  }}
                />
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "industry",
        header: "Industry",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.industry}</span>,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.date || ""}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact Email",
        cell: ({ row }) => {
          const email = row.original.email;
          if (email === "Contact info pending") {
            return <span className="text-muted-foreground">{email}</span>;
          }
          return (
            <a
              className="text-muted-foreground hover:text-foreground hover:underline"
              href={`mailto:${email}`}
            >
              {email}
            </a>
          );
        },
      },
    ],
    [expandedRows],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: (row) => {
      return row.original.status === "Help Needed" && !!row.original.helpDetails;
    },
  });

  return (
    <div className="max-h-[calc(100vh-300px)] overflow-auto rounded-xl border border-border/70 bg-card/50">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const isExpanded = expandedRows[row.id] || false;
            const partner = row.original;
            const hasHelpDetails = partner.status === "Help Needed" && partner.helpDetails;

            return (
              <React.Fragment key={row.id}>
                <TableRow
                  className={hasHelpDetails ? "cursor-pointer" : ""}
                  onClick={() => {
                    if (hasHelpDetails) {
                      setExpandedRows((prev) => ({
                        ...prev,
                        [row.id]: !prev[row.id],
                      }));
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {isExpanded && hasHelpDetails && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="bg-card/30 p-0">
                      <div className="rounded-xl border border-border/70 bg-card/50 p-4 m-4">
                        <h4 className="mb-3 text-sm font-semibold text-foreground">Action Required</h4>
                        <div className="space-y-2 text-sm">
                          {partner.helpDetails?.contactName && (
                            <div>
                              <span className="font-medium text-muted-foreground">Contact Name:</span>{" "}
                              <span className="text-foreground">{partner.helpDetails.contactName}</span>
                            </div>
                          )}
                          {partner.helpDetails?.category && (
                            <div>
                              <span className="font-medium text-muted-foreground">Category:</span>{" "}
                              <span className="text-foreground">{partner.helpDetails.category}</span>
                            </div>
                          )}
                          {partner.helpDetails?.reason && (
                            <div>
                              <span className="font-medium text-muted-foreground">Reason for Help:</span>{" "}
                              <span className="text-foreground">{partner.helpDetails.reason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
