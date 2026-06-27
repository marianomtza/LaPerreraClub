import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#ff082d",
          color: "#fff7ee",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          fontSize: 30,
          fontStyle: "italic",
          fontWeight: 900,
          height: "100%",
          justifyContent: "center",
          width: "100%"
        }}
      >
        LP
      </div>
    ),
    size
  );
}
