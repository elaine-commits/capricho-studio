import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ status: "ok", app: "STUDIO", version: "0.3.0" });
}
