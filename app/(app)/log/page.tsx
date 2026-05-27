"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Flame, Droplets, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MealCard } from "@/components/log/MealCard";
import { AddMealDialog } from "@/components/log/AddMealDialog";
import { HungerSlider } from "@/components/log/HungerSlider";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/authStore";
import { useLogStore } from "@/stores/logStore";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatShortDate, daysAgo, todayISO } from "@/lib/utils/dates";
import { toast } from "sonner";
import { subDays, addDays, parseISO, format } from "date-fns";
import type { MealCategory } from "@/types";

export default function LogPage() {
  const { user } = useAuthStore();
  const {
    meals, dailyLogs, waterEntries,
    setMeals, setDailyLogs, setWaterEntries,
    selectedDate, setSelectedDate,
    getTodayMeals, getTodayLog, getTodayWater,
    updateDailyLog,
  } = useLogStore();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addCategory, setAddCategory] = useState<MealCategory>("breakfast");
  const [hunger, setHunger] = useState(5);
  const [cravings, setCravings] = useState(3);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadForDate = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const [mealsRes, logsRes, waterRes] = await Promise.all([
        supabase.from("meals").select("*").eq("user_id", user.id).eq("date", selectedDate).order("created_at"),
        supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("date", selectedDate),
        supabase.from("water_entries").select("*").eq("user_id", user.id).eq("date", selectedDate),
      ]);
      if (mealsRes.data) setMeals(mealsRes.data);
      if (logsRes.data) setDailyLogs(logsRes.data);
      if (waterRes.data) setWaterEntries(waterRes.data);

      const log = logsRes.data?.[0];
      if (log) {
        setHunger(log.hunger_level ?? 5);
        setCravings(log.craving_level ?? 3);
        setNotes(log.notes ?? "");
      }
      setIsLoading(false);
    };
    loadForDate();
  }, [user, selectedDate]);

  const handleDateChange = (dir: "prev" | "next") => {
    const current = parseISO(selectedDate);
    const newDate = dir === "prev" ? subDays(current, 1) : addDays(current, 1);
    const newDateStr = format(newDate, "yyyy-MM-dd");
    if (newDateStr > todayISO()) return;
    setSelectedDate(newDateStr);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const totalCals = todayMeals.reduce((s, m) => s + (m.calories_manual ?? m.calories_estimated ?? 0), 0);
      const log = getTodayLog();

      if (log) {
        await supabase.from("daily_logs").update({
          hunger_level: hunger,
          craving_level: cravings,
          notes,
          total_calories: totalCals,
        }).eq("id", log.id);
        updateDailyLog(log.id, { hunger_level: hunger, craving_level: cravings, notes, total_calories: totalCals });
      } else {
        await supabase.from("daily_logs").insert({
          user_id: user.id,
          date: selectedDate,
          hunger_level: hunger,
          craving_level: cravings,
          notes,
          total_calories: totalCals,
        });
      }
      toast.success("Day log saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const todayMeals = getTodayMeals();
  const todayWater = getTodayWater();
  const totalCals = todayMeals.reduce((s, m) => s + (m.calories_manual ?? m.calories_estimated ?? 0), 0);

  const MEAL_SECTIONS: { category: MealCategory; label: string; emoji: string }[] = [
    { category: "breakfast", label: "Breakfast", emoji: "🌅" },
    { category: "snack", label: "Morning Snack", emoji: "🍎" },
    { category: "lunch", label: "Lunch", emoji: "☀️" },
    { category: "dinner", label: "Dinner", emoji: "🌙" },
    { category: "late_night", label: "Late Night", emoji: "🌛" },
  ];

  const isToday = selectedDate === todayISO();

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={() => handleDateChange("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="font-semibold">{isToday ? "Today" : formatDate(selectedDate)}</p>
          <p className="text-xs text-muted-foreground">{formatShortDate(selectedDate)}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => handleDateChange("next")} disabled={isToday}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 p-3 text-center">
          <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{totalCals}</p>
          <p className="text-xs text-orange-600 dark:text-orange-400">kcal</p>
        </div>
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 text-center">
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{todayMeals.length}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">meals</p>
        </div>
        <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 p-3 text-center">
          <Droplets className="h-4 w-4 text-cyan-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-cyan-700 dark:text-cyan-300">{(todayWater / 1000).toFixed(1)}L</p>
          <p className="text-xs text-cyan-600 dark:text-cyan-400">water</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {MEAL_SECTIONS.map((section) => {
            const sectionMeals = todayMeals.filter((m) => m.category === section.category);
            return (
              <div key={section.category}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    {section.emoji} {section.label}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => { setAddCategory(section.category); setAddDialogOpen(true); }}
                    className="rounded-xl text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <AnimatePresence>
                  {sectionMeals.map((meal, i) => (
                    <MealCard key={meal.id} meal={meal} index={i} />
                  ))}
                </AnimatePresence>
                {sectionMeals.length === 0 && (
                  <button
                    onClick={() => { setAddCategory(section.category); setAddDialogOpen(true); }}
                    className="w-full rounded-2xl border-2 border-dashed border-border hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/50 transition-all py-3 text-sm text-muted-foreground hover:text-green-600 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add {section.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How are you feeling?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <HungerSlider label="Hunger Level" value={hunger} onChange={setHunger} color="amber" />
          <HungerSlider label="Craving Level" value={cravings} onChange={setCravings} color="purple" />
          <Textarea
            label="Notes"
            placeholder="Any thoughts about today..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <Button onClick={handleSave} loading={isSaving} className="w-full bg-green-500 hover:bg-green-600 text-white gap-2">
            <Save className="h-4 w-4" /> Save Day Log
          </Button>
        </CardContent>
      </Card>

      <AddMealDialog
        open={addDialogOpen}
        defaultCategory={addCategory}
        onClose={() => setAddDialogOpen(false)}
      />
    </div>
  );
}
