import { NextResponse, NextRequest } from "next/server";
import { deleteLink, getLinkByCode } from "@/lib/links";

export async function GET(req: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params; // 🔥 FIXED

  const link = await getLinkByCode(code);
  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ link });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params; // 🔥 FIXED

  const ok = await deleteLink(code);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
