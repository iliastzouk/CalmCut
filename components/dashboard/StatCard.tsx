"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string };
  highlight?: boolean;
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  iconColor = "text-green-600",
  iconBg = "bg-green-100 dark:bg-green-900",
  trend,
  highlight,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow",
        highlight && "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("rounded-xl p-2.5", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.value < 0
              ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900"
              : "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900"
          )}>
            {trend.value > 0 ? "+" : ""}{trend.value} {trend.label}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <p className="text-2xl font-bold">{value}</p>
          {unit && <p className="text-sm text-muted-foreground font-medium">{unit}</p>}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
