import { NextResponse } from "next/server";
import { createLink, getAllLinks } from "@/lib/links";

export async function GET() {
  const links = await getAllLinks();
  return NextResponse.json({ links });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { url, code } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const link = await createLink(url, code || undefined);
    return NextResponse.json({ link }, { status: 201 });
  } catch (err: any) {
    if (err.message === "DUPLICATE_CODE") {
      return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
