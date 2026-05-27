import { create } from "zustand";
import type { WeightEntry } from "@/types";
import { smoothWeightData } from "@/lib/utils/calories";

interface WeightState {
  entries: WeightEntry[];
  isLoading: boolean;
  setEntries: (entries: WeightEntry[]) => void;
  addEntry: (entry: WeightEntry) => void;
  updateEntry: (id: string, updates: Partial<WeightEntry>) => void;
  deleteEntry: (id: string) => void;
  setLoading: (loading: boolean) => void;
  getLatestWeight: () => number | null;
  getSmoothedData: () => { date: string; weight: number; smoothed: number }[];
  get7DayAverage: () => number | null;
  getWeeklyChange: () => number | null;
}

export const useWeightStore = create<WeightState>((set, get) => ({
  entries: [],
  isLoading: false,

  setEntries: (entries) => set({ entries: [...entries].sort((a, b) => a.date.localeCompare(b.date)) }),

  addEntry: (entry) =>
    set((state) => ({
      entries: [...state.entries, entry].sort((a, b) => a.date.localeCompare(b.date)),
    })),

  updateEntry: (id, updates) =>
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),

  deleteEntry: (id) =>
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),

  setLoading: (isLoading) => set({ isLoading }),

  getLatestWeight: () => {
    const { entries } = get();
    if (!entries.length) return null;
    return entries[entries.length - 1].weight_kg;
  },

  getSmoothedData: () => {
    const { entries } = get();
    return smoothWeightData(entries.map((e) => ({ date: e.date, weight: e.weight_kg })));
  },

  get7DayAverage: () => {
    const { entries } = get();
    const last7 = entries.slice(-7);
    if (!last7.length) return null;
    return Math.round((last7.reduce((sum, e) => sum + e.weight_kg, 0) / last7.length) * 10) / 10;
  },

  getWeeklyChange: () => {
    const { entries } = get();
    if (entries.length < 7) return null;
    const last7 = entries.slice(-7);
    return Math.round((last7[last7.length - 1].weight_kg - last7[0].weight_kg) * 10) / 10;
  },
}));
