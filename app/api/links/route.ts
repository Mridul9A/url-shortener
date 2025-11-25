import { NextResponse, NextRequest } from "next/server";
import { createLink, getAllLinks } from "@/lib/links";

export async function GET() {
  try {
    const links = await getAllLinks();
    return NextResponse.json({ links });
  } catch (err) {
    console.error("GET /api/links error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = (body.url ?? "").trim();
    const code = (body.code ?? "").trim() || undefined;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    const link = await createLink(url, code);
    return NextResponse.json({ link }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/links error:", err);

    if (err?.message === "DUPLICATE_CODE") {
      return NextResponse.json(
        { error: "Code already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
