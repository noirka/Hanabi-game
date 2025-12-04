import React from "react";
import type { Player } from "../game/types";
import { CardView } from "./CardView";

export function HandView({ player }: { player: Player }) {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {player.hand.map((c) => (
        <CardView key={c.id} card={c} />
      ))}
    </div>
  );
}
