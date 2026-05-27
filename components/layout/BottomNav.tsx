"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, PlusCircle, TrendingUp, Bot } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/log", label: "Log", icon: BookOpen },
  { href: "/log?add=true", label: "Add", icon: PlusCircle, isAdd: true },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/coach", label: "AI Coach", icon: Bot },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));
          const Icon = item.icon;

          if (item.isAdd) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 shadow-lg shadow-green-200 dark:shadow-green-900 transition-transform active:scale-95">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 min-w-[48px]">
              <div className="relative flex h-8 w-8 items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 rounded-xl bg-green-100 dark:bg-green-900"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative h-5 w-5 transition-colors",
                    isActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                  )}
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
