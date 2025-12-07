import type { Card } from "../game/types";

const BG: Record<string, string> = {
  red: "#b52a2a",
  blue: "#3354ff",
  green: "#2bb551",
  yellow: "#c9c92c",
  white: "#eee"
};

const TEXT: Record<string, string> = {
  red: "white",
  blue: "white",
  green: "white",
  yellow: "black",
  white: "black"
};

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
              background: BG[c.color],
              color: TEXT[c.color],
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700
            }}
          >
            <div style={{ textTransform: "capitalize" }}>{c.color}</div>
            <div>{c.rank}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
