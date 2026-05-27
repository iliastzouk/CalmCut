import type { DailyLog, Meal, WeightEntry, AIInsight } from "@/types";

interface CoachContext {
  recentLogs: DailyLog[];
  recentMeals: Meal[];
  weightEntries: WeightEntry[];
  todayLog?: DailyLog;
  todayMeals?: Meal[];
}

export function generateDailyInsights(ctx: CoachContext): string[] {
  const insights: string[] = [];
  const { todayLog, todayMeals = [], recentLogs, weightEntries } = ctx;

  if (todayMeals.length === 0) {
    insights.push("Start logging your meals to get personalized insights.");
    return insights;
  }

  const totalCals = todayMeals.reduce(
    (sum, m) => sum + (m.calories_manual ?? m.calories_estimated ?? 0),
    0
  );

  if (totalCals > 0 && totalCals < 1400) {
    insights.push("You're eating quite light today. Make sure you're getting enough protein to preserve muscle.");
  } else if (totalCals > 2200) {
    insights.push("Today's intake is on the higher side — no worries, one day doesn't define the trend.");
  } else {
    insights.push("Today's intake looks balanced. You're on track.");
  }

  const hasBreakfast = todayMeals.some((m) => m.category === "breakfast");
  if (!hasBreakfast && new Date().getHours() > 10) {
    insights.push("You haven't logged breakfast yet. A protein-rich morning meal can reduce afternoon cravings.");
  }

  const lateNightSnacks = todayMeals.filter((m) => m.category === "late_night");
  if (lateNightSnacks.length > 0) {
    insights.push("You had a late-night snack today. Try keeping a glass of water handy to distinguish hunger from thirst.");
  }

  const hasProtein = todayMeals.some(
    (m) =>
      m.name.toLowerCase().includes("chicken") ||
      m.name.toLowerCase().includes("egg") ||
      m.name.toLowerCase().includes("yogurt") ||
      m.name.toLowerCase().includes("fish") ||
      (m.protein_g ?? 0) > 15
  );
  if (hasProtein) {
    insights.push("Protein intake today looks good — this helps with satiety and muscle preservation.");
  }

  if (todayLog?.water_ml && todayLog.water_ml >= 2000) {
    insights.push("Great hydration today! Staying well-hydrated supports fat metabolism.");
  } else if (todayLog?.water_ml && todayLog.water_ml < 1000) {
    insights.push("Try to drink more water today — it can reduce false hunger signals.");
  }

  if (recentLogs.length >= 3) {
    const avgCals =
      recentLogs.slice(-3).reduce((sum, l) => sum + (l.total_calories ?? 0), 0) / 3;
    if (avgCals > 0 && totalCals < avgCals * 0.85) {
      insights.push("You're eating less than your recent average — great progress on portion awareness.");
    }
  }

  if (weightEntries.length >= 2) {
    const latest = weightEntries[weightEntries.length - 1];
    const prev = weightEntries[weightEntries.length - 2];
    if (latest.weight_kg < prev.weight_kg) {
      const diff = (prev.weight_kg - latest.weight_kg).toFixed(1);
      insights.push(`Weight is down ${diff}kg since last measurement. Keep the momentum going!`);
    }
  }

  return insights.slice(0, 4);
}

export function generateWeeklyInsights(ctx: CoachContext): string[] {
  const insights: string[] = [];
  const { recentLogs, recentMeals, weightEntries } = ctx;

  if (recentLogs.length < 3) {
    insights.push("Log more days to unlock weekly pattern analysis.");
    return insights;
  }

  const avgCals =
    recentLogs.reduce((sum, l) => sum + (l.total_calories ?? 0), 0) / recentLogs.length;
  insights.push(`Your weekly average is ~${Math.round(avgCals)} kcal/day. ${avgCals < 1800 ? "You're in a consistent deficit — great work." : "Small adjustments could accelerate progress."}`);

  const lateNightCount = recentMeals.filter((m) => m.category === "late_night").length;
  if (lateNightCount >= 3) {
    insights.push("You've had late-night snacks several times this week. A protein snack before 8pm might help.");
  }

  const weightData = weightEntries.slice(-7);
  if (weightData.length >= 2) {
    const change = weightData[weightData.length - 1].weight_kg - weightData[0].weight_kg;
    if (change < -0.5) {
      insights.push(`You lost ~${Math.abs(change).toFixed(1)}kg this week — well within the healthy 0.5-1kg range.`);
    } else if (change > 0.5) {
      insights.push("Weight ticked up slightly this week — that's normal fluctuation. Focus on the 4-week trend.");
    }
  }

  const highHungerDays = recentLogs.filter((l) => (l.hunger_level ?? 0) >= 7).length;
  if (highHungerDays >= 2) {
    insights.push("Hunger was high on some days this week. Increasing fiber and protein at lunch may help.");
  }

  return insights;
}

export function getMotivationalMessage(weightLost: number, streakDays: number): string {
  if (weightLost >= 8) return "You've lost over 8kg — incredible consistency and dedication!";
  if (weightLost >= 5) return "5kg down is a real milestone. Your habits are genuinely changing.";
  if (weightLost >= 3) return "3kg lost already — you're proving sustainable change is possible.";
  if (weightLost >= 1) return "Every 100g is a real calorie deficit. You're moving in the right direction.";
  if (streakDays >= 7) return "7-day logging streak! Awareness is the foundation of all change.";
  if (streakDays >= 3) return "3 days in a row — building a tracking habit takes just this kind of consistency.";
  return "Every logged meal is data that helps you understand your body better.";
}
