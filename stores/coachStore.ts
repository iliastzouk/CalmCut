import { create } from "zustand";
import type { AIInsight, ChatMessage } from "@/types";

interface CoachState {
  insights: AIInsight[];
  chatMessages: ChatMessage[];
  isAnalyzing: boolean;
  isChatLoading: boolean;
  setInsights: (insights: AIInsight[]) => void;
  addInsight: (insight: AIInsight) => void;
  addChatMessage: (message: ChatMessage) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setChatLoading: (loading: boolean) => void;
  clearChat: () => void;
}

export const useCoachStore = create<CoachState>((set) => ({
  insights: [],
  chatMessages: [],
  isAnalyzing: false,
  isChatLoading: false,

  setInsights: (insights) => set({ insights }),
  addInsight: (insight) => set((state) => ({ insights: [insight, ...state.insights] })),

  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  setChatMessages: (messages) => set({ chatMessages: messages }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setChatLoading: (isChatLoading) => set({ isChatLoading }),
  clearChat: () => set({ chatMessages: [] }),
}));
