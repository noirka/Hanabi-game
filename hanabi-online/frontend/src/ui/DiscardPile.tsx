import { CardView } from "./CardView";

export function DiscardPile({ discard }: { discard: any[] }) {
  return (
    <div>
      <h4>Discard pile</h4>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {discard.map((c) => (
          <CardView key={c.id} card={c} />
        ))}
      </div>
    </div>
  );
}
