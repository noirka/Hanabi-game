import type { Card } from "../game/types";

const CARD_COLORS: Record<string, string> = {
  red: "#c62828",
  blue: "#1565c0",
  green: "#2e7d32",
  yellow: "#f9a825",
  white: "#e0e0e0",
};

export function CardView({ card, hidden }: { card: Card; hidden?: boolean }) {
  if (hidden) {
    return (
      <div style={{
        width: 72, height: 96, borderRadius: 6, background: "#333",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#aaa", border: "1px solid #666"
      }}>
        ?
      </div>
    );
  }

  const bg = CARD_COLORS[card.color];
  const textColor = card.color === "yellow" || card.color === "white" ? "#000" : "#fff";

  return (
    <div style={{
      width: 72, height: 96, borderRadius: 6,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: bg, color: textColor,
      border: "2px solid #000", fontWeight: 700
    }}>
      <div>{card.color}</div>
      <div style={{ fontSize: 24 }}>{card.rank}</div>
    </div>
  );
}
