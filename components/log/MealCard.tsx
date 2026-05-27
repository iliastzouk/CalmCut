"use client";

import { motion } from "framer-motion";
import { Trash2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Meal } from "@/types";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useLogStore } from "@/stores/logStore";
import { toast } from "sonner";

const CATEGORY_CONFIG = {
  breakfast: { emoji: "🌅", label: "Breakfast", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  snack: { emoji: "🍎", label: "Snack", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  lunch: { emoji: "☀️", label: "Lunch", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  dinner: { emoji: "🌙", label: "Dinner", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  late_night: { emoji: "🌛", label: "Late Night", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
};

interface MealCardProps {
  meal: Meal;
  index?: number;
}

export function MealCard({ meal, index = 0 }: MealCardProps) {
  const config = CATEGORY_CONFIG[meal.category];
  const calories = meal.calories_manual ?? meal.calories_estimated ?? null;
  const { deleteMeal } = useLogStore();

  const handleDelete = async () => {
    try {
      const supabase = createClient();
      await supabase.from("meals").delete().eq("id", meal.id);
      deleteMeal(meal.id);
      toast.success("Meal removed");
    } catch {
      toast.error("Failed to delete meal");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", config.color)}>
              {config.emoji} {config.label}
            </span>
            {meal.calories_estimated && !meal.calories_manual && (
              <span className="flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                <Sparkles className="h-3 w-3" /> AI
              </span>
            )}
          </div>

          <p className="font-semibold text-sm leading-tight">{meal.name}</p>
          {meal.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{meal.description}</p>
          )}

          <div className="flex items-center gap-3 mt-2">
            {calories && (
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {calories} <span className="text-xs font-normal text-muted-foreground">kcal</span>
              </p>
            )}
            {meal.protein_g && (
              <p className="text-xs text-muted-foreground">P: {meal.protein_g}g</p>
            )}
            {meal.fiber_g && (
              <p className="text-xs text-muted-foreground">F: {meal.fiber_g}g</p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {meal.image_url ? (
            <img
              src={meal.image_url}
              alt={meal.name}
              className="h-14 w-14 rounded-xl object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-2xl">
              {config.emoji}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
