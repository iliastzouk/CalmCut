"use client";

import { Bell, Moon, Sun, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils/dates";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { user, clearUser } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-background/95 backdrop-blur-md md:ml-64">
      <div>
        <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
        <p className="font-semibold text-lg leading-tight hidden sm:block">
          {user?.full_name ? `Hey, ${user.full_name.split(" ")[0]} 👋` : "Welcome back"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-xl"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon-sm" className="rounded-xl">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 cursor-pointer" onClick={handleLogout}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name ?? ""} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <User className="h-4 w-4 text-green-700 dark:text-green-300" />
          )}
        </div>
      </div>
    </header>
  );
}
