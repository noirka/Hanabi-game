import { useEffect, useRef } from "react";

function prettify(line: string): string {
  if (line.includes("Bot thinking:")) return "";
  
  if (line.includes("bot_play")) {
    const { card } = JSON.parse(line.split("bot_play:")[1]);
    return `Bot played: ${card.color} ${card.rank}`;
  }
  if (line.includes("bot_discard")) {
    const { card } = JSON.parse(line.split("bot_discard:")[1]);
    return `Bot discarded: ${card.color} ${card.rank}`;
  }
  if (line.includes("bot_hint")) {
    const { target, color, rank } = JSON.parse(
      line.split("bot_hint:")[1]
    );
    return `Bot hinted ${color ?? rank} to ${target}`;
  }

  return line;
}

export function GameLog({ lines }: { lines: string[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const visible = lines.slice(-100).reverse();

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;
    div.scrollTop = 0;
  }, [lines]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 260,
        overflowY: "auto",
        background: "#111",
        padding: 8,
        borderRadius: 6,
        fontSize: 12,
        color: "white",
      }}
    >
      {visible.map((line, i) => {
        const text = prettify(line);
        if (!text) return null;
        
        const important =
          text.includes("strike") ||
          text.includes("discard") ||
          text.includes("finished") ||
          text.includes("Perfect");

        return (
          <div
            key={i}
            style={{
              padding: "2px 0",
              color: important ? "#ff5252" : "#ddd",
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}
