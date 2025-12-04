export function FireworksView({ fireworks }: {
  fireworks: Record<string, number>;
}) {
  return (
    <div style={{ margin: "12px 0" }}>
      <h4>Fireworks:</h4>
      {Object.entries(fireworks).map(([color, val]) => (
        <div key={color}>
          {color}: {val}
        </div>
      ))}
    </div>
  );
}
