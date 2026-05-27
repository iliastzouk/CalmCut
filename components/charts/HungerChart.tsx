"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from "recharts";
import { formatShortDate } from "@/lib/utils/dates";

interface HungerDataPoint {
  date: string;
  hunger: number;
  cravings: number;
}

interface HungerChartProps {
  data: HungerDataPoint[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-background p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{formatShortDate(label)}</p>
        {payload.map((p: { name: string; value: number; color: string }) => (
          <p key={p.name} className="text-sm font-medium" style={{ color: p.color }}>
            {p.name}: {p.value}/10
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function HungerChart({ data }: HungerChartProps) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatShortDate(v)}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value) => <span className="text-muted-foreground capitalize">{value}</span>}
        />
        <Line
          type="monotone"
          dataKey="hunger"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="cravings"
          stroke="#a855f7"
          strokeWidth={2}
          dot={{ r: 3, fill: "#a855f7", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
