import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PortfolioItem, WatchlistItem, ChatMessage } from "@/types";

interface AppStore {
  // Portfolio
  portfolio: PortfolioItem[];
  addPortfolioItem: (item: PortfolioItem) => void;
  removePortfolioItem: (id: string) => void;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => void;

  // Watchlist
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (symbol: string) => void;

  // AI Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      portfolio: [],
      addPortfolioItem: (item) =>
        set((s) => ({ portfolio: [...s.portfolio, item] })),
      removePortfolioItem: (id) =>
        set((s) => ({ portfolio: s.portfolio.filter((p) => p.id !== id) })),
      updatePortfolioItem: (id, updates) =>
        set((s) => ({
          portfolio: s.portfolio.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      watchlist: [],
      addToWatchlist: (item) =>
        set((s) => {
          if (s.watchlist.find((w) => w.symbol === item.symbol)) return s;
          return { watchlist: [...s.watchlist, item] };
        }),
      removeFromWatchlist: (symbol) =>
        set((s) => ({ watchlist: s.watchlist.filter((w) => w.symbol !== symbol) })),

      chatMessages: [],
      addChatMessage: (message) =>
        set((s) => ({ chatMessages: [...s.chatMessages, message] })),
      clearChat: () => set({ chatMessages: [] }),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: "investhub-store", partialize: (s) => ({ portfolio: s.portfolio, watchlist: s.watchlist }) }
  )
);
