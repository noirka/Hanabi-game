import React, { useEffect, useRef } from "react";

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
        const important =
          line.includes("strike") ||
          line.includes("discard") ||
          line.includes("finished") ||
          line.includes("Perfect");

        return (
          <div
            key={i}
            style={{
              padding: "2px 0",
              color: important ? "#ff5252" : "#ddd",
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
}
