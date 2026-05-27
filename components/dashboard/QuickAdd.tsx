"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Scale, Cookie, Droplets, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { AddMealDialog } from "@/components/log/AddMealDialog";
import { AddWeightDialog } from "@/components/weight/AddWeightDialog";
import { AddWaterDialog } from "@/components/log/AddWaterDialog";

const quickActions = [
  { label: "Meal", icon: Utensils, color: "bg-green-500", dialog: "meal" },
  { label: "Weight", icon: Scale, color: "bg-blue-500", dialog: "weight" },
  { label: "Snack", icon: Cookie, color: "bg-amber-500", dialog: "snack" },
  { label: "Water", icon: Droplets, color: "bg-cyan-500", dialog: "water" },
];

export function QuickAdd() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const handleAction = (dialog: string) => {
    setIsOpen(false);
    setActiveDialog(dialog);
  };

  return (
    <>
      <div className="relative">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-14 right-0 flex flex-col gap-2 items-end"
            >
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAction(action.dialog)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-medium text-sm shadow-lg active:scale-95 transition-transform",
                    action.color
                  )}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-2xl shadow-lg h-12 w-12 bg-green-500 hover:bg-green-600"
          size="icon"
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
            {isOpen ? <X className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
          </motion.div>
        </Button>
      </div>

      <AddMealDialog
        open={activeDialog === "meal" || activeDialog === "snack"}
        defaultCategory={activeDialog === "snack" ? "snack" : "breakfast"}
        onClose={() => setActiveDialog(null)}
      />
      <AddWeightDialog
        open={activeDialog === "weight"}
        onClose={() => setActiveDialog(null)}
      />
      <AddWaterDialog
        open={activeDialog === "water"}
        onClose={() => setActiveDialog(null)}
      />
    </>
  );
}
