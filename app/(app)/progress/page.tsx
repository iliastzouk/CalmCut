"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Scale, TrendingDown, Activity, Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { WeightChart } from "@/components/charts/WeightChart";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/authStore";
import { useWeightStore } from "@/stores/weightStore";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/dates";
import { calculateBMI, calculateTDEE, getWeightProgressPct, estimateFatLossPerWeek } from "@/lib/utils/calories";
import { AddWeightDialog } from "@/components/weight/AddWeightDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProgressPage() {
  const { user } = useAuthStore();
  const { entries, setEntries, getLatestWeight, getSmoothedData, get7DayAverage, getWeeklyChange } = useWeightStore();
  const [addWeightOpen, setAddWeightOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    createClient().from("weight_entries").select("*").eq("user_id", user.id).order("date").then(({ data }) => {
      if (data) setEntries(data);
    });
  }, [user]);

  const latestWeight = getLatestWeight() ?? user?.current_weight ?? user?.start_weight ?? 83;
  const startWeight = user?.start_weight ?? 83;
  const goalWeight = user?.goal_weight ?? 75;
  const weightLost = Math.max(0, startWeight - latestWeight);
  const progressPct = getWeightProgressPct(startWeight, latestWeight, goalWeight);
  const bmi = calculateBMI(latestWeight);
  const avg7d = get7DayAverage();
  const weeklyChange = getWeeklyChange();
  const calorieTarget = user?.daily_calorie_target ?? 1700;
  const tdee = calculateTDEE(latestWeight);
  const dailyDeficit = tdee - calorieTarget;
  const weeklyFatLoss = estimateFatLossPerWeek(dailyDeficit * 7);
  const weeksToGoal = weightLost < (startWeight - goalWeight) ? Math.ceil((startWeight - goalWeight - weightLost) / Math.max(0.1, weeklyFatLoss)) : 0;

  const smoothedData = getSmoothedData();
  const last30 = smoothedData.slice(-30);
  const last7 = smoothedData.slice(-7);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Progress</h1>
          <p className="text-sm text-muted-foreground">{entries.length} weigh-ins logged</p>
        </div>
        <Button onClick={() => setAddWeightOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
          <Scale className="h-4 w-4" /> Log Weight
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white shadow-lg shadow-green-200 dark:shadow-green-900"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-green-100">Current Weight</p>
            <p className="text-4xl font-bold">{latestWeight.toFixed(1)} <span className="text-xl font-normal text-green-100">kg</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-100">Lost</p>
            <p className="text-3xl font-bold">{weightLost.toFixed(1)} <span className="text-lg text-green-100">kg</span></p>
          </div>
        </div>

        <div className="mb-2 flex justify-between text-xs text-green-100">
          <span>Start: {startWeight}kg</span>
          <span>{progressPct}% complete</span>
          <span>Goal: {goalWeight}kg</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-white"
          />
        </div>

        {weeksToGoal > 0 && (
          <p className="text-xs text-green-100 mt-3">
            At current pace (~{weeklyFatLoss}kg/week), goal in ~{weeksToGoal} weeks
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="7-Day Average" value={avg7d?.toFixed(1) ?? "—"} unit="kg" icon={Scale} iconBg="bg-blue-100 dark:bg-blue-900" iconColor="text-blue-600" delay={0} />
        <StatCard title="Weekly Change" value={weeklyChange !== null ? (weeklyChange > 0 ? `+${weeklyChange}` : weeklyChange.toString()) : "—"} unit="kg" icon={TrendingDown} iconBg="bg-green-100 dark:bg-green-900" iconColor="text-green-600" delay={0.05} />
        <StatCard title="BMI" value={bmi} icon={Activity} subtitle={bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"} iconBg="bg-purple-100 dark:bg-purple-900" iconColor="text-purple-600" delay={0.1} />
        <StatCard title="Daily Deficit" value={dailyDeficit} unit="kcal" icon={Target} iconBg="bg-amber-100 dark:bg-amber-900" iconColor="text-amber-600" delay={0.15} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weight History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="30d">
            <TabsList className="mb-4">
              <TabsTrigger value="7d">7 days</TabsTrigger>
              <TabsTrigger value="30d">30 days</TabsTrigger>
              <TabsTrigger value="all">All time</TabsTrigger>
            </TabsList>
            <TabsContent value="7d">
              {last7.length > 1 ? <WeightChart data={last7} goalWeight={goalWeight} /> : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Not enough data</div>
              )}
            </TabsContent>
            <TabsContent value="30d">
              {last30.length > 1 ? <WeightChart data={last30} goalWeight={goalWeight} /> : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Not enough data</div>
              )}
            </TabsContent>
            <TabsContent value="all">
              {smoothedData.length > 1 ? <WeightChart data={smoothedData} goalWeight={goalWeight} /> : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Not enough data</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Weigh-in History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
            {[...entries].reverse().map((entry, i) => {
              const prev = entries[entries.length - 2 - i];
              const diff = prev ? entry.weight_kg - prev.weight_kg : null;
              return (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{formatDate(entry.date)}</p>
                      {entry.body_fat_pct && <p className="text-xs text-muted-foreground">{entry.body_fat_pct}% body fat</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.weight_kg} kg</p>
                    {diff !== null && (
                      <p className={`text-xs ${diff <= 0 ? "text-green-600" : "text-amber-600"}`}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AddWeightDialog open={addWeightOpen} onClose={() => setAddWeightOpen(false)} />
    </div>
  );
}
