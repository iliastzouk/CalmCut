"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Heart, Zap, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { createClient } from "@/lib/supabase/client";
import type { FoodItem } from "@/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const PRESET_FOODS: Omit<FoodItem, "id" | "user_id" | "created_at">[] = [
  { name: "All Bran + Milk", calories_per_serving: 310, serving_size: "60g cereal + 250ml milk", protein_g: 12, carbs_g: 58, fat_g: 5, fiber_g: 14, is_favorite: true, usage_count: 0 },
  { name: "Protein Yogurt", calories_per_serving: 150, serving_size: "200g", protein_g: 20, carbs_g: 12, fat_g: 2, fiber_g: 0, is_favorite: true, usage_count: 0 },
  { name: "Brownie", calories_per_serving: 270, serving_size: "1 piece (~70g)", protein_g: 3, carbs_g: 38, fat_g: 13, fiber_g: 1, is_favorite: false, usage_count: 0 },
  { name: "Chia Pudding", calories_per_serving: 240, serving_size: "300ml", protein_g: 8, carbs_g: 28, fat_g: 10, fiber_g: 12, is_favorite: false, usage_count: 0 },
  { name: "2 Eggs (scrambled)", calories_per_serving: 180, serving_size: "2 large eggs", protein_g: 14, carbs_g: 1, fat_g: 13, fiber_g: 0, is_favorite: true, usage_count: 0 },
  { name: "Apple", calories_per_serving: 85, serving_size: "1 medium", protein_g: 0, carbs_g: 22, fat_g: 0, fiber_g: 4, is_favorite: false, usage_count: 0 },
  { name: "Chicken Souvlaki", calories_per_serving: 620, serving_size: "2 skewers + pita", protein_g: 45, carbs_g: 42, fat_g: 18, fiber_g: 2, is_favorite: true, usage_count: 0 },
  { name: "Crepe (Turkey & Cheese)", calories_per_serving: 520, serving_size: "1 large crepe", protein_g: 28, carbs_g: 48, fat_g: 22, fiber_g: 1, is_favorite: false, usage_count: 0 },
  { name: "Burger", calories_per_serving: 700, serving_size: "1 full burger", protein_g: 35, carbs_g: 58, fat_g: 32, fiber_g: 3, is_favorite: false, usage_count: 0 },
  { name: "Chicken + Rice", calories_per_serving: 550, serving_size: "150g chicken + 150g cooked rice", protein_g: 42, carbs_g: 55, fat_g: 10, fiber_g: 2, is_favorite: true, usage_count: 0 },
];

export default function MealsPage() {
  const { user } = useAuthStore();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newFood, setNewFood] = useState({ name: "", calories_per_serving: "", serving_size: "", protein_g: "", fiber_g: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    createClient().from("food_items").select("*").eq("user_id", user.id).order("usage_count", { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        setFoods(data);
      } else {
        setFoods(PRESET_FOODS.map((f, i) => ({ ...f, id: `preset-${i}`, user_id: user.id, created_at: new Date().toISOString() })));
      }
      setIsLoading(false);
    });
  }, [user]);

  const filtered = foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  const favorites = filtered.filter((f) => f.is_favorite);
  const others = filtered.filter((f) => !f.is_favorite);

  const handleSaveFood = async () => {
    if (!user || !newFood.name) return;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        user_id: user.id,
        name: newFood.name,
        calories_per_serving: parseInt(newFood.calories_per_serving) || 0,
        serving_size: newFood.serving_size || "1 serving",
        protein_g: parseFloat(newFood.protein_g) || null,
        fiber_g: parseFloat(newFood.fiber_g) || null,
      };
      const { data, error } = await supabase.from("food_items").insert(payload).select().single();
      if (error) throw error;
      setFoods((prev) => [data, ...prev]);
      setAddOpen(false);
      setNewFood({ name: "", calories_per_serving: "", serving_size: "", protein_g: "", fiber_g: "" });
      toast.success("Food saved to library!");
    } catch {
      toast.error("Failed to save food");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFavorite = async (food: FoodItem) => {
    setFoods((prev) => prev.map((f) => f.id === food.id ? { ...f, is_favorite: !f.is_favorite } : f));
    if (!food.id.startsWith("preset-")) {
      await createClient().from("food_items").update({ is_favorite: !food.is_favorite }).eq("id", food.id);
    }
  };

  const FoodCard = ({ food }: { food: FoodItem }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-sm leading-tight">{food.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{food.serving_size}</p>
        </div>
        <button onClick={() => toggleFavorite(food)} className="ml-2">
          <Heart className={`h-4 w-4 transition-colors ${food.is_favorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-400"}`} />
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <p className="text-base font-bold">{food.calories_per_serving}</p>
          <p className="text-xs text-muted-foreground">kcal</p>
        </div>
        {food.protein_g && <Badge variant="green" className="text-xs">P: {food.protein_g}g</Badge>}
        {food.fiber_g && <Badge variant="blue" className="text-xs">F: {food.fiber_g}g</Badge>}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meal Library</h1>
          <p className="text-sm text-muted-foreground">{foods.length} saved foods</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-green-500 hover:bg-green-600 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Food
        </Button>
      </div>

      <Input
        placeholder="Search foods..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="h-4 w-4" />}
      />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {favorites.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                <h2 className="text-sm font-semibold">Favorites</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favorites.map((food) => <FoodCard key={food.id} food={food} />)}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">All Foods</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {others.map((food) => <FoodCard key={food.id} food={food} />)}
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add to Library</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input label="Food Name" placeholder="e.g. Oat pancakes" value={newFood.name} onChange={(e) => setNewFood((p) => ({ ...p, name: e.target.value }))} />
            <Input label="Calories (kcal)" type="number" value={newFood.calories_per_serving} onChange={(e) => setNewFood((p) => ({ ...p, calories_per_serving: e.target.value }))} />
            <Input label="Serving Size" placeholder="e.g. 2 pancakes (150g)" value={newFood.serving_size} onChange={(e) => setNewFood((p) => ({ ...p, serving_size: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Protein (g)" type="number" value={newFood.protein_g} onChange={(e) => setNewFood((p) => ({ ...p, protein_g: e.target.value }))} />
              <Input label="Fiber (g)" type="number" value={newFood.fiber_g} onChange={(e) => setNewFood((p) => ({ ...p, fiber_g: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
              <Button loading={isSaving} onClick={handleSaveFood} disabled={!newFood.name} className="flex-1 bg-green-500 hover:bg-green-600 text-white">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
