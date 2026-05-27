export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  goal_weight: number;
  start_weight: number;
  current_weight?: number;
  daily_calorie_target: number;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  morning_weight?: number;
  total_calories?: number;
  water_ml?: number;
  hunger_level?: number;
  craving_level?: number;
  mood?: number;
  notes?: string;
  ai_summary?: string;
  created_at: string;
}

export type MealCategory = "breakfast" | "snack" | "lunch" | "dinner" | "late_night";

export interface Meal {
  id: string;
  user_id: string;
  daily_log_id: string;
  date: string;
  name: string;
  description?: string;
  category: MealCategory;
  calories_manual?: number;
  calories_estimated?: number;
  calories_confidence?: "low" | "medium" | "high";
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  image_url?: string;
  is_favorite?: boolean;
  tags?: string[];
  created_at: string;
}

export interface FoodItem {
  id: string;
  user_id: string;
  name: string;
  calories_per_serving: number;
  serving_size: string;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  is_favorite?: boolean;
  usage_count?: number;
  created_at: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  body_fat_pct?: number;
  notes?: string;
  created_at: string;
}

export interface WaterEntry {
  id: string;
  user_id: string;
  date: string;
  amount_ml: number;
  created_at: string;
}

export interface HungerEntry {
  id: string;
  user_id: string;
  daily_log_id?: string;
  date: string;
  time_of_day: string;
  hunger_level: number;
  context?: string;
  created_at: string;
}

export interface CravingEntry {
  id: string;
  user_id: string;
  date: string;
  craving_level: number;
  craving_for?: string;
  context?: string;
  was_satisfied?: boolean;
  created_at: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  date: string;
  type: "daily" | "weekly" | "pattern" | "suggestion";
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface DashboardStats {
  currentWeight: number;
  goalWeight: number;
  startWeight: number;
  weightLost: number;
  weightToGo: number;
  todayCalories: number;
  weeklyAvgCalories: number;
  streakDays: number;
  todayWater: number;
  bmi: number;
  weeklyWeightChange: number;
}

export interface WeeklyAnalysis {
  weekStart: string;
  weekEnd: string;
  avgCalories: number;
  avgWeight: number;
  totalWeightChange: number;
  loggingStreak: number;
  topInsights: string[];
}

export interface CalorieEstimate {
  min: number;
  max: number;
  estimate: number;
  confidence: "low" | "medium" | "high";
  reasoning: string;
}
