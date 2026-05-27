"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scale, Flame, Droplets, TrendingDown, Target, Zap, Activity } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickAdd } from "@/components/dashboard/QuickAdd";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { WaterTracker } from "@/components/dashboard/WaterTracker";
import { WeightChart } from "@/components/charts/WeightChart";
import { CalorieChart } from "@/components/charts/CalorieChart";
import { HungerChart } from "@/components/charts/HungerChart";
import { InsightCard } from "@/components/coach/InsightCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { useLogStore } from "@/stores/logStore";
import { useWeightStore } from "@/stores/weightStore";
import { createClient } from "@/lib/supabase/client";
import { getLast7Days, getLast30Days, todayISO } from "@/lib/utils/dates";
import { calculateBMI, calculateTDEE } from "@/lib/utils/calories";
import { generateDailyInsights, getMotivationalMessage } from "@/lib/ai/coach";
import type { DailyLog, WaterEntry } from "@/types";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { dailyLogs, meals, waterEntries, setDailyLogs, setMeals, setWaterEntries, getTodayLog, getTodayMeals, getTodayWater, addWater } = useLogStore();
  const { entries: weightEntries, setEntries: setWeightEntries, getLatestWeight, getSmoothedData, get7DayAverage } = useWeightStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const last30 = getLast30Days();
      const [from, to] = [last30[0], last30[last30.length - 1]];

      const [logsRes, mealsRes, weightRes, waterRes] = await Promise.all([
        supabase.from("daily_logs").select("*").eq("user_id", user.id).gte("date", from).lte("date", to).order("date"),
        supabase.from("meals").select("*").eq("user_id", user.id).gte("date", from).lte("date", to).order("created_at", { ascending: false }),
        supabase.from("weight_entries").select("*").eq("user_id", user.id).order("date"),
        supabase.from("water_entries").select("*").eq("user_id", user.id).gte("date", from).lte("date", to),
      ]);

      if (logsRes.data) setDailyLogs(logsRes.data);
      if (mealsRes.data) setMeals(mealsRes.data);
      if (weightRes.data) setWeightEntries(weightRes.data);
      if (waterRes.data) setWaterEntries(waterRes.data);
      setIsLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAddWater = async (ml: number) => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("water_entries")
      .insert({ user_id: user.id, date: todayISO(), amount_ml: ml })
      .select()
      .single();
    if (data) addWater(data as WaterEntry);
  };

  const todayLog = getTodayLog();
  const todayMeals = getTodayMeals();
  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories_manual ?? m.calories_estimated ?? 0), 0);
  const todayWater = getTodayWater();
  const latestWeight = getLatestWeight() ?? user?.current_weight ?? user?.start_weight ?? 83;
  const startWeight = user?.start_weight ?? 83;
  const goalWeight = user?.goal_weight ?? 75;
  const weightLost = Math.max(0, startWeight - latestWeight);
  const bmi = calculateBMI(latestWeight);
  const tdee = calculateTDEE(latestWeight);
  const calorieTarget = user?.daily_calorie_target ?? 1700;
  const avgCals = dailyLogs.length > 0
    ? Math.round(dailyLogs.slice(-7).reduce((s, l) => s + (l.total_calories ?? 0), 0) / Math.min(7, dailyLogs.length))
    : 0;

  const last7 = getLast7Days();
  const weightChartData = getSmoothedData().slice(-30);
  const calorieChartData = last7.map((date) => {
    const log = dailyLogs.find((l) => l.date === date);
    const dayMeals = meals.filter((m) => m.date === date);
    const cals = dayMeals.reduce((s, m) => s + (m.calories_manual ?? m.calories_estimated ?? 0), 0) || log?.total_calories || 0;
    return { date, calories: cals };
  });
  const hungerChartData = last7.map((date) => {
    const log = dailyLogs.find((l) => l.date === date);
    return { date, hunger: log?.hunger_level ?? 0, cravings: log?.craving_level ?? 0 };
  });

  const loggingDays = new Set(dailyLogs.map((l) => l.date)).size;
  const streakDays = Math.min(loggingDays, 30);

  const insights = generateDailyInsights({
    recentLogs: dailyLogs.slice(-7),
    recentMeals: meals.slice(-20),
    weightEntries,
    todayLog,
    todayMeals,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {weightLost > 0 ? `${weightLost.toFixed(1)}kg lost · ` : ""}
            {(latestWeight - goalWeight).toFixed(1)}kg to goal
          </p>
        </div>
        <QuickAdd />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Current Weight" value={latestWeight.toFixed(1)} unit="kg" icon={Scale} iconBg="bg-blue-100 dark:bg-blue-900" iconColor="text-blue-600" delay={0} />
        <StatCard title="Goal Weight" value={goalWeight} unit="kg" icon={Target} iconBg="bg-green-100 dark:bg-green-900" iconColor="text-green-600" highlight delay={0.05} />
        <StatCard title="Lost So Far" value={weightLost.toFixed(1)} unit="kg" icon={TrendingDown} iconBg="bg-emerald-100 dark:bg-emerald-900" iconColor="text-emerald-600" delay={0.1} />
        <StatCard title="BMI" value={bmi} icon={Activity} iconBg="bg-purple-100 dark:bg-purple-900" iconColor="text-purple-600" subtitle={bmi < 25 ? "Normal range" : "Above normal"} delay={0.15} />
        <StatCard title="Today's Calories" value={todayCalories} unit="kcal" icon={Flame} iconBg="bg-orange-100 dark:bg-orange-900" iconColor="text-orange-600" trend={{ value: todayCalories - calorieTarget, label: "from target" }} delay={0.2} />
        <StatCard title="Weekly Average" value={avgCals} unit="kcal" icon={Zap} iconBg="bg-yellow-100 dark:bg-yellow-900" iconColor="text-yellow-600" delay={0.25} />
        <StatCard title="TDEE Estimate" value={tdee} unit="kcal" icon={Activity} iconBg="bg-slate-100 dark:bg-slate-800" iconColor="text-slate-600" subtitle="Daily energy need" delay={0.3} />
        <StreakCard streak={streakDays} message={getMotivationalMessage(weightLost, streakDays)} />
      </div>

      <WaterTracker current={todayWater} goal={2500} onAdd={handleAddWater} />

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weight Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {weightChartData.length > 1 ? (
              <WeightChart data={weightChartData} goalWeight={goalWeight} />
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Log more weight entries to see your trend
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Calories This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <CalorieChart data={calorieChartData} target={calorieTarget} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Hunger & Cravings (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <HungerChart data={hungerChartData} />
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Today's Insights</h2>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
