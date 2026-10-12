import { ImageResponse } from "next/og";

interface RouteContext {
  params: Promise<{ size: string }>;
}

// Tamaños acotados: evita generar imágenes arbitrariamente grandes.
export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const { size: rawSize } = await params;
  if (rawSize !== "192" && rawSize !== "512") {
    return new Response("Not found", { status: 404 });
  }

  const size = Number(rawSize);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f7c600",
        borderRadius: size * 0.18,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "72%",
          height: "72%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size * 0.2,
          backgroundColor: "#123d73",
          color: "#ffffff",
          fontSize: size * 0.3,
          fontWeight: 900,
        }}
      >
        RC
      </div>
      <div style={{ display: "flex", position: "absolute", bottom: 0, left: 0, width: "100%", height: "12%" }}>
        <div style={{ display: "flex", flex: 2, backgroundColor: "#f7c600" }} />
        <div style={{ display: "flex", flex: 1, backgroundColor: "#123d73" }} />
        <div style={{ display: "flex", flex: 1, backgroundColor: "#c92d39" }} />
      </div>
    </div>,
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
