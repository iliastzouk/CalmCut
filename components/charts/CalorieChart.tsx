"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Cell,
} from "recharts";
import { formatShortDate } from "@/lib/utils/dates";

interface CalorieDataPoint {
  date: string;
  calories: number;
}

interface CalorieChartProps {
  data: CalorieDataPoint[];
  target: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-background p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{formatShortDate(label)}</p>
        <p className="text-sm font-semibold text-green-600">{payload[0].value} kcal</p>
      </div>
    );
  }
  return null;
};

export function CalorieChart({ data, target }: CalorieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatShortDate(v)}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", radius: 8 }} />
        <ReferenceLine
          y={target}
          stroke="#22c55e"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: "Target", position: "right", fontSize: 10, fill: "#22c55e" }}
        />
        <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.calories <= target ? "#22c55e" : "#f59e0b"}
              opacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
