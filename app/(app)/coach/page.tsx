"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, RefreshCw, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatBubble } from "@/components/coach/ChatBubble";
import { InsightCard } from "@/components/coach/InsightCard";
import { useCoachStore } from "@/stores/coachStore";
import { useLogStore } from "@/stores/logStore";
import { useWeightStore } from "@/stores/weightStore";
import { useAuthStore } from "@/stores/authStore";
import { createClient } from "@/lib/supabase/client";
import { generateDailyInsights, generateWeeklyInsights, getMotivationalMessage } from "@/lib/ai/coach";
import { getLast7Days } from "@/lib/utils/dates";
import type { ChatMessage } from "@/types";

const QUICK_PROMPTS = [
  "How many calories in a crepe with turkey?",
  "Why am I so hungry around 11am?",
  "Is it okay to have a brownie daily?",
  "Help me stop late-night snacking",
  "What protein foods keep me full?",
  "How much should I eat today?",
];

function generateAIResponse(message: string, ctx: { latestWeight?: number; goalWeight?: number; todayCalories?: number; target?: number }): string {
  const msg = message.toLowerCase();

  if (msg.includes("crepe") && (msg.includes("turkey") || msg.includes("calor"))) {
    return "A crepe with turkey and cheese is typically around 480–620 kcal, depending on size and fillings. If it's a large street-style crepe, lean toward the higher end (~600 kcal). Adding extra cheese or sauce can push it to 700+. A good estimate to log: 520 kcal.";
  }
  if (msg.includes("brownie")) {
    return "A single brownie (about 60–80g) is typically 250–320 kcal. The key insight? Daily small-portion sweets often work better than weekend binges. One brownie fits easily in a 1700 kcal day. Just log it and move on — no guilt needed.";
  }
  if (msg.includes("hungry") && msg.includes("11")) {
    return "11am hunger is super common for office workers. It usually signals your breakfast wasn't protein-rich enough. Try adding eggs or Greek yogurt to breakfast — protein digests slowly and keeps you full through the morning. A second factor: even mild dehydration mimics hunger, so drink 500ml water before reaching for a snack.";
  }
  if (msg.includes("late-night") || msg.includes("late night") || msg.includes("snack")) {
    return "Late-night snacking usually has two causes: 1) You under-ate during the day and your body is genuinely hungry, or 2) It's habitual/emotional eating. For cause #1: increase lunch calories slightly. For cause #2: try a 10-minute 'delay and distract' — drink herbal tea, do 10 pushups, read for 5 minutes. Most urges pass in 10 minutes.";
  }
  if (msg.includes("protein")) {
    return "Best high-satiety protein sources for office workers: Greek yogurt (15–18g protein, ~150 kcal), eggs (6g/egg, very filling), chicken breast (30g per 100g), cottage cheese (11g/100g), and protein bars as backup. Aim for 20–30g protein per meal to feel full for 3–4 hours.";
  }
  if (msg.includes("how much") && msg.includes("eat")) {
    const targetCals = ctx.target ?? 1700;
    return `At your current target of ~${targetCals} kcal/day, spread it roughly: Breakfast 300–400 kcal, morning snack 150 kcal, lunch 500–600 kcal, afternoon snack 150–200 kcal, dinner 400–500 kcal. That keeps you satisfied all day without big energy crashes.`;
  }
  if (msg.includes("souvlaki") || msg.includes("skewer")) {
    return "Two chicken souvlaki skewers with pita and tzatziki: roughly 580–750 kcal. The biggest variable is pita size and tzatziki amount. Without pita, it's about 380–450 kcal. A reasonable log: 650 kcal for the full portion.";
  }
  if (msg.includes("plateau")) {
    return "Plateaus usually mean your metabolism has adapted. Two strategies that work: 1) Try a 'diet break' — eat at maintenance for 1 week, which resets leptin and reduces adaptive thermogenesis. 2) Add 2,000 steps/day to increase your TDEE without changing your diet. The scale often drops after a diet break.";
  }
  if (msg.includes("cheat") || msg.includes("bad day")) {
    return "One high-calorie day doesn't change your fat tissue in any meaningful way — it mainly shows up as water retention from extra carbs and sodium. The research is clear: what matters is the weekly average, not any single day. Log it honestly, don't restrict the next day (restriction leads to more restriction), and return to your normal routine tomorrow.";
  }

  const weight = ctx.latestWeight ?? 83;
  const goal = ctx.goalWeight ?? 75;
  const toGo = (weight - goal).toFixed(1);
  return `Great question. Based on your current progress (${weight}kg, targeting ${goal}kg — ${toGo}kg to go), here's what I'd focus on: consistency over perfection. Log your meals honestly, eat enough protein to stay satiated (aim for 100–130g/day), and trust the weekly average trend rather than daily scale fluctuations. What specific aspect of your nutrition would you like to dig into?`;
}

export default function CoachPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatMessages, addChatMessage, isChatLoading, setChatLoading } = useCoachStore();
  const { dailyLogs, meals } = useLogStore();
  const { entries: weightEntries } = useWeightStore();
  const { user } = useAuthStore();

  const dailyInsights = generateDailyInsights({
    recentLogs: dailyLogs.slice(-7),
    recentMeals: meals.slice(-20),
    weightEntries,
    todayLog: dailyLogs[dailyLogs.length - 1],
    todayMeals: meals.filter((m) => m.date === new Date().toISOString().split("T")[0]),
  });

  const weeklyInsights = generateWeeklyInsights({
    recentLogs: dailyLogs.slice(-7),
    recentMeals: meals.slice(-50),
    weightEntries,
  });

  const latestWeight = weightEntries[weightEntries.length - 1]?.weight_kg ?? user?.start_weight ?? 83;
  const motivational = getMotivationalMessage(
    Math.max(0, (user?.start_weight ?? 83) - latestWeight),
    dailyLogs.length
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = async (msg?: string) => {
    const text = (msg || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setInput("");
    setChatLoading(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const response = generateAIResponse(text, {
      latestWeight,
      goalWeight: user?.goal_weight ?? 75,
      todayCalories: meals.filter((m) => m.date === new Date().toISOString().split("T")[0])
        .reduce((s, m) => s + (m.calories_manual ?? m.calories_estimated ?? 0), 0),
      target: user?.daily_calorie_target ?? 1700,
    });

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      created_at: new Date().toISOString(),
    };
    addChatMessage(aiMsg);
    setChatLoading(false);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">AI Coach</h1>
        <p className="text-sm text-muted-foreground">Your personal nutrition advisor</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 p-4 text-white"
      >
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-5 w-5" />
          <p className="font-semibold">Coach CalmCut</p>
          <div className="h-2 w-2 rounded-full bg-green-400 ml-auto" />
          <span className="text-xs text-purple-200">Online</span>
        </div>
        <p className="text-sm text-purple-100 leading-relaxed">{motivational}</p>
      </motion.div>

      <Tabs defaultValue="chat">
        <TabsList className="w-full">
          <TabsTrigger value="chat" className="flex-1 gap-2">
            <MessageSquare className="h-3.5 w-3.5" /> Chat
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex-1 gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Daily
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1 gap-2">
            <TrendingUp className="h-3.5 w-3.5" /> Weekly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-3 mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="h-80 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <Bot className="h-10 w-10 text-purple-400" />
                    <p className="text-sm text-muted-foreground">
                      Ask me anything about nutrition, calories, or your progress.
                    </p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <ChatBubble key={msg.id} message={msg} index={i} />
                ))}
                {isChatLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex gap-1 bg-muted rounded-2xl px-4 py-3">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-2 w-2 rounded-full bg-muted-foreground"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border p-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask your coach..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="rounded-xl"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isChatLoading}
                    className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white px-3"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Quick questions</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950 hover:text-purple-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-2 mt-4">
          <p className="text-sm font-semibold text-muted-foreground mb-3">Today's observations</p>
          {dailyInsights.length > 0 ? (
            dailyInsights.map((insight, i) => (
              <InsightCard key={i} insight={insight} index={i} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Log some meals to get personalized daily insights</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-2 mt-4">
          <p className="text-sm font-semibold text-muted-foreground mb-3">This week's patterns</p>
          {weeklyInsights.length > 0 ? (
            weeklyInsights.map((insight, i) => (
              <InsightCard key={i} insight={insight} index={i} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Log at least 3 days to unlock weekly pattern analysis</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
