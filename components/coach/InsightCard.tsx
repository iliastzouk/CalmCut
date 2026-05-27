"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface InsightCardProps {
  insight: string;
  type?: "positive" | "suggestion" | "neutral" | "warning";
  index?: number;
}

const TYPE_CONFIG = {
  positive: {
    icon: CheckCircle,
    iconColor: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
  },
  suggestion: {
    icon: Sparkles,
    iconColor: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
  },
  neutral: {
    icon: Info,
    iconColor: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
  },
  warning: {
    icon: AlertCircle,
    iconColor: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950",
    border: "border-orange-200 dark:border-orange-800",
  },
};

function detectType(insight: string): InsightCardProps["type"] {
  if (insight.includes("!") && (insight.includes("great") || insight.includes("well") || insight.includes("good") || insight.includes("down"))) return "positive";
  if (insight.includes("try") || insight.includes("consider") || insight.includes("might")) return "suggestion";
  if (insight.includes("normal") || insight.includes("fluctuation")) return "neutral";
  return "neutral";
}

export function InsightCard({ insight, type, index = 0 }: InsightCardProps) {
  const detectedType: keyof typeof TYPE_CONFIG = type ?? detectType(insight) ?? "neutral";
  const config = TYPE_CONFIG[detectedType];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "rounded-2xl border p-4 flex gap-3 items-start",
        config.bg,
        config.border
      )}
    >
      <Icon className={cn("h-4.5 w-4.5 shrink-0 mt-0.5", config.iconColor)} size={18} />
      <p className="text-sm leading-relaxed">{insight}</p>
    </motion.div>
  );
}
