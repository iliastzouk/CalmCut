"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakCardProps {
  streak: number;
  message: string;
}

export function StreakCard({ streak, message }: StreakCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 p-4 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flame className="h-6 w-6" />
        </motion.div>
        <div>
          <p className="text-2xl font-bold leading-none">{streak}</p>
          <p className="text-xs font-medium opacity-90">day streak</p>
        </div>
      </div>
      <p className="text-xs mt-2 opacity-90 leading-relaxed">{message}</p>
    </motion.div>
  );
}
