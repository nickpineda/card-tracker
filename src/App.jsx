import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const STORAGE_KEY = "twentyone-speed-counts-v1";
const THEME_KEY = "twentyone-speed-theme-v1";

const startingCounts = {
  A: 4,
  2: 4,
  3: 4,
  4: 4,
  5: 4,
  6: 4,
  7: 4,
  8: 4,
  9: 4,
  10: 16,
};

function getPalette(isDark) {
  return isDark
    ? {
        page: "bg-black text-white",
        card: "border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950",
        panel: "bg-white/5",
        tileBase: "bg-black/20 border-white/5",
        tileMid: "bg-white/5 border-white/10",
        tileLow: "bg-white/10 border-white/20",
        tileEmpty: "bg-white/5 border-white/5 opacity-35",
        text: "text-white",
        subtle: "text-zinc-400",
        button: "bg-white/8 text-white hover:bg-white/15",
      }
    : {
        page: "bg-gradient-to-b from-slate-50 to-white text-slate-900",
        card: "border-slate-200 bg-gradient-to-b from-white to-slate-50",
        panel: "bg-slate-100",
        tileBase: "bg-white border-slate-200",
        tileMid: "bg-white/90 border-slate-200",
        tileLow: "bg-white border-slate-300 shadow-sm",
        tileEmpty: "bg-slate-100 border-slate-200 opacity-45",
        text: "text-slate-900",
        subtle: "text-slate-500",
        button: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      };
}

export default function TwentyOneCounter() {
  const [counts, setCounts] = useState(startingCounts);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    try {
      const savedCounts = localStorage.getItem(STORAGE_KEY);
      if (savedCounts) {
        const parsed = JSON.parse(savedCounts);
        setCounts({ ...startingCounts, ...parsed });
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    } catch (error) {
      console.error("Failed to save counts", error);
    }
  }, [counts]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error("Failed to save theme", error);
    }
  }, [theme]);

  const totalRemaining = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts]
  );

  const tiles = useMemo(
    () =>
      values.map((value) => {
        const total = startingCounts[value];
        const remaining = counts[value] ?? total;
        return {
          value,
          total,
          remaining,
          ratio: remaining / total,
          probability: totalRemaining === 0 ? 0 : (remaining / totalRemaining) * 100,
        };
      }),
    [counts, totalRemaining]
  );

  const useValue = (value) => {
    const current = counts[value] ?? startingCounts[value];
    if (current <= 0) return;

    setCounts((prev) => ({
      ...prev,
      [value]: (prev[value] ?? startingCounts[value]) - 1,
    }));
    setHistory((prev) => [...prev, value]);
  };

  const undoLast = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setCounts((current) => ({
        ...current,
        [last]: Math.min((current[last] ?? startingCounts[last]) + 1, startingCounts[last]),
      }));
      return prev.slice(0, -1);
    });
  };

  const newDeck = () => {
    setCounts(startingCounts);
    setHistory([]);
  };

  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const tileStateClass = (ratio) => {
    if (ratio === 0) return palette.tileEmpty;
    if (ratio <= 0.25) return palette.tileLow;
    if (ratio <= 0.5) return palette.tileMid;
    return palette.tileBase;
  };

  return (
    <div className={`min-h-screen ${palette.page}`}>
      <div className="mx-auto max-w-md px-3 py-4 sm:px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`overflow-hidden rounded-[28px] border shadow-2xl ${palette.card}`}>
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h1 className={`text-2xl font-semibold ${palette.text}`}>21</h1>
                  <div className={`text-sm ${palette.subtle}`}>{totalRemaining} cards left</div>
                </div>
                <button
                  type="button"
                  className={`rounded-[18px] px-3 py-2 text-sm ${palette.button}`}
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                >
                  {isDark ? "Light" : "Dark"}
                </button>
              </div>

              <div className={`rounded-[24px] p-3 ${palette.panel}`}>
                <div className="grid grid-cols-5 gap-2">
                  {tiles.map((tile) => (
                    <button
                      key={tile.value}
                      type="button"
                      onClick={() => useValue(tile.value)}
                      disabled={tile.remaining === 0}
                      className={`rounded-[22px] border px-2 py-5 text-center transition active:scale-[0.97] ${tileStateClass(tile.ratio)}`}
                    >
                      <div className={`text-[11px] font-medium ${palette.subtle}`}>{tile.remaining} left</div>
                      <div className={`mt-1 text-2xl font-semibold ${palette.text}`}>{tile.value}</div>
                      <div className={`mt-1 text-[11px] ${palette.subtle}`}>{tile.probability.toFixed(1)}%</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={undoLast}
                  disabled={history.length === 0}
                  className={`rounded-[18px] px-3 py-3 text-base ${palette.button} ${history.length === 0 ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  Undo last
                </button>
                <button
                  type="button"
                  onClick={newDeck}
                  className={`rounded-[18px] px-3 py-3 text-base ${palette.button}`}
                >
                  New deck
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
