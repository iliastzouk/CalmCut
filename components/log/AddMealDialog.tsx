"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, Sparkles, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLogStore } from "@/stores/logStore";
import { useAuthStore } from "@/stores/authStore";
import { estimateCalories } from "@/lib/utils/calories";
import { todayISO } from "@/lib/utils/dates";
import type { MealCategory } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface AddMealDialogProps {
  open: boolean;
  defaultCategory?: MealCategory;
  onClose: () => void;
}

const MEAL_CATEGORIES: { value: MealCategory; label: string; emoji: string }[] = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "snack", label: "Snack", emoji: "🍎" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
  { value: "late_night", label: "Late Night", emoji: "🌛" },
];

const QUICK_FOODS = [
  "All Bran + milk",
  "Protein yogurt",
  "Brownie",
  "Chia pudding",
  "2 eggs",
  "Apple",
  "Souvlaki",
  "Crepe",
  "Burger",
  "Chicken + rice",
];

export function AddMealDialog({ open, defaultCategory = "breakfast", onClose }: AddMealDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MealCategory>(defaultCategory);
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiEstimate, setAiEstimate] = useState<{ estimate: number; confidence: string; reasoning: string } | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const { addMeal, selectedDate } = useLogStore();

  const handleEstimate = () => {
    if (!name.trim()) return;
    setIsEstimating(true);
    setTimeout(() => {
      const est = estimateCalories(name);
      setAiEstimate({ estimate: est.estimate, confidence: est.confidence, reasoning: est.reasoning });
      setCalories(est.estimate.toString());
      setIsEstimating(false);
    }, 800);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !user) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const date = selectedDate || todayISO();
      const caloriesNum = calories ? parseInt(calories) : aiEstimate?.estimate;

      const { data, error } = await supabase
        .from("meals")
        .insert({
          user_id: user.id,
          daily_log_id: null,
          date,
          name: name.trim(),
          description: notes || null,
          category,
          calories_manual: calories ? parseInt(calories) : null,
          calories_estimated: aiEstimate?.estimate ?? null,
          calories_confidence: aiEstimate?.confidence ?? null,
          image_url: imageUrl || null,
        })
        .select()
        .single();

      if (error) throw error;

      addMeal(data);

      await supabase.from("daily_logs").upsert({
        user_id: user.id,
        date,
        total_calories: caloriesNum ?? 0,
      }, { onConflict: "user_id,date" });

      toast.success(`${name} logged!`, { description: caloriesNum ? `~${caloriesNum} kcal` : "Saved" });
      handleClose();
    } catch (err) {
      toast.error("Failed to log meal");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setCalories("");
    setNotes("");
    setImageUrl("");
    setAiEstimate(null);
    setCategory(defaultCategory);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log a Meal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Quick Add</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_FOODS.map((food) => (
                <button
                  key={food}
                  onClick={() => setName(food)}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-full border transition-colors",
                    name === food
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {food}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Meal Name"
            placeholder="e.g. Chicken souvlaki with pita..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select value={category} onValueChange={(v) => setCategory(v as MealCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEAL_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              label="Calories (kcal)"
              type="number"
              placeholder="e.g. 450"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="flex-1"
            />
            <div className="flex flex-col justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEstimate}
                disabled={!name || isEstimating}
                className="gap-1.5 rounded-xl h-10"
              >
                {isEstimating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                )}
                Estimate
              </Button>
            </div>
          </div>

          {aiEstimate && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">AI Estimate</p>
                <Badge variant="amber" className="text-xs ml-auto capitalize">{aiEstimate.confidence}</Badge>
              </div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{aiEstimate.estimate} kcal</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{aiEstimate.reasoning}</p>
            </div>
          )}

          <Textarea
            label="Notes (optional)"
            placeholder="Any thoughts about this meal..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />

          <div>
            <p className="text-sm font-medium mb-2">Photo (optional)</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-20 rounded-xl border-2 border-dashed border-border hover:border-green-400 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-green-600"
            >
              <Camera className="h-5 w-5" />
              <span className="text-xs">Add meal photo</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!name.trim()}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              Log Meal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
