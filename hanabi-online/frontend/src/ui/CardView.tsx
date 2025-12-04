import type { Card } from "../game/types";

export function CardView({ card, hidden }: { card: Card; hidden?: boolean }) {
  if (hidden) {
    return (
      <div style={{
        width: 72, height: 96, borderRadius: 6, background: "#444",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc"
      }}>
        <span>?</span>
      </div>
    );
  }

  return (
    <div style={{
      width: 72, height: 96, borderRadius: 6, background: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
    }}>
      <div style={{ fontSize: 12, textTransform: "capitalize" }}>{card.color}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{card.rank}</div>
    </div>
  );
}
