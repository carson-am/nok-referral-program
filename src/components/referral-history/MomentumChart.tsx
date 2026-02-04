"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import type { MomentumPoint } from "@/lib/mock/referral-history";

const NOK_BLUE = "var(--primary)";

export function MomentumChart({ data }: { data: MomentumPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
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
