"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scale, Plus, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeightChart } from "@/components/charts/WeightChart";
import { AddWeightDialog } from "@/components/weight/AddWeightDialog";
import { useAuthStore } from "@/stores/authStore";
import { useWeightStore } from "@/stores/weightStore";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/dates";
import { calculateBMI, getWeightProgressPct } from "@/lib/utils/calories";

export default function WeightPage() {
  const { user } = useAuthStore();
  const { entries, setEntries, getSmoothedData, getLatestWeight, get7DayAverage, getWeeklyChange } = useWeightStore();
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    createClient().from("weight_entries").select("*").eq("user_id", user.id).order("date").then(({ data }) => {
      if (data) setEntries(data);
    });
  }, [user]);

  const latestWeight = getLatestWeight() ?? user?.start_weight ?? 83;
  const goalWeight = user?.goal_weight ?? 75;
  const startWeight = user?.start_weight ?? 83;
  const bmi = calculateBMI(latestWeight);
  const avg7d = get7DayAverage();
  const weeklyChange = getWeeklyChange();
  const weightLost = Math.max(0, startWeight - latestWeight);
  const progressPct = getWeightProgressPct(startWeight, latestWeight, goalWeight);
  const smoothedData = getSmoothedData();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weight Tracking</h1>
          <p className="text-sm text-muted-foreground">{entries.length} weigh-ins total</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
          <Plus className="h-4 w-4" /> Weigh In
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border p-4 text-center">
          <Scale className="h-5 w-5 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{latestWeight.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">kg now</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{weightLost.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">kg lost</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold">{bmi}</p>
          <p className="text-xs text-muted-foreground">BMI</p>
        </motion.div>
      </div>

      {weeklyChange !== null && (
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${weeklyChange <= 0 ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800" : "border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800"}`}>
          {weeklyChange < 0 ? <TrendingDown className="h-5 w-5 text-green-600" /> : weeklyChange > 0 ? <TrendingUp className="h-5 w-5 text-amber-600" /> : <Minus className="h-5 w-5 text-muted-foreground" />}
          <div>
            <p className="font-semibold text-sm">
              {weeklyChange < 0 ? `${Math.abs(weeklyChange)}kg down this week` : weeklyChange > 0 ? `${weeklyChange}kg up this week` : "Stable this week"}
            </p>
            <p className="text-xs text-muted-foreground">
              {weeklyChange <= 0 ? "Healthy, sustainable pace" : "Normal fluctuation — focus on the 4-week trend"}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weight Trend (All Time)</CardTitle>
        </CardHeader>
        <CardContent>
          {smoothedData.length > 1 ? (
            <WeightChart data={smoothedData} goalWeight={goalWeight} />
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Log at least 2 weights to see your trend
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">All Weigh-ins</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
            {[...entries].reverse().map((entry, i) => {
              const prevEntry = entries[entries.length - 2 - i];
              const diff = prevEntry ? entry.weight_kg - prevEntry.weight_kg : null;
              return (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{formatDate(entry.date)}</p>
                    {entry.body_fat_pct && <p className="text-xs text-muted-foreground">{entry.body_fat_pct}% BF</p>}
                    {entry.notes && <p className="text-xs text-muted-foreground">{entry.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.weight_kg} kg</p>
                    {diff !== null && (
                      <p className={`text-xs font-medium ${diff <= 0 ? "text-green-600" : "text-amber-600"}`}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {entries.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No weigh-ins yet. Log your first weight!</p>
            )}
          </div>
        </CardContent>
      </Card>

      <AddWeightDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
