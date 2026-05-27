"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Mail, Lock, User, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    currentWeight: "83",
    goalWeight: "75",
    targetCalories: "1700",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        await supabase.from("users").insert({
          id: authData.user.id,
          email: form.email,
          full_name: form.name,
          goal_weight: parseFloat(form.goalWeight),
          start_weight: parseFloat(form.currentWeight),
          current_weight: parseFloat(form.currentWeight),
          daily_calorie_target: parseInt(form.targetCalories),
        });

        await supabase.from("weight_entries").insert({
          user_id: authData.user.id,
          date: new Date().toISOString().split("T")[0],
          weight_kg: parseFloat(form.currentWeight),
        });
      }

      toast.success("Account created! Welcome to CalmCut.");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 via-background to-emerald-50 dark:from-green-950 dark:via-background dark:to-emerald-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-8">
          <Scale className="h-7 w-7 text-green-500" />
          <span className="text-2xl font-bold">CalmCut</span>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-green-500" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-2xl font-bold">Create your account</h2>
              <p className="text-muted-foreground text-sm mt-1">Start your sustainable journey</p>
            </div>

            <Input
              label="Full name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              icon={<Lock className="h-4 w-4" />}
            />

            <Button
              className="w-full h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl"
              onClick={() => setStep(2)}
              disabled={!form.name || !form.email || form.password.length < 6}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-2xl font-bold">Your goals</h2>
              <p className="text-muted-foreground text-sm mt-1">We'll personalize everything for you</p>
            </div>

            <div className="rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">Default: Office worker profile</p>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Male, 39yo, sedentary lifestyle, 83kg → 75kg target
              </p>
            </div>

            <Input
              label="Current weight (kg)"
              type="number"
              step="0.1"
              value={form.currentWeight}
              onChange={(e) => update("currentWeight", e.target.value)}
            />
            <Input
              label="Goal weight (kg)"
              type="number"
              step="0.1"
              value={form.goalWeight}
              onChange={(e) => update("goalWeight", e.target.value)}
            />
            <Input
              label="Daily calorie target (kcal)"
              type="number"
              value={form.targetCalories}
              onChange={(e) => update("targetCalories", e.target.value)}
            />

            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                At {form.targetCalories} kcal/day with a sedentary TDEE of ~2,100 kcal, you're targeting a deficit of ~{Math.round(2100 - parseInt(form.targetCalories || "1700"))} kcal/day — roughly {((2100 - parseInt(form.targetCalories || "1700")) / 7700 * 7).toFixed(2)}kg/week fat loss.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button
                loading={isLoading}
                onClick={handleRegister}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                Start Journey
              </Button>
            </div>
          </motion.div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
