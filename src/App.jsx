import React, { useEffect, useMemo, useState } from "react";

const suits = [
  { key: "spades",   symbol: "♠", name: "Spades"   },
  { key: "hearts",   symbol: "♥", name: "Hearts"   },
  { key: "diamonds", symbol: "♦", name: "Diamonds" },
  { key: "clubs",    symbol: "♣", name: "Clubs"    },
];

const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const allCards = suits.flatMap((suit) =>
  ranks.map((rank) => ({
    id:         `${rank}${suit.symbol}`,
    rank,
    suit:       suit.symbol,
    suitKey:    suit.key,
    suitName:   suit.name,
    valueLabel: ["J","Q","K","10"].includes(rank) ? "10" : rank,
  }))
);

const summaryValues = ["A","2","3","4","5","6","7","8","9","10"];
const STORAGE_KEY   = "card-tracker-used-cards-v2";

const redSuits = new Set(["hearts","diamonds"]);

/* ── tiny Win2000 title-bar component ───────────────────────── */
function TitleBar({ title, icon = "🂠" }) {
  return (
    <div className="win-titlebar">
      <span className="win-titlebar-icon">{icon}</span>
      <span>{title}</span>
      <div className="win-titlebar-buttons">
        <button type="button" className="win-titlebar-btn" aria-label="Minimize">_</button>
        <button type="button" className="win-titlebar-btn" aria-label="Maximize">□</button>
        <button type="button" className="win-titlebar-btn" aria-label="Close" style={{ color: "#cc0000", fontWeight: "bold" }}>✕</button>
      </div>
    </div>
  );
}

/* ── progress bar made of "chunks" like Win2000 ─────────────── */
function ChunkyProgress({ value, max }) {
  const pct      = value / max;
  const trackW   = 100;          // we render proportionally via JS
  const chunkW   = 10;           // px per chunk (approx)
  const numFull  = Math.round(pct * 20); // 20 chunks max

  return (
    <div className="win-progress-track" style={{ width: "100%" }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="win-progress-chunk"
          style={{ opacity: i < numFull ? 1 : 0 }}
        />
      ))}
    </div>
  );
}

/* ── main app ────────────────────────────────────────────────── */
export default function CardTrackerWebApp() {
  const [usedCards,         setUsedCards]         = useState(() => new Set());
  const [showOnlyRemaining, setShowOnlyRemaining] = useState(false);
  const [selectedSuit,      setSelectedSuit]      = useState("all");

  /* persist */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUsedCards(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...usedCards]));
    } catch {}
  }, [usedCards]);

  const toggleCard = (id) =>
    setUsedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const resetDeck = () => setUsedCards(new Set());

  const groupedCards = useMemo(() =>
    suits.map((suit) => ({
      ...suit,
      cards: allCards.filter((c) => {
        const suitMatch      = selectedSuit === "all" || c.suitKey === selectedSuit;
        const sameSuit       = c.suitKey === suit.key;
        const remainingMatch = !showOnlyRemaining || !usedCards.has(c.id);
        return suitMatch && sameSuit && remainingMatch;
      }),
      used:      allCards.filter((c) => c.suitKey === suit.key && usedCards.has(c.id)).length,
      remaining: allCards.filter((c) => c.suitKey === suit.key && !usedCards.has(c.id)).length,
    })),
  [selectedSuit, showOnlyRemaining, usedCards]);

  const usedCount      = usedCards.size;
  const remainingCount = 52 - usedCount;
  const percentUsed    = Math.round((usedCount / 52) * 100);

  const remainingValueSummary = summaryValues.map((value) => ({
    value,
    remaining: allCards.filter((c) => c.valueLabel === value && !usedCards.has(c.id)).length,
  }));

  const visibleGroups = groupedCards.filter(
    (g) => selectedSuit === "all" || g.key === selectedSuit
  );

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#008080",
        backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px)",
        padding: "12px",
        fontFamily: "'Tahoma','MS Sans Serif',Arial,sans-serif",
        fontSize: "11px",
        color: "#000",
      }}
    >
      {/* ═══ Main application window ═══════════════════════════ */}
      <div
        className="win-raised"
        style={{
          maxWidth: 500,
          margin: "0 auto",
          background: "#d4d0c8",
          padding: "2px",
        }}
      >
        <TitleBar title="Card Tracker — Live Deck" icon="🂠" />

        {/* Menu bar */}
        <div
          style={{
            background: "#d4d0c8",
            borderBottom: "1px solid #808080",
            padding: "1px 4px",
            display: "flex",
            gap: "8px",
          }}
        >
          {["File","View","Deck","Help"].map((m) => (
            <button
              key={m}
              type="button"
              style={{
                background: "transparent",
                border: "none",
                cursor: "default",
                fontSize: "11px",
                padding: "1px 4px",
                fontFamily: "'Tahoma',Arial,sans-serif",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#000080"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#000"; }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div
          style={{
            background: "#d4d0c8",
            borderBottom: "2px solid",
            borderColor: "#808080 #fff #fff #808080",
            padding: "3px 4px",
            display: "flex",
            gap: "4px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button type="button" className="win-btn" onClick={resetDeck}>
            ↺ New Deck
          </button>
          <button
            type="button"
            className={`win-btn${showOnlyRemaining ? " active" : ""}`}
            onClick={() => setShowOnlyRemaining((v) => !v)}
            style={showOnlyRemaining ? { borderColor: "#404040 #fff #fff #404040" } : {}}
          >
            {showOnlyRemaining ? "👁 Showing Remaining" : "🚫 Hide Used Cards"}
          </button>
        </div>

        {/* Main content area */}
        <div style={{ padding: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>

          {/* ── Stats groupbox ─────────────────────────────── */}
          <div className="win-groupbox" style={{ marginTop: 0, padding: "8px 8px 6px" }}>
            <span className="win-groupbox-label">Deck Statistics</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", marginBottom: "6px" }}>
              {[
                { label: "Cards Used",    value: usedCount      },
                { label: "Cards Left",    value: remainingCount },
                { label: "% Used",        value: `${percentUsed}%` },
              ].map(({ label, value }) => (
                <div key={label} className="win-stat-cell">
                  <div style={{ fontSize: "10px", color: "#444", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#000080", fontFamily: "'Tahoma',Arial,sans-serif" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: "3px", fontSize: "10px" }}>Deck usage progress:</div>
            <ChunkyProgress value={usedCount} max={52} />
            <div style={{ fontSize: "10px", color: "#444", marginTop: "2px" }}>
              {remainingCount} of 52 cards still in the deck
            </div>
          </div>

          {/* ── Filter tabs ────────────────────────────────── */}
          <div>
            <div style={{ display: "flex", gap: "0" }}>
              {[{ key: "all", symbol: "All", name: "All Suits" }, ...suits].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`win-tab${selectedSuit === s.key ? " active-tab" : ""}`}
                  onClick={() => setSelectedSuit(s.key)}
                  style={
                    selectedSuit === s.key
                      ? { background: "#d4d0c8", borderColor: "#808080 #808080 transparent #fff" }
                      : { background: "#c0bbad" }
                  }
                >
                  <span
                    style={
                      s.key !== "all" && redSuits.has(s.key)
                        ? { color: "#cc0000" }
                        : {}
                    }
                  >
                    {s.symbol}
                  </span>
                  {s.key !== "all" && (
                    <span style={{ marginLeft: 2 }}>{s.name}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="win-tab-content">
              <div style={{ fontSize: "10px", color: "#444" }}>
                {selectedSuit === "all"
                  ? "Showing all 4 suits"
                  : `Showing ${suits.find((s) => s.key === selectedSuit)?.name} only`}
              </div>
            </div>
          </div>

          {/* ── Remaining by value groupbox ─────────────────── */}
          <div className="win-groupbox" style={{ marginTop: 0, padding: "8px" }}>
            <span className="win-groupbox-label">Remaining by Value</span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "3px",
              }}
            >
              {remainingValueSummary.map((item) => (
                <div key={item.value} className="win-stat-cell" style={{ padding: "3px 2px" }}>
                  <div style={{ fontSize: "10px", color: "#444" }}>{item.value}</div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: item.remaining === 0 ? "#888" : "#000080",
                    }}
                  >
                    {item.remaining}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>
              ℹ Value &quot;10&quot; includes 10, J, Q, and K.
            </div>
          </div>

          {/* ── Card suit panels ────────────────────────────── */}
          {visibleGroups.map((group) => (
            <div
              key={group.key}
              className="win-groupbox"
              style={{ marginTop: 0, padding: "6px" }}
            >
              <span className="win-groupbox-label">
                <span
                  style={
                    redSuits.has(group.key)
                      ? { color: "#cc0000", marginRight: 3 }
                      : { marginRight: 3 }
                  }
                >
                  {group.symbol}
                </span>
                {group.name}
              </span>

              {/* suit stats row */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "5px",
                  marginTop: "4px",
                  fontSize: "10px",
                  color: "#444",
                  alignItems: "center",
                }}
              >
                <span
                  className="win-sunken"
                  style={{ padding: "1px 6px", background: "#fff", fontSize: "10px" }}
                >
                  {group.remaining} remaining
                </span>
                <span
                  className="win-sunken"
                  style={{ padding: "1px 6px", background: "#fff", fontSize: "10px" }}
                >
                  {group.used} used
                </span>
                <span style={{ marginLeft: "auto" }}>13 total</span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "3px",
                }}
              >
                {group.cards.map((card) => {
                  const isUsed  = usedCards.has(card.id);
                  const isRed   = redSuits.has(card.suitKey);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      className={[
                        "win-card-btn",
                        isUsed ? "used" : "",
                        !isUsed && isRed ? "red-suit" : "",
                        isUsed && isRed ? "red-suit" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => toggleCard(card.id)}
                    >
                      {card.rank}
                      <span style={{ fontSize: "12px" }}>{card.suit}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Status bar ──────────────────────────────────── */}
        <div className="win-statusbar">
          <div className="win-statusbar-pane">
            {usedCount} card{usedCount !== 1 ? "s" : ""} used
          </div>
          <div className="win-statusbar-pane">
            {remainingCount} remaining
          </div>
          <div className="win-statusbar-pane">
            Auto-saved ✓
          </div>
          <div
            style={{
              width: 16,
              height: 16,
              background: "#d4d0c8",
              border: "1px solid #808080",
              marginLeft: "auto",
              flexShrink: 0,
            }}
          />
        </div>
      </div>

      {/* ── Taskbar ─────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#d4d0c8",
          borderTop: "2px solid #fff",
          height: "28px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "0 4px",
          zIndex: 1000,
        }}
      >
        {/* Start button */}
        <button
          type="button"
          style={{
            background: "#d4d0c8",
            border: "2px solid",
            borderColor: "#fff #404040 #404040 #fff",
            fontSize: "11px",
            fontWeight: "bold",
            fontFamily: "'Tahoma',Arial,sans-serif",
            padding: "1px 8px",
            cursor: "default",
            height: "22px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span style={{ fontSize: "14px" }}>⊞</span> Start
        </button>

        {/* Separator */}
        <div
          style={{
            width: "2px",
            height: "20px",
            borderLeft: "1px solid #808080",
            borderRight: "1px solid #fff",
            margin: "0 2px",
          }}
        />

        {/* Active task */}
        <button
          type="button"
          style={{
            background: "#b8b4ac",
            border: "2px solid",
            borderColor: "#404040 #fff #fff #404040",
            fontSize: "11px",
            fontFamily: "'Tahoma',Arial,sans-serif",
            padding: "1px 8px",
            cursor: "default",
            height: "22px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          🂠 Card Tracker — Live Deck
        </button>

        {/* System tray */}
        <div
          style={{
            marginLeft: "auto",
            border: "1px solid",
            borderColor: "#808080 #fff #fff #808080",
            padding: "1px 6px",
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            height: "22px",
          }}
        >
          <span>📶</span>
          <span>🔊</span>
          <span id="taskbar-clock">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Bottom padding so content clears taskbar */}
      <div style={{ height: 36 }} />
    </div>
  );
}
