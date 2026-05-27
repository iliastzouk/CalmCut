import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useLogStore } from "@/stores/logStore";
import { useWeightStore } from "@/stores/weightStore";
import { getLast30Days } from "@/lib/utils/dates";

export function useAppData() {
  const { user } = useAuthStore();
  const { setDailyLogs, setMeals, setWaterEntries } = useLogStore();
  const { setEntries: setWeightEntries } = useWeightStore();

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const last30 = getLast30Days();
    const from = last30[0];
    const to = last30[last30.length - 1];

    Promise.all([
      supabase.from("daily_logs").select("*").eq("user_id", user.id).gte("date", from).lte("date", to).order("date"),
      supabase.from("meals").select("*").eq("user_id", user.id).gte("date", from).lte("date", to).order("created_at", { ascending: false }),
      supabase.from("weight_entries").select("*").eq("user_id", user.id).order("date"),
      supabase.from("water_entries").select("*").eq("user_id", user.id).gte("date", from).lte("date", to),
    ]).then(([logs, meals, weights, water]) => {
      if (logs.data) setDailyLogs(logs.data);
      if (meals.data) setMeals(meals.data);
      if (weights.data) setWeightEntries(weights.data);
      if (water.data) setWaterEntries(water.data);
    });
  }, [user?.id]);
}
