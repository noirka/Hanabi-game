import type { Card } from "@/types";
import CardView from "./CardView";

export function DiscardPile({ discard }: { discard: Card[] }) {
    const last = discard.slice(-8).reverse();

    return (
        <div>
            <h4>Discard ({discard.length})</h4>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {last.map((c) => (
                    <CardView
                        key={c.id}
                        card={c} 
                        isMyCard={false} 
                    />
                ))}
            </div>
        </div>
    );
}