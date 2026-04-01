import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Eye, EyeOff, Sparkles, Moon, Sun } from "lucide-react";

const suits = [
  { key: "spades", symbol: "♠", name: "Spades" },
  { key: "hearts", symbol: "♥", name: "Hearts" },
  { key: "diamonds", symbol: "♦", name: "Diamonds" },
  { key: "clubs", symbol: "♣", name: "Clubs" },
];

const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const allCards = suits.flatMap((suit) =>
  ranks.map((rank) => ({
    id: `${rank}${suit.symbol}`,
    rank,
    suit: suit.symbol,
    suitKey: suit.key,
    suitName: suit.name,
    valueLabel: ["J", "Q", "K", "10"].includes(rank) ? "10" : rank,
  }))
);

const summaryValues = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const STORAGE_KEY = "card-tracker-used-cards-v2";
const THEME_KEY = "card-tracker-theme-v1";

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

export default function CardTrackerWebApp() {
  const [usedCards, setUsedCards] = useState(() => new Set());
  const [showOnlyRemaining, setShowOnlyRemaining] = useState(false);
  const [selectedSuit, setSelectedSuit] = useState("all");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUsedCards(new Set(JSON.parse(raw)));
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    } catch (error) {
      console.error("Failed to load deck state", error);
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

  const toggleCard = (cardId) => {
    setUsedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const resetDeck = () => setUsedCards(new Set());

  const groupedCards = useMemo(() => {
    return suits.map((suit) => ({
      ...suit,
      cards: allCards.filter((card) => {
        const suitMatch = selectedSuit === "all" || card.suitKey === selectedSuit;
        const sameSuit = card.suitKey === suit.key;
        const remainingMatch = !showOnlyRemaining || !usedCards.has(card.id);
        return suitMatch && sameSuit && remainingMatch;
      }),
      used: allCards.filter((card) => card.suitKey === suit.key && usedCards.has(card.id)).length,
      remaining: allCards.filter((card) => card.suitKey === suit.key && !usedCards.has(card.id)).length,
    }));
  }, [selectedSuit, showOnlyRemaining, usedCards]);

  const usedCount = usedCards.size;
  const remainingCount = 52 - usedCount;
  const percentUsed = Math.round((usedCount / 52) * 100);

  const remainingValueSummary = summaryValues.map((value) => ({
    value,
    remaining: allCards.filter(
      (card) => card.valueLabel === value && !usedCards.has(card.id)
    ).length,
  }));

  const isDark = theme === "dark";
  const palette = isDark
    ? {
        page: "bg-black text-white",
        heroCard: "from-zinc-900 to-zinc-950 border-white/10",
        sectionCard: "bg-zinc-950 border-white/10",
        softPanel: "bg-white/5",
        softButton: "bg-white/8 text-white hover:bg-white/15",
        activeButton: "bg-white text-black hover:bg-white/90",
        inactiveButton: "bg-white/8 text-white hover:bg-white/15",
        progress: "bg-white",
        primaryText: "text-white",
        secondaryText: "text-zinc-200",
        mutedText: "text-zinc-300",
        subtleText: "text-zinc-400",
        cardUsed: "border-white/5 bg-white/5 text-zinc-500 line-through",
        cardUnused: "border-white/10 bg-zinc-900 text-white shadow-sm",
        iconWrap: "bg-white/5",
        badge: "bg-white/10 text-white hover:bg-white/10",
        badgeMuted: "bg-white/5 text-zinc-300 hover:bg-white/5",
      }
    : {
        page: "bg-gradient-to-b from-slate-50 to-white text-slate-900",
        heroCard: "from-white to-slate-50 border-slate-200",
        sectionCard: "bg-white border-slate-200",
        softPanel: "bg-slate-100",
        softButton: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        activeButton: "bg-slate-900 text-white hover:bg-slate-800",
        inactiveButton: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        progress: "bg-slate-900",
        primaryText: "text-slate-900",
        secondaryText: "text-slate-700",
        mutedText: "text-slate-600",
        subtleText: "text-slate-500",
        cardUsed: "border-slate-200 bg-slate-100 text-slate-400 line-through",
        cardUnused: "border-slate-200 bg-white text-slate-900 shadow-sm",
        iconWrap: "bg-slate-100",
        badge: "bg-slate-900 text-white hover:bg-slate-900",
        badgeMuted: "bg-slate-100 text-slate-700 hover:bg-slate-100",
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
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${palette.badge}`}>Live Deck</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${palette.badgeMuted}`}>Auto-saved</span>
                  </div>
                  <h1 className={`text-3xl font-semibold tracking-tight ${palette.primaryText}`}>Card Tracker</h1>
                  <p className={`mt-1 text-sm ${palette.mutedText}`}>Tap cards to mark them used. Tap again to restore them.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`rounded-[18px] h-10 w-10 border-0 ${palette.softButton}`}
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                  >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
                  className={`rounded-[18px] h-10 px-3 border-0 ${palette.softButton}`}
                  onClick={() => setShowOnlyRemaining((v) => !v)}
                >
                  {showOnlyRemaining ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                  {showOnlyRemaining ? "Showing remaining" : "Hide used cards"}
                </button>
                <button
                  type="button"
                  className={`rounded-[18px] h-10 px-3 border-0 ${palette.softButton}`}
                  onClick={resetDeck}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New deck
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSuit("all")}
                  className={`rounded-[18px] h-10 ${selectedSuit === "all" ? palette.activeButton : palette.inactiveButton}`}
                >
                  All
                </button>
                {suits.map((suit) => (
                  <button
                    type="button"
                    key={suit.key}
                    onClick={() => setSelectedSuit(suit.key)}
                    className={`rounded-[18px] h-10 text-base ${selectedSuit === suit.key ? palette.activeButton : palette.inactiveButton}`}
                  >
                    {suit.symbol}
                  </button>
                ))}
              </div>

              <div className={`rounded-[22px] p-3 ${palette.softPanel}`}>
                <div className={`mb-3 text-sm font-medium ${palette.secondaryText}`}>
                  Remaining by value
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {remainingValueSummary.map((item) => (
                    <div
                      key={item.value}
                      className={`rounded-[18px] px-2.5 py-2 text-center ${isDark ? "bg-black/20" : "bg-white"}`}
                    >
                      <div className={`text-xs ${palette.subtleText}`}>{item.value}</div>
                      <div className={`mt-0.5 text-base font-semibold ${palette.primaryText}`}>
                        {item.remaining}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`mt-2 text-[11px] ${palette.subtleText}`}>
                  10 includes 10, J, Q, and K.
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-3 space-y-3">
          {groupedCards
            .filter((group) => selectedSuit === "all" || group.key === selectedSuit)
            .map((group, index) => (
              <motion.div
                key={group.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className={`rounded-[24px] border shadow-xl ${palette.sectionCard}`}>
                  <div className="p-3.5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl ${suitAccent[theme][group.key]}`}>{group.symbol}</div>
                        <div>
                          <div className={`text-base font-semibold ${palette.primaryText}`}>{group.name}</div>
                          <div className={`text-xs ${palette.subtleText}`}>{group.remaining} remaining · {group.used} used</div>
                        </div>
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${palette.badgeMuted}`}>13 total</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {group.cards.map((card) => {
                        const isUsed = usedCards.has(card.id);
                        return (
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            key={card.id}
                            onClick={() => toggleCard(card.id)}
                            className={`rounded-[18px] border px-2 py-2.5 text-sm font-semibold transition ${isUsed ? palette.cardUsed : palette.cardUnused}`}
                          >
                            <span className={isUsed ? "" : suitAccent[theme][card.suitKey]}>
                              {card.rank}{card.suit}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
