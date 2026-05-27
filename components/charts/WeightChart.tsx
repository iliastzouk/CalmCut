"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Area, AreaChart,
} from "recharts";
import { formatShortDate } from "@/lib/utils/dates";

interface WeightDataPoint {
  date: string;
  weight: number;
  smoothed: number;
}

interface WeightChartProps {
  data: WeightDataPoint[];
  goalWeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-background p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{formatShortDate(label)}</p>
        {payload.map((p: { dataKey: string; value: number; color: string }) => (
          <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.dataKey === "smoothed" ? "Avg: " : ""}
            {p.value.toFixed(1)} kg
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function WeightChart({ data, goalWeight }: WeightChartProps) {
  const minWeight = Math.min(...data.map((d) => d.weight), goalWeight) - 0.5;
  const maxWeight = Math.max(...data.map((d) => d.weight)) + 0.5;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="smoothedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatShortDate(v)}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[minWeight, maxWeight]}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}kg`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={goalWeight}
          stroke="#22c55e"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: "Goal", position: "right", fontSize: 11, fill: "#22c55e" }}
        />
        <Area
          type="monotone"
          dataKey="weight"
          stroke="#86efac"
          strokeWidth={1.5}
          fill="url(#weightGradient)"
          dot={{ r: 3, fill: "#86efac", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#22c55e" }}
        />
        <Area
          type="monotone"
          dataKey="smoothed"
          stroke="#22c55e"
          strokeWidth={2.5}
          fill="none"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
