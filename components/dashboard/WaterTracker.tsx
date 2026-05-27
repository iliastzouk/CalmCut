"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface WaterTrackerProps {
  current: number;
  goal?: number;
  onAdd: (ml: number) => void;
}

const WATER_OPTIONS = [150, 250, 330, 500];

export function WaterTracker({ current, goal = 2500, onAdd }: WaterTrackerProps) {
  const [showOptions, setShowOptions] = useState(false);
  const glasses = Math.ceil(current / 250);
  const goalGlasses = Math.ceil(goal / 250);
  const pct = Math.min(100, (current / goal) * 100);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-cyan-100 dark:bg-cyan-900 p-2">
            <Droplets className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Water</p>
            <p className="font-bold">{(current / 1000).toFixed(1)}L <span className="text-sm text-muted-foreground font-normal">/ {(goal / 1000).toFixed(1)}L</span></p>
          </div>
        </div>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setShowOptions(!showOptions)}
          className="rounded-xl"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1 mb-2">
        {Array.from({ length: Math.max(8, goalGlasses) }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={cn(
              "h-5 flex-1 rounded-full transition-colors",
              i < glasses ? "bg-cyan-400" : "bg-muted"
            )}
          />
        ))}
      </div>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 mt-2 overflow-hidden"
          >
            {WATER_OPTIONS.map((ml) => (
              <button
                key={ml}
                onClick={() => { onAdd(ml); setShowOptions(false); }}
                className="flex-1 rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-xs font-medium py-2 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors active:scale-95"
              >
                +{ml}ml
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
