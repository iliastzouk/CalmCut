"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, TrendingUp, Bot, Utensils, Settings, Scale, Droplets } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Daily Log", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/weight", label: "Weight", icon: Scale },
  { href: "/meals", label: "Meal Library", icon: Utensils },
  { href: "/coach", label: "AI Coach", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background/95 backdrop-blur-md fixed inset-y-0 left-0 z-40">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500">
          <Scale className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-base leading-none">CalmCut</p>
          <p className="text-xs text-muted-foreground">Nutrition Tracker</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative block">
              {isActive && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute inset-0 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                isActive
                  ? "text-green-700 dark:text-green-300 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
                <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="rounded-xl bg-green-50 dark:bg-green-950 p-3">
          <p className="text-xs font-semibold text-green-700 dark:text-green-300">Target: 75kg</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Progress tracking active</p>
        </div>
      </div>
    </aside>
  );
}
