"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

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
    case "Active":
      return "success";
    case "Pending":
      return "warning";
    case "Inactive":
      return "muted";
    default:
      return "default";
  }
}

const columns: ColumnDef<Partner>[] = [
  {
    accessorKey: "name",
    header: "Partner Name",
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "industry",
    header: "Industry",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.industry}</span>,
  },
  {
    accessorKey: "email",
    header: "Contact Email",
    cell: ({ row }) => (
      <a
        className="text-muted-foreground hover:text-foreground hover:underline"
        href={`mailto:${row.original.email}`}
      >
        {row.original.email}
      </a>
    ),
  },
];

export function PartnersTable({ data }: { data: Partner[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/50">
      <Table>
        <TableHeader>
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

