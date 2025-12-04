import type { Fireworks } from "../game/types";

export function FireworksView({ fireworks }: { fireworks: Fireworks }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Object.entries(fireworks).map(([color, val]) => (
        <div key={color} style={{
          minWidth: 72, padding: 8, borderRadius: 6, background: "#2b2b2b", color: "#fff", textAlign: "center"
        }}>
          <div style={{ textTransform: "capitalize", fontSize: 12 }}>{color}</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{val}</div>
        </div>
      ))}
    </div>
  );
}
