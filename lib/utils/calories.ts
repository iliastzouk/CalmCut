import type { CalorieEstimate } from "@/types";

const MEAL_CALORIE_MAP: Record<string, CalorieEstimate> = {
  "all bran": { min: 280, max: 350, estimate: 310, confidence: "high", reasoning: "All Bran cereal ~160kcal + 250ml milk ~120kcal" },
  "protein yogurt": { min: 130, max: 180, estimate: 150, confidence: "high", reasoning: "Greek protein yogurt ~150kcal per 200g serving" },
  "brownie": { min: 200, max: 350, estimate: 270, confidence: "medium", reasoning: "Standard brownie piece 60-80g" },
  "chia pudding": { min: 200, max: 280, estimate: 240, confidence: "high", reasoning: "Chia seeds + milk/coconut milk + fruit" },
  "eggs": { min: 180, max: 320, estimate: 250, confidence: "medium", reasoning: "2-3 eggs scrambled or fried" },
  "apple": { min: 70, max: 100, estimate: 85, confidence: "high", reasoning: "Medium apple ~85kcal" },
  "souvlaki": { min: 500, max: 750, estimate: 620, confidence: "medium", reasoning: "2 chicken skewers + pita + tzatziki" },
  "crepe": { min: 400, max: 650, estimate: 520, confidence: "medium", reasoning: "Crepe with turkey and cheese" },
  "burger": { min: 550, max: 900, estimate: 700, confidence: "medium", reasoning: "Beef burger with bun and toppings" },
  "chicken rice": { min: 450, max: 650, estimate: 550, confidence: "high", reasoning: "Chicken breast 150g + rice 150g cooked" },
  "chicken + rice": { min: 450, max: 650, estimate: 550, confidence: "high", reasoning: "Chicken breast 150g + rice 150g cooked" },
};

export function estimateCalories(mealName: string): CalorieEstimate {
  const normalized = mealName.toLowerCase().trim();
  for (const [key, estimate] of Object.entries(MEAL_CALORIE_MAP)) {
    if (normalized.includes(key)) return estimate;
  }
  return { min: 200, max: 600, estimate: 400, confidence: "low", reasoning: "Unable to identify meal specifically" };
}

export function calculateBMI(weightKg: number, heightCm: number = 178): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calculateTDEE(
  weightKg: number,
  heightCm: number = 178,
  age: number = 39,
  activityMultiplier: number = 1.2
): number {
  // Mifflin-St Jeor for male
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  return Math.round(bmr * activityMultiplier);
}

export function calculateDeficit(tdee: number, consumed: number): number {
  return tdee - consumed;
}

export function estimateFatLossPerWeek(weeklyDeficit: number): number {
  // ~7700 kcal per kg of fat
  return Math.round((weeklyDeficit / 7700) * 100) / 100;
}

export function getWeightProgressPct(start: number, current: number, goal: number): number {
  if (start === goal) return 100;
  const totalToLose = start - goal;
  const lost = start - current;
  return Math.min(100, Math.max(0, Math.round((lost / totalToLose) * 100)));
}

export function smoothWeightData(weights: { date: string; weight: number }[]): { date: string; weight: number; smoothed: number }[] {
  return weights.map((entry, i) => {
    const windowStart = Math.max(0, i - 3);
    const windowEnd = Math.min(weights.length - 1, i + 3);
    const window = weights.slice(windowStart, windowEnd + 1);
    const avg = window.reduce((sum, w) => sum + w.weight, 0) / window.length;
    return { ...entry, smoothed: Math.round(avg * 10) / 10 };
  });
}
