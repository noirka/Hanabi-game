import React from "react";
import type { Card } from "../game/types";

export function CardView({ card }: { card: Card }) {
  return (
    <div style={{
      border: "1px solid #666",
      borderRadius: "6px",
      width: "60px",
      height: "80px",
      padding: "4px",
      background: "#222",
      color: card.color,
      fontWeight: "bold",
      textAlign: "center",
    }}>
      <div>{card.color}</div>
      <div style={{ fontSize: "22px" }}>{card.rank}</div>
    </div>
  );
}
