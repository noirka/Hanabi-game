import React from "react";

export default function CardView(props: {
  color: string;
  rank: number;
  hidden?: boolean;
}) {
  return (
    <div style={{
      width: 40,
      height: 60,
      border: "1px solid white",
      borderRadius: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
    }}>
      {props.hidden ? "??" : `${props.color[0].toUpperCase()}${props.rank}`}
    </div>
  );
}
