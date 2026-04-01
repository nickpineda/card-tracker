import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Moon, Sun } from "lucide-react";

const suits = [
  { key: "spades", symbol: "♠" },
  { key: "hearts", symbol: "♥" },
  { key: "diamonds", symbol: "♦" },
  { key: "clubs", symbol: "♣" },
];

const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const summaryValues = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const STORAGE_KEY = "card-tracker-used-cards-v3";
const THEME_KEY = "card-tracker-theme-v1";

const allCards = suits.flatMap((suit) =>
  ranks.map((rank) => ({
    id: `${rank}${suit.symbol}`,
    rank,
    suit: suit.symbol,
    suitKey: suit.key,
    valueLabel: ["10", "J", "Q", "K"].includes(rank) ? "10" : rank,
  }))
);

const suitAccent = {
  dark: {
    spades: "text-zinc-100",
    hearts: "text-rose-300",
    diamonds: "text-rose-300",
    clubs: "text-zinc-100",
  },
  light: {
    spades: "text-slate-800",
    hearts: "text-rose-600",
    diamonds: "text-rose-600",
    clubs: "text-slate-800",
  },
};

function getPalette(isDark) {
  return isDark
    ? {
        page: "bg-black text-white",
        heroCard: "from-zinc-900 to-zinc-950 border-white/10",
        softPanel: "bg-white/5",
        softButton: "bg-white/8 text-white hover:bg-white/15",
        progress: "bg-white",
        primaryText: "text-white",
        secondaryText: "text-zinc-200",
        mutedText: "text-zinc-300",
        subtleText: "text-zinc-400",
        iconWrap: "bg-white/5",
        badge: "bg-white/10 text-white hover:bg-white/10",
        badgeMuted: "bg-white/5 text-zinc-300 hover:bg-white/5",
        tileBg: "bg-black/20",
      }
    : {
        page: "bg-gradient-to-b from-slate-50 to-white text-slate-900",
        heroCard: "from-white to-slate-50 border-slate-200",
        softPanel: "bg-slate-100",
        softButton: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        progress: "bg-slate-900",
        primaryText: "text-slate-900",
        secondaryText: "text-slate-700",
        mutedText: "text-slate-600",
        subtleText: "text-slate-500",
        iconWrap: "bg-slate-100",
        badge: "bg-slate-900 text-white hover:bg-slate-900",
        badgeMuted: "bg-slate-100 text-slate-700 hover:bg-slate-100",
        tileBg: "bg-white",
      };
}

export default function CardTrackerWebApp() {
  const [usedCards, setUsedCards] = useState(() => new Set());
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    try {
      const rawUsed = localStorage.getItem(STORAGE_KEY);
      if (rawUsed) {
        const parsed = JSON.parse(rawUsed);
        if (Array.isArray(parsed)) {
          setUsedCards(new Set(parsed));
        }
      }

      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error("Failed to load saved state", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...usedCards]));
    } catch (error) {
      console.error("Failed to save deck state", error);
    }
  }, [usedCards]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error("Failed to save theme", error);
    }
  }, [theme]);

  const markValueUsed = (value) => {
    const available = allCards.find(
      (card) => card.valueLabel === value && !usedCards.has(card.id)
    );

    if (!available) {
      return;
    }

    setUsedCards((prev) => {
      const next = new Set(prev);
      next.add(available.id);
      return next;
    });

    setHistory((prev) => [...prev, available.id]);
  };

  const undoLast = () => {
    setHistory((prev) => {
      if (prev.length === 0) {
        return prev;
      }

      const lastCardId = prev[prev.length - 1];
      setUsedCards((current) => {
        const next = new Set(current);
        next.delete(lastCardId);
        return next;
      });

      return prev.slice(0, -1);
    });
  };

  const resetDeck = () => {
    setUsedCards(new Set());
    setHistory([]);
  };

  const valueTiles = useMemo(
    () =>
      summaryValues.map((value) => {
        const total = value === "10" ? 16 : 4;
        const remaining = allCards.filter(
          (card) => card.valueLabel === value && !usedCards.has(card.id)
        ).length;

        return {
          value,
          total,
          remaining,
          ratio: remaining / total,
        };
      }),
    [usedCards]
  );

  const usedCount = usedCards.size;
  const remainingCount = 52 - usedCount;
  const percentUsed = Math.round((usedCount / 52) * 100);
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const getTileStateClasses = (ratio) => {
    if (ratio === 0) {
      return isDark
        ? "opacity-35 border border-white/5"
        : "opacity-40 border border-slate-200";
    }

    if (ratio <= 0.25) {
      return isDark
        ? "border border-white/20 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
        : "border border-slate-300 bg-white shadow-sm";
    }

    if (ratio <= 0.5) {
      return isDark
        ? "border border-white/10 bg-white/5"
        : "border border-slate-200 bg-white/90";
    }

    return isDark
      ? "border border-white/5 bg-black/20"
      : "border border-slate-200 bg-white";
  };

  return (
    <div className={`min-h-screen ${palette.page}`}>
      <div className="mx-auto max-w-md px-3 py-3 sm:px-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`overflow-hidden rounded-[28px] border bg-gradient-to-b shadow-2xl ${palette.heroCard}`}>
            <div className="p-6 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${palette.badge}`}>
                      Live Deck
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${palette.badgeMuted}`}>
                      Auto-saved
                    </span>
                  </div>
                  <h1 className={`text-3xl font-semibold tracking-tight ${palette.primaryText}`}>
                    21
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`h-10 w-10 rounded-[18px] ${palette.softButton}`}
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                  >
                    {isDark ? <Sun className="mx-auto h-5 w-5" /> : <Moon className="mx-auto h-5 w-5" />}
                  </button>
                  <div className={`rounded-2xl p-3 ${palette.iconWrap}`}>
                    <Sparkles className={`h-5 w-5 ${palette.secondaryText}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6 pt-0">
              <div className="grid grid-cols-3 gap-2">
                <div className={`rounded-[22px] p-3 backdrop-blur ${palette.softPanel}`}>
                  <div className={`text-[11px] uppercase tracking-[0.2em] ${palette.subtleText}`}>Used</div>
                  <div className={`mt-1 text-3xl font-bold ${palette.primaryText}`}>{usedCount}</div>
                </div>
                <div className={`rounded-[22px] p-3 backdrop-blur ${palette.softPanel}`}>
                  <div className={`text-[11px] uppercase tracking-[0.2em] ${palette.subtleText}`}>Left</div>
                  <div className={`mt-1 text-3xl font-bold ${palette.primaryText}`}>{remainingCount}</div>
                </div>
                <div className={`rounded-[22px] p-3 backdrop-blur ${palette.softPanel}`}>
                  <div className={`text-[11px] uppercase tracking-[0.2em] ${palette.subtleText}`}>Used %</div>
                  <div className={`mt-1 text-3xl font-bold ${palette.primaryText}`}>{percentUsed}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className={`h-3 overflow-hidden rounded-full ${palette.softPanel}`}>
                  <motion.div
                    className={`h-full rounded-full ${palette.progress}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(usedCount / 52) * 100}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  />
                </div>
                <div className={`text-xs ${palette.subtleText}`}>{remainingCount} cards still in the deck</div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  className={`h-10 rounded-[18px] px-3 ${history.length === 0 ? "cursor-not-allowed opacity-50" : ""} ${palette.softButton}`}
                  onClick={undoLast}
                  disabled={history.length === 0}
                >
                  Undo last
                </button>
                <button
                  type="button"
                  className={`h-10 rounded-[18px] px-3 ${palette.softButton}`}
                  onClick={resetDeck}
                >
                  New deck
                </button>
              </div>

              <div className={`rounded-[22px] p-3 ${palette.softPanel}`}>
                <div className={`mb-3 text-sm font-medium ${palette.secondaryText}`}>Remaining by value</div>
                <div className="grid grid-cols-5 gap-1.5">
                  {valueTiles.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`rounded-[18px] px-2.5 py-2 text-center transition active:scale-[0.98] ${getTileStateClasses(item.ratio)}`}
                      onClick={() => markValueUsed(item.value)}
                      disabled={item.remaining === 0}
                      aria-label={`Use one ${item.value} value card`}
                    >
                      <div className={`text-xs ${palette.subtleText}`}>{item.value}</div>
                      <div className={`mt-0.5 text-base font-semibold ${palette.primaryText}`}>{item.remaining}</div>
                      <div className={`mt-1 text-[10px] ${palette.subtleText}`}>
                        {remainingCount === 0 ? "0.0%" : `${((item.remaining / remainingCount) * 100).toFixed(1)}%`}
                      </div>
                      <div className={`mt-1 h-1.5 overflow-hidden rounded-full ${isDark ? "bg-white/5" : "bg-slate-200"}`}>
                        <div
                          className={`h-full rounded-full transition-all ${isDark ? "bg-white/50" : "bg-slate-500"}`}
                          style={{ width: `${item.ratio * 100}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
                <div className={`mt-2 text-center text-[11px] ${palette.subtleText}`}>
                  A and 2–9 each start with 4 cards. 10 starts with 16 cards.
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
                  {suits.map((suit) => (
                    <span key={suit.key} className={suitAccent[theme][suit.key]}>
                      {suit.symbol}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
