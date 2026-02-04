"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MomentumPoint } from "@/lib/mock/referral-history";

const NOK_BLUE = "var(--primary)";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length || label == null) return null;
  const value = payload[0].value;
  return (
    <div
      className="rounded-xl border border-border/80 bg-card px-3 py-2 font-sans text-sm shadow-lg"
      style={{ color: "var(--foreground)" }}
    >
      <span className="font-medium text-white">{label}: </span>
      <span className="text-white">
        {value} referral{value !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

export function MomentumChart({ data }: { data: MomentumPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <Tooltip content={<CustomTooltip />} />
        <XAxis
          dataKey="month"
          stroke="rgba(234,240,255,0.5)"
          tick={{ fill: "rgba(234,240,255,0.65)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="rgba(234,240,255,0.5)"
          tick={{ fill: "rgba(234,240,255,0.65)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Line
          type="monotone"
          dataKey="submissions"
          stroke={NOK_BLUE}
          strokeWidth={2}
          dot={{ fill: NOK_BLUE, strokeWidth: 0 }}
          activeDot={{ r: 4, fill: NOK_BLUE }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
