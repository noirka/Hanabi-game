import type { Card } from "../game/types";

export function DiscardPile({ discard }: { discard: Card[] }) {
  const last = discard.slice(-8).reverse(); 
  return (
    <div>
      <h4>Discard ({discard.length})</h4>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {last.map((c) => (
          <div
            key={c.id}
            style={{
              width: 64,
              height: 80,
              borderRadius: 6,
              background: "#ddd",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            <div style={{ textTransform: "capitalize" }}>{c.color}</div>
            <div style={{ fontWeight: 700 }}>{c.rank}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
