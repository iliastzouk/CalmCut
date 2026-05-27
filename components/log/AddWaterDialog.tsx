"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Droplets } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLogStore } from "@/stores/logStore";
import { useAuthStore } from "@/stores/authStore";
import { todayISO } from "@/lib/utils/dates";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface AddWaterDialogProps {
  open: boolean;
  onClose: () => void;
}

const AMOUNTS = [150, 250, 330, 500, 750, 1000];

export function AddWaterDialog({ open, onClose }: AddWaterDialogProps) {
  const [selected, setSelected] = useState(250);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { addWater, selectedDate } = useLogStore();

  const handleSubmit = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const date = selectedDate || todayISO();

      const { data, error } = await supabase
        .from("water_entries")
        .insert({ user_id: user.id, date, amount_ml: selected })
        .select()
        .single();

      if (error) throw error;
      addWater(data);
      toast.success(`+${selected}ml water logged!`);
      onClose();
    } catch (err) {
      toast.error("Failed to log water");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-500" /> Log Water
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {AMOUNTS.map((ml) => (
              <button
                key={ml}
                onClick={() => setSelected(ml)}
                className={cn(
                  "py-3 rounded-xl border-2 text-sm font-medium transition-all",
                  selected === ml
                    ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300"
                    : "border-border hover:border-cyan-300 text-muted-foreground"
                )}
              >
                {ml}ml
              </button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-cyan-600">{selected}ml</p>
            <p className="text-xs text-muted-foreground">= {(selected / 1000).toFixed(2)}L</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} loading={isLoading} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">
              Log Water
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
