"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils/cn";

interface HungerSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color?: "amber" | "purple";
}

const LABELS = {
  amber: {
    low: "Not hungry",
    mid: "Moderately hungry",
    high: "Very hungry",
  },
  purple: {
    low: "No cravings",
    mid: "Some cravings",
    high: "Strong cravings",
  },
};

export function HungerSlider({ label, value, onChange, color = "amber" }: HungerSliderProps) {
  const labels = LABELS[color];
  const description = value <= 3 ? labels.low : value <= 6 ? labels.mid : labels.high;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <span className={cn(
          "text-sm font-bold px-2 py-0.5 rounded-lg",
          color === "amber"
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
        )}>
          {value}/10
        </span>
      </div>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className={cn(
          "[&_[data-radix-slider-range]]:transition-colors",
          color === "amber"
            ? "[&_[data-radix-slider-range]]:bg-amber-400 [&_[data-radix-slider-thumb]]:border-amber-400"
            : "[&_[data-radix-slider-range]]:bg-purple-400 [&_[data-radix-slider-thumb]]:border-purple-400"
        )}
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
