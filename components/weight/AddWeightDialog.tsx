"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useWeightStore } from "@/stores/weightStore";
import { useAuthStore } from "@/stores/authStore";
import { todayISO } from "@/lib/utils/dates";
import { toast } from "sonner";

interface AddWeightDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddWeightDialog({ open, onClose }: AddWeightDialogProps) {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { addEntry, getLatestWeight } = useWeightStore();

  const latestWeight = getLatestWeight();
  const diff = weight && latestWeight ? parseFloat(weight) - latestWeight : null;

  const handleSubmit = async () => {
    if (!weight || !user) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("weight_entries")
        .insert({
          user_id: user.id,
          date: todayISO(),
          weight_kg: parseFloat(weight),
          body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      addEntry(data);
      toast.success(`${weight}kg logged!`);
      setWeight("");
      setBodyFat("");
      setNotes("");
      onClose();
    } catch {
      toast.error("Failed to log weight");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-500" /> Log Weight
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {latestWeight && (
            <div className="rounded-xl bg-muted p-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Last logged</p>
              <p className="font-semibold">{latestWeight} kg</p>
            </div>
          )}

          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            placeholder="e.g. 82.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />

          {diff !== null && (
            <div className="flex items-center justify-center gap-2 py-2">
              {diff < 0 ? (
                <>
                  <TrendingDown className="h-5 w-5 text-green-500" />
                  <p className="text-lg font-bold text-green-600">{diff.toFixed(1)} kg</p>
                  <p className="text-sm text-muted-foreground">from last weigh-in</p>
                </>
              ) : diff > 0 ? (
                <>
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  <p className="text-lg font-bold text-amber-600">+{diff.toFixed(1)} kg</p>
                  <p className="text-sm text-muted-foreground">normal fluctuation</p>
                </>
              ) : (
                <>
                  <Minus className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Same as last weigh-in</p>
                </>
              )}
            </div>
          )}

          <Input
            label="Body Fat % (optional)"
            type="number"
            step="0.1"
            placeholder="e.g. 22"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!weight}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Log Weight
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
