"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Target, Bell, Moon, LogOut, Save, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { calculateTDEE } from "@/lib/utils/calories";

export default function SettingsPage() {
  const { user, updateUser, clearUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: user?.full_name ?? "",
    goal_weight: user?.goal_weight?.toString() ?? "75",
    start_weight: user?.start_weight?.toString() ?? "83",
    daily_calorie_target: user?.daily_calorie_target?.toString() ?? "1700",
  });
  const [isSaving, setIsSaving] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const updates = {
        full_name: form.full_name,
        goal_weight: parseFloat(form.goal_weight),
        start_weight: parseFloat(form.start_weight),
        daily_calorie_target: parseInt(form.daily_calorie_target),
      };
      await supabase.from("users").update(updates).eq("id", user.id);
      updateUser(updates);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    router.push("/login");
  };

  const tdee = calculateTDEE(parseFloat(form.start_weight) || 83);
  const deficit = tdee - (parseInt(form.daily_calorie_target) || 1700);

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and goals</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Display Name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
          {user?.email && (
            <div>
              <p className="text-sm font-medium mb-1.5">Email</p>
              <p className="text-sm text-muted-foreground bg-muted rounded-xl px-3 py-2">{user.email}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Goals</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Starting Weight (kg)" type="number" step="0.1" value={form.start_weight} onChange={(e) => update("start_weight", e.target.value)} />
            <Input label="Goal Weight (kg)" type="number" step="0.1" value={form.goal_weight} onChange={(e) => update("goal_weight", e.target.value)} />
          </div>
          <Input label="Daily Calorie Target (kcal)" type="number" value={form.daily_calorie_target} onChange={(e) => update("daily_calorie_target", e.target.value)} />
          <div className="rounded-xl bg-muted p-3 space-y-1">
            <p className="text-xs font-medium">Estimates at current settings</p>
            <p className="text-xs text-muted-foreground">TDEE: ~{tdee} kcal/day (sedentary, 178cm, 39yo male)</p>
            <p className="text-xs text-muted-foreground">Daily deficit: ~{deficit} kcal → ~{((deficit * 7) / 7700).toFixed(2)} kg/week</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {["light", "dark", "system"].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                  theme === t
                    ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                    : "border-border hover:border-green-300 text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} loading={isSaving} className="w-full bg-green-500 hover:bg-green-600 text-white gap-2 h-12">
        <Save className="h-4 w-4" /> Save Settings
      </Button>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
      >
        <LogOut className="h-4 w-4" /> Sign Out
      </button>
    </div>
  );
}
