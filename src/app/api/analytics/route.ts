import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (process.env.NODE_ENV === "development") {
    console.info("Evento de analítica", payload);
  }
  return NextResponse.json({ ok: true });
}
