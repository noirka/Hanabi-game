import type { GameSnapshot } from "../game/types";

export function GameLog({ lines }: { lines: string[] }) {
  return (
    <div
      style={{
        background: "#1b1b1b",
        padding: "8px",
        borderRadius: "6px",
        color: "#ddd",
        height: "200px",
        overflowY: "auto",
        fontSize: "12px",
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ marginBottom: "2px" }}>
          {line}
        </div>
      ))}
    </div>
  );
}
