import React from "react";
import type { Card } from "../game/types";

export function CardView({ card, hidden }: { card: Card | null; hidden?: boolean }) {
  if (hidden || !card) {
    return (
      <div className="card hidden-card">
        ?
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-color">{card.color}</div>
      <div className="card-rank">{card.rank}</div>
    </div>
  );
}
