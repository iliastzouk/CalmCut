import { create } from "zustand";
import type { DailyLog, Meal, WaterEntry } from "@/types";
import { todayISO } from "@/lib/utils/dates";

interface LogState {
  dailyLogs: DailyLog[];
  meals: Meal[];
  waterEntries: WaterEntry[];
  selectedDate: string;
  isLoading: boolean;
  setDailyLogs: (logs: DailyLog[]) => void;
  setMeals: (meals: Meal[]) => void;
  setWaterEntries: (entries: WaterEntry[]) => void;
  setSelectedDate: (date: string) => void;
  addMeal: (meal: Meal) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  addWater: (entry: WaterEntry) => void;
  updateDailyLog: (id: string, updates: Partial<DailyLog>) => void;
  setLoading: (loading: boolean) => void;
  getTodayLog: () => DailyLog | undefined;
  getTodayMeals: () => Meal[];
  getTodayWater: () => number;
}

export const useLogStore = create<LogState>((set, get) => ({
  dailyLogs: [],
  meals: [],
  waterEntries: [],
  selectedDate: todayISO(),
  isLoading: false,

  setDailyLogs: (logs) => set({ dailyLogs: logs }),
  setMeals: (meals) => set({ meals }),
  setWaterEntries: (entries) => set({ waterEntries: entries }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setLoading: (isLoading) => set({ isLoading }),

  addMeal: (meal) =>
    set((state) => ({ meals: [meal, ...state.meals] })),

  updateMeal: (id, updates) =>
    set((state) => ({
      meals: state.meals.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  deleteMeal: (id) =>
    set((state) => ({ meals: state.meals.filter((m) => m.id !== id) })),

  addWater: (entry) =>
    set((state) => ({ waterEntries: [entry, ...state.waterEntries] })),

  updateDailyLog: (id, updates) =>
    set((state) => ({
      dailyLogs: state.dailyLogs.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    })),

  getTodayLog: () => {
    const { dailyLogs, selectedDate } = get();
    return dailyLogs.find((l) => l.date === selectedDate);
  },

  getTodayMeals: () => {
    const { meals, selectedDate } = get();
    return meals.filter((m) => m.date === selectedDate);
  },

  getTodayWater: () => {
    const { waterEntries, selectedDate } = get();
    return waterEntries
      .filter((w) => w.date === selectedDate)
      .reduce((sum, w) => sum + w.amount_ml, 0);
  },
}));
