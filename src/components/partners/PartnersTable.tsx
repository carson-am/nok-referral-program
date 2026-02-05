"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";

import type { Partner, PartnerStatus } from "@/lib/mock/partners";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CENTER_ALIGN_COLUMNS = new Set(["status", "industry", "date", "referredBy", "lastUpdated", "email"]);

function statusVariant(status: PartnerStatus): "success" | "info" | "warning" | "muted" | "destructive" | "default" {
  switch (status) {
    case "Active":
      return "success";
    case "In Conversation":
    case "Onboarding":
      return "info";
    case "Under Review":
      return "warning";
    case "Submitted":
    case "On Hold":
      return "muted";
    case "Declined":
      return "destructive";
    default:
      return "default";
  }
}

export function PartnersTable({
  data,
  duplicateNames,
  pageSize,
  onSelectionChange,
}: {
  data: Partner[];
  duplicateNames: Set<string>;
  pageSize: number;
  onSelectionChange?: (selectedIds: string[]) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [pageIndex, setPageIndex] = useState(0);
  React.useEffect(() => setPageIndex(0), [pageSize]);
  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  const columns = useMemo<ColumnDef<Partner>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${row.original.name}`}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Partner Name",
        cell: ({ row }) => {
          const partner = row.original;
          const isDuplicate = duplicateNames.has(partner.name.toLowerCase().trim());
          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-medium text-foreground">{partner.name}</span>
              {isDuplicate && (
                <span
                  className="text-amber-500 shrink-0"
                  title="Duplicate brand name"
                  aria-description="Duplicate brand name"
                >
                  <AlertTriangle className="size-4" />
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
          </span>
        ),
      },
      {
        accessorKey: "industry",
        header: "Industry",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{row.original.industry || "—"}</span>
        ),
      },
      {
        accessorKey: "date",
        header: "Referred On",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{row.original.date || "—"}</span>
        ),
      },
      {
        accessorKey: "referredBy",
        header: "Referred By",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{row.original.referredBy || "—"}</span>
        ),
      },
      {
        accessorKey: "lastUpdated",
        header: "Last Updated",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{row.original.lastUpdated || "—"}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => {
          const email = row.original.email;
          if (!email || email === "Contact info pending") {
            return (
              <span className="whitespace-nowrap text-sm text-primary">Request Info</span>
            );
          }
          return (
            <a
              href={`mailto:${email}`}
              className="whitespace-nowrap text-muted-foreground hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-ring/70 rounded"
            >
              {email}
            </a>
          );
        },
      },
    ],
    [duplicateNames],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : pagination;
      setPageIndex(next.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    autoResetPageIndex: true,
  });

  useEffect(() => {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id);
    onSelectionChange?.(ids);
  }, [table, rowSelection, onSelectionChange]);

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  return (
    <div className="space-y-4 w-full">
      <div className="w-full max-h-[calc(100vh-380px)] overflow-x-auto overflow-y-auto rounded-xl border border-border/70 bg-card/50">
        <Table className="w-full min-w-max">
          <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const isCenter = CENTER_ALIGN_COLUMNS.has(header.column.id);
                  return (
                    <TableHead key={header.id} className={isCenter ? "whitespace-nowrap text-center" : "whitespace-nowrap"}>
                      <div className={`flex items-center gap-1 whitespace-nowrap ${isCenter ? "justify-center" : ""}`}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <button
                            type="button"
                            onClick={() => header.column.toggleSorting()}
                            className="ml-1 rounded focus:outline-none focus:ring-2 focus:ring-ring/70"
                            aria-label={sorted ? `Sort ${sorted === "asc" ? "ascending" : "descending"}` : "Sort"}
                          >
                            {sorted === "asc" ? (
                              <ArrowUp className="size-4 text-muted-foreground" />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="size-4 text-muted-foreground" />
                            ) : (
                              <span className="inline-block size-4 text-muted-foreground/50">↕</span>
                            )}
                          </button>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={`even:bg-muted/20 hover:bg-muted/30 focus-within:bg-muted/30 ${row.getIsSelected() ? "bg-primary/5" : ""}`}
              >
                {row.getVisibleCells().map((cell) => {
                  const isCenter = CENTER_ALIGN_COLUMNS.has(cell.column.id);
                  return (
                    <TableCell key={cell.id} className={isCenter ? "whitespace-nowrap text-center" : "whitespace-nowrap"}>
                      {isCenter ? (
                        <div className="flex justify-center">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
